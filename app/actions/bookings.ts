"use server";

import { revalidatePath } from "next/cache";
import { getAppRole } from "@/lib/auth/roles";
import { updateInstallationBookingById } from "@/lib/db/installation-bookings";
import { installationBookingStatusUpdateSchema } from "@/lib/validators";

export async function updateInstallationBookingStatusAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) {
    return { error: "Missing booking" };
  }

  const role = await getAppRole();
  if (role !== "sales_admin") {
    return { error: "Not allowed" };
  }

  const status = String(formData.get("status") ?? "");
  const internalNotes = String(formData.get("internalNotes") ?? "");
  const parsed = installationBookingStatusUpdateSchema.safeParse({
    status,
    internalNotes,
  });
  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  await updateInstallationBookingById(bookingId, {
    status: parsed.data.status,
    internalNotes: parsed.data.internalNotes,
  });
  revalidatePath("/admin/sales");
  revalidatePath("/admin/sales/bookings");
  revalidatePath(`/admin/sales/bookings/${bookingId}`);
  revalidatePath("/account");
  revalidatePath("/account/bookings");
  return { ok: true as const };
}
