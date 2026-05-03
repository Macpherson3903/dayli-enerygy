"use server";

import { revalidatePath } from "next/cache";
import { productAgentInquiryUpdateSchema } from "@/lib/validators";
import {
  getProductAgentInquiryById,
  updateProductAgentInquiryById,
} from "@/lib/db/product-agent-inquiries";
import { getAppRole } from "@/lib/auth/roles";

export async function updateProductAgentInquiryAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const role = await getAppRole();
  if (role !== "sales_admin") {
    return { error: "Not allowed" };
  }
  const id = String(formData.get("inquiryId") ?? "");
  if (!id) {
    return { error: "Missing inquiry" };
  }
  const existing = await getProductAgentInquiryById(id);
  if (!existing) {
    return { error: "Inquiry not found" };
  }
  const status = String(formData.get("status") ?? "");
  const internalNotes = String(formData.get("internalNotes") ?? "");
  const parsed = productAgentInquiryUpdateSchema.safeParse({ status, internalNotes });
  if (!parsed.success) {
    return { error: "Invalid data" };
  }
  const ok = await updateProductAgentInquiryById(id, parsed.data);
  if (!ok) {
    return { error: "Could not update" };
  }
  revalidatePath("/admin/sales");
  revalidatePath("/admin/sales/product-inquiries");
  revalidatePath(`/admin/sales/product-inquiries/${id}`);
  return { ok: true as const };
}
