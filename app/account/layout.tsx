import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ensureCurrentUserInDb } from "@/lib/auth/sync-user";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/account");
  }
  await ensureCurrentUserInDb();
  return <DashboardLayout>{children}</DashboardLayout>;
}
