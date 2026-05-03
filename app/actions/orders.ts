"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createOrder } from "@/lib/db/orders";
import { createOrderSchema, orderStatusUpdateSchema } from "@/lib/validators";
import { assertLineItemsValid } from "@/lib/order-validate-line-items";
import { rateLimitCheck } from "@/lib/rate-limit";
import { sendNewOrderEmail, sendOrderConfirmationToCustomer } from "@/lib/email";
import { updateOrderById } from "@/lib/db/orders";
import { getAppRole } from "@/lib/auth/roles";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export async function submitOrderRequest(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const lim = rateLimitCheck(ip, "order");
  if (!lim.ok) {
    return {
      error: `Too many requests. Please wait ${lim.retryAfter ?? 60} seconds.`,
    };
  }

  const lineItemsJson = formData.get("lineItems");
  if (typeof lineItemsJson !== "string") {
    return { error: "Invalid cart data." };
  }
  let lineItems: unknown;
  try {
    lineItems = JSON.parse(lineItemsJson);
  } catch {
    return { error: "Invalid cart data." };
  }

  const { userId } = await auth();
  if (!userId) {
    return {
      error:
        "You must be signed in to submit an order. Use Sign up or Sign in on the cart page.",
    };
  }

  const raw = {
    lineItems,
    contact: {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      notes: String(formData.get("notes") ?? "") || undefined,
      preferredTime:
        String(formData.get("preferredTime") ?? "") || undefined,
    },
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
    userId,
  };

  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0] ?? "Invalid form";
    return { error: first };
  }

  try {
    await assertLineItemsValid(parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Validation failed" };
  }

  const res = await createOrder(parsed.data);
  const appUrl = getAppUrl();
  const orderId = res._id.toString();

  await sendNewOrderEmail({
    orderNumber: res.orderNumber,
    contactName: parsed.data.contact.name,
    contactEmail: parsed.data.contact.email,
    contactPhone: parsed.data.contact.phone,
    lineCount: parsed.data.lineItems.length,
    appUrl,
  });

  await sendOrderConfirmationToCustomer({
    to: parsed.data.contact.email,
    orderNumber: res.orderNumber,
    appUrl,
  });

  revalidatePath("/account");
  revalidatePath("/admin/sales");
  redirect(
    `/checkout/confirmation?orderId=${encodeURIComponent(
      orderId
    )}&orderNumber=${encodeURIComponent(res.orderNumber)}`
  );
}

export async function updateOrderStatusAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) {
    return { error: "Missing order" };
  }
  const role = await getAppRole();
  if (role !== "sales_admin") {
    return { error: "Not allowed" };
  }
  const status = String(formData.get("status") ?? "");
  const internalNotes = String(formData.get("internalNotes") ?? "");
  const parsed = orderStatusUpdateSchema.safeParse({ status, internalNotes });
  if (!parsed.success) {
    return { error: "Invalid data" };
  }
  await updateOrderById(orderId, {
    status: parsed.data.status,
    internalNotes,
  });
  revalidatePath("/admin/sales");
  revalidatePath("/account");
  revalidatePath(`/admin/sales/orders/${orderId}`);
  return { ok: true as const };
}
