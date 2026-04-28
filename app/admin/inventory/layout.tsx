import { redirect } from "next/navigation";
import { getAppRole } from "@/lib/auth/roles";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { InventoryAdminTabs } from "@/components/inventory/admin/InventoryAdminTabs";

export default async function InventoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  const r = await getAppRole();
  if (r === "inventory_admin") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Inventory Admin"
          description="Manage products with a dashboard, product overview, and add inventory workflow."
        />
        <InventoryAdminTabs />
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
