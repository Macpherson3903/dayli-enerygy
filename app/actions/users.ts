"use server";

import { revalidatePath } from "next/cache";
import { getAppRole } from "@/lib/auth/roles";
import {
  ensureCurrentUserInDb,
  syncAllUsersFromClerk,
} from "@/lib/auth/sync-user";

export async function ensureCurrentUserInDbAction(): Promise<void> {
  await ensureCurrentUserInDb();
}

export async function syncUsersFromClerkAction(): Promise<{
  error?: string;
  synced?: number;
}> {
  const role = await getAppRole();
  if (role !== "sales_admin") {
    return { error: "Not allowed" };
  }
  try {
    const { synced } = await syncAllUsersFromClerk();
    revalidatePath("/admin/sales");
    revalidatePath("/admin/sales/users");
    return { synced };
  } catch (e) {
    console.error("[users] Sync from Clerk failed", e);
    return { error: "Could not sync users from Clerk." };
  }
}
