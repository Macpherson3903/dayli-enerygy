"use server";

import { revalidatePath } from "next/cache";
import { getAppRole } from "@/lib/auth/roles";
import {
  createQuotationAppliance,
  deleteQuotationAppliance,
  updateQuotationAppliance,
} from "@/lib/db/quotation-appliances";
import {
  firstZodErrorMessage,
  quotationApplianceSheetInputSchema,
  quotationApplianceSheetUpdateSchema,
} from "@/lib/validators";
import type { QuotationAppliance } from "@/lib/content/quotation";

function revalidateSheet() {
  revalidatePath("/installation-booking");
  revalidatePath("/quotation");
  revalidatePath("/admin/sales/sizing");
  revalidatePath("/admin/sales/appliance-sheet");
}

async function requireSales() {
  const role = await getAppRole();
  if (role !== "sales_admin") return false;
  return true;
}

export async function createQuotationApplianceAction(
  input: unknown
): Promise<{
  error?: string;
  ok?: boolean;
  appliance?: QuotationAppliance;
}> {
  if (!(await requireSales())) return { error: "Not allowed" };
  const parsed = quotationApplianceSheetInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstZodErrorMessage(parsed.error, "Invalid appliance") };
  }
  const row = await createQuotationAppliance(parsed.data);
  revalidateSheet();
  return {
    ok: true,
    appliance: {
      id: row.id,
      name: row.name,
      watts: row.watts,
      defaultHoursPerDay: row.defaultHoursPerDay,
    },
  };
}

export async function updateQuotationApplianceAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  if (!(await requireSales())) return { error: "Not allowed" };
  const watts = Number(formData.get("watts"));
  const defaultHoursPerDay = Number(formData.get("defaultHoursPerDay"));
  const sortRaw = String(formData.get("sortOrder") ?? "").trim();
  const parsed = quotationApplianceSheetUpdateSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    watts: Number.isFinite(watts) ? watts : NaN,
    defaultHoursPerDay: Number.isFinite(defaultHoursPerDay)
      ? defaultHoursPerDay
      : NaN,
    sortOrder: sortRaw === "" ? undefined : Number(sortRaw),
  });
  if (!parsed.success) {
    return { error: firstZodErrorMessage(parsed.error, "Invalid appliance") };
  }
  const { id, ...rest } = parsed.data;
  const ok = await updateQuotationAppliance(id, rest);
  if (!ok) return { error: "Could not update" };
  revalidateSheet();
  return { ok: true };
}

export async function deleteQuotationApplianceAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  if (!(await requireSales())) return { error: "Not allowed" };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing appliance" };
  const ok = await deleteQuotationAppliance(id);
  if (!ok) return { error: "Could not delete" };
  revalidateSheet();
  return { ok: true };
}

export async function addQuotationApplianceFormAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const watts = Number(formData.get("watts"));
  const defaultHoursPerDay = Number(formData.get("defaultHoursPerDay"));
  const result = await createQuotationApplianceAction({
    name: String(formData.get("name") ?? ""),
    watts: Number.isFinite(watts) ? watts : NaN,
    defaultHoursPerDay: Number.isFinite(defaultHoursPerDay)
      ? defaultHoursPerDay
      : NaN,
  });
  if (result.error) return { error: result.error };
  return { ok: true };
}
