import { redirect } from "next/navigation";
import { getAppRole } from "@/lib/auth/roles";
import { AdminShell } from "@/components/admin/AdminShell";
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
  return <AdminShell role={role}>{children}</AdminShell>;
}
