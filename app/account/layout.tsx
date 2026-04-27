import type { ReactNode } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/account");
  }
  await currentUser();
  return <DashboardLayout>{children}</DashboardLayout>;
}
