"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { AppRole } from "@/lib/types";
import type { SalesNavBadgeCounts } from "@/lib/admin/sales-nav-badges";
import { clsx } from "clsx";
import { ClerkLoaded, UserButton } from "@clerk/nextjs";
import {
  Package,
  ClipboardList,
  LayoutDashboard,
  ShoppingBag,
  Layers3,
  PlusCircle,
  FolderTree,
  Users,
  MessageCircle,
} from "lucide-react";

type Item = {
  href: string;
  label: string;
  roles: AppRole[];
  icon: typeof Package;
  children?: Array<{ href: string; label: string }>;
};

const items: Item[] = [
  {
    href: "/admin/sales",
    label: "Sales",
    roles: ["sales_admin"],
    icon: ClipboardList,
    children: [
      { href: "/admin/sales", label: "Dashboard" },
      { href: "/admin/sales/orders", label: "Orders" },
      { href: "/admin/sales/bookings", label: "Bookings" },
      { href: "/admin/sales/product-inquiries", label: "Product inquiries" },
      { href: "/admin/sales/users", label: "Users" },
    ],
  },
  { href: "/admin/sales/catalog", label: "Catalog (read-only)", roles: ["sales_admin"], icon: ShoppingBag },
  {
    href: "/admin/inventory/dashboard",
    label: "Inventory",
    roles: ["inventory_admin"],
    icon: Package,
    children: [
      { href: "/admin/inventory/dashboard", label: "Dashboard" },
      { href: "/admin/inventory/overview", label: "Overview" },
      { href: "/admin/inventory/packages", label: "Packages" },
      { href: "/admin/inventory/package-categories", label: "Package categories" },
      { href: "/admin/inventory/add", label: "Add inventory" },
      { href: "/admin/inventory/categories", label: "Manage categories" },
    ],
  },
];

function NavAttentionBadge({
  count,
  variant = "default",
}: {
  count: number;
  variant?: "default" | "onDark";
}) {
  if (count < 1) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={clsx(
        "ml-auto inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none",
        variant === "onDark"
          ? "bg-white/95 text-brand-800 shadow-sm"
          : "bg-amber-600 text-white"
      )}
      aria-label={`${count} unattended`}
    >
      {label}
    </span>
  );
}

export function AdminShell({
  role,
  salesNavBadges,
  children,
}: {
  role: AppRole;
  /** New order / booking counts for sales sidebar (Mongo-backed). */
  salesNavBadges?: SalesNavBadgeCounts;
  children: ReactNode;
}) {
  const path = usePathname() || "";
  const visible = items.filter((i) => i.roles.includes(role));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 print:min-h-0 print:overflow-visible print:bg-white">
      <header className="bg-white border-b border-gray-200 z-20 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-semibold text-brand-700 flex items-center gap-2"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              View site
            </Link>
            <ClerkLoaded>
              <UserButton />
            </ClerkLoaded>
          </div>
        </div>
      </header>
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col md:flex-row gap-8 print:max-w-none print:mx-0 print:overflow-visible print:px-4 print:py-2 print:gap-0">
        <aside className="w-full md:w-56 shrink-0 print:hidden">
          <nav className="rounded-2xl border border-gray-200 bg-white p-2 space-y-0.5">
            {visible.map((item) => {
              const Icon = item.icon;
              const active = item.children
                ? item.href.startsWith("/admin/inventory")
                  ? path.startsWith("/admin/inventory")
                  : path.startsWith(item.href)
                : path === item.href || path.startsWith(item.href + "/");
              const salesAttentionTotal =
                salesNavBadges && item.href === "/admin/sales"
                  ? salesNavBadges.newOrders +
                    salesNavBadges.newBookings +
                    salesNavBadges.newProductInquiries
                  : 0;
              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                      active
                        ? "bg-brand-700 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.href === "/admin/sales" && salesAttentionTotal > 0 ? (
                      <NavAttentionBadge
                        count={salesAttentionTotal}
                        variant={active ? "onDark" : "default"}
                      />
                    ) : null}
                  </Link>
                  {item.children && active && (
                    <div className="mt-1 ml-6 space-y-0.5 border-l border-gray-200 pl-3">
                      {item.children.map((child) => {
                        const childActive = path === child.href;
                        const childBadge =
                          salesNavBadges && child.href.endsWith("/orders")
                            ? salesNavBadges.newOrders
                            : salesNavBadges && child.href.endsWith("/bookings")
                              ? salesNavBadges.newBookings
                              : salesNavBadges &&
                                  child.href.endsWith("/product-inquiries")
                                ? salesNavBadges.newProductInquiries
                                : salesNavBadges && child.href === "/admin/sales"
                                  ? salesNavBadges.newOrders +
                                    salesNavBadges.newBookings +
                                    salesNavBadges.newProductInquiries
                                  : 0;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={clsx(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                              childActive
                                ? "bg-brand-100 text-brand-800 font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            {child.href === "/admin/sales" && (
                              <LayoutDashboard className="w-3.5 h-3.5" />
                            )}
                            {child.href.endsWith("/orders") && (
                              <ClipboardList className="w-3.5 h-3.5" />
                            )}
                            {child.href.endsWith("/bookings") && (
                              <ClipboardList className="w-3.5 h-3.5" />
                            )}
                            {child.href.endsWith("/product-inquiries") && (
                              <MessageCircle className="w-3.5 h-3.5" />
                            )}
                            {child.href.endsWith("/users") && (
                              <Users className="w-3.5 h-3.5" />
                            )}
                            {child.href.endsWith("/dashboard") && (
                              <LayoutDashboard className="w-3.5 h-3.5" />
                            )}
                            {child.href.endsWith("/overview") && (
                              <Layers3 className="w-3.5 h-3.5" />
                            )}
                            {child.href.endsWith("/add") && (
                              <PlusCircle className="w-3.5 h-3.5" />
                            )}
                            {child.href.endsWith("/categories") && (
                              <FolderTree className="w-3.5 h-3.5" />
                            )}
                            <span className="flex-1 truncate">{child.label}</span>
                            {childBadge > 0 ? (
                              <NavAttentionBadge count={childBadge} />
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 min-w-0 print:w-full print:min-h-0 print:overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );
}
