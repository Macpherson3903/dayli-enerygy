import { redirect } from "next/navigation";
import { getAppRole } from "@/lib/auth/roles";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSalesNavBadgeCounts } from "@/lib/admin/sales-nav-badges";
import type { ReactNode } from "react";
import type { AppRole } from "@/lib/types";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const role: AppRole = await getAppRole();
  if (role !== "sales_admin" && role !== "inventory_admin") {
    redirect("/account");
  }
  const salesNavBadges =
    role === "sales_admin" ? await getSalesNavBadgeCounts() : undefined;
  return (
    <AdminShell role={role} salesNavBadges={salesNavBadges}>
      {children}
    </AdminShell>
  );
}
