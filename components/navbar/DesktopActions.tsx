"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default function DesktopActions({
  itemCount,
  loaded,
  isSignedIn,
  showDashboard,
  showAdminBadge,
}: {
  itemCount: number;
  loaded: boolean;
  isSignedIn: boolean;
  showDashboard: boolean;
  showAdminBadge: boolean;
}) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <Link
        href="/cart"
        aria-label="Cart"
        className="relative rounded-md p-2 text-gray-700 hover:bg-gray-100"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>

      {showDashboard && (
        <Link
          href="/dashboard"
          className="rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-white hover:bg-brand-900"
        >
          Dashboard
        </Link>
      )}

      {showAdminBadge && (
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          Admin
        </span>
      )}

      {loaded && !isSignedIn && (
        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Sign in
          </button>
        </SignInButton>
      )}

      {loaded && isSignedIn && <UserButton />}
    </div>
  );
}
