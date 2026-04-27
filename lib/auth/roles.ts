import { auth, currentUser } from "@clerk/nextjs/server";
import type { AppRole } from "@/lib/types";

const VALID_ROLES: AppRole[] = [
  "customer",
  "sales_admin",
  "inventory_admin",
];

function normalizeRole(v: unknown): AppRole {
  if (typeof v === "string" && VALID_ROLES.includes(v as AppRole)) {
    return v as AppRole;
  }
  return "customer";
}

export async function getAppRole(): Promise<AppRole> {
  const user = await currentUser();
  if (!user) return "customer";
  return normalizeRole(user.publicMetadata?.role);
}

export function assertRole(allowed: AppRole[], role: AppRole): void {
  if (!allowed.includes(role)) {
    throw new Error("Forbidden");
  }
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function requireRole(allowed: AppRole[]) {
  const userId = await requireAuth();
  const role = await getAppRole();
  assertRole(allowed, role);
  return { userId, role };
}
