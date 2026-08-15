"use server";

import { revalidatePath } from "next/cache";
import { getAppRole, requireAuth } from "@/lib/auth/roles";
import { createInvoice, getInvoiceById, recordInvoiceEmailSent } from "@/lib/db/invoices";
import { sendInvoiceToRecipient } from "@/lib/email";
import {
  createInvoiceSchema,
  firstZodErrorMessage,
  sendInvoiceEmailSchema,
} from "@/lib/validators";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export async function createInvoiceAction(input: unknown): Promise<{
  error?: string;
  ok?: boolean;
  id?: string;
  workOrderNumber?: string;
}> {
  const role = await getAppRole();
  if (role !== "sales_admin") {
    return { error: "Not allowed" };
  }
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return { error: "Not signed in" };
  }

  const parsed = createInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstZodErrorMessage(parsed.error, "Check invoice fields") };
  }

  try {
    const created = await createInvoice(parsed.data, userId);
    revalidatePath("/admin/sales");
    revalidatePath("/admin/sales/invoices");
    revalidatePath(`/admin/sales/invoices/${created._id.toString()}`);
    return {
      ok: true,
      id: created._id.toString(),
      workOrderNumber: created.workOrderNumber,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save invoice";
    return { error: message };
  }
}

export async function sendInvoiceEmailAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const role = await getAppRole();
  if (role !== "sales_admin") {
    return { error: "Not allowed" };
  }

  const parsed = sendInvoiceEmailSchema.safeParse({
    invoiceId: String(formData.get("invoiceId") ?? ""),
    to: String(formData.get("to") ?? ""),
  });
  if (!parsed.success) {
    return { error: firstZodErrorMessage(parsed.error, "Enter a valid email") };
  }

  const invoice = await getInvoiceById(parsed.data.invoiceId);
  if (!invoice) {
    return { error: "Invoice not found" };
  }

  const sent = await sendInvoiceToRecipient({
    to: parsed.data.to,
    invoice,
    appUrl: getAppUrl(),
  });
  if (!sent) {
    return {
      error:
        "Could not send email. Check SMTP settings (SMTP_HOST, SMTP_USER, SMTP_PASS).",
    };
  }

  await recordInvoiceEmailSent(parsed.data.invoiceId, parsed.data.to);
  revalidatePath("/admin/sales/invoices");
  revalidatePath(`/admin/sales/invoices/${parsed.data.invoiceId}`);
  return { ok: true };
}
