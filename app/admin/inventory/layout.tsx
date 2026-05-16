import { redirect } from "next/navigation";
import { getAppRole } from "@/lib/auth/roles";
import type { ReactNode } from "react";
export default async function InventoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  const r = await getAppRole();
  if (r === "inventory_admin") {
    return (
      <div className="space-y-6">
        {children}
      </div>
    );
  }
  if (r === "sales_admin") {
    redirect("/admin/sales");
  }
  redirect("/account");
  return null;
}
