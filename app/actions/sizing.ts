"use server";

import { revalidatePath } from "next/cache";
import { getAppRole, requireAuth } from "@/lib/auth/roles";
import { createSizingCalculation } from "@/lib/db/sizing-calculations";
import {
  firstZodErrorMessage,
  sizingCalculationInputSchema,
} from "@/lib/validators";

export async function saveSizingCalculationAction(
  input: unknown
): Promise<{
  error?: string;
  ok?: boolean;
  id?: string;
  sizingNumber?: string;
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

  const parsed = sizingCalculationInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstZodErrorMessage(parsed.error, "Invalid calculation") };
  }
  if (parsed.data.totals.peakLoadW <= 0 && parsed.data.totals.dailyEnergyWh <= 0) {
    return { error: "Enter at least one appliance quantity before saving." };
  }

  const created = await createSizingCalculation(parsed.data, userId);
  revalidatePath("/admin/sales/sizing");
  revalidatePath("/admin/sales/saved-sizings");
  revalidatePath(`/admin/sales/sizing/${created._id.toString()}`);
  revalidatePath(`/admin/sales/saved-sizings/${created._id.toString()}`);
  return {
    ok: true,
    id: created._id.toString(),
    sizingNumber: created.sizingNumber,
  };
}
