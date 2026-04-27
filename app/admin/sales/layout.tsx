import { redirect } from "next/navigation";
import { getAppRole } from "@/lib/auth/roles";
import type { ReactNode } from "react";

export default async function SalesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const r = await getAppRole();
  if (r === "sales_admin") {
    return children;
  }
  if (r === "inventory_admin") {
    redirect("/admin/inventory");
  }
  redirect("/account");
}
