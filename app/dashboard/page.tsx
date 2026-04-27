import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAppRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const role = await getAppRole();

  if (role === "sales_admin") {
    redirect("/admin/sales");
  }
  if (role === "inventory_admin") {
    redirect("/admin/inventory");
  }

  redirect("/account");
}
