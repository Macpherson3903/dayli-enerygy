import { redirect } from "next/navigation";
import { getAppRole } from "@/lib/auth/roles";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

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
          description="Manage inventory pages from the sidebar navigation."
        />
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
