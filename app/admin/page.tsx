import { redirect } from "next/navigation";
import { getAppRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const r = await getAppRole();
  if (r === "inventory_admin") {
    redirect("/admin/inventory");
  }
  if (r === "sales_admin") {
    redirect("/admin/sales");
  }
  redirect("/");
}
