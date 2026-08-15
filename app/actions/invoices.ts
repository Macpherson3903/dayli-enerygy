"use server";

import { revalidatePath } from "next/cache";
import { getAppRole, requireAuth } from "@/lib/auth/roles";
import { createInvoice } from "@/lib/db/invoices";
import { createInvoiceSchema, firstZodErrorMessage } from "@/lib/validators";

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
