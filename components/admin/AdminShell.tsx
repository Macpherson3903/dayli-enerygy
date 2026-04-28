"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { AppRole } from "@/lib/types";
import { clsx } from "clsx";
import { UserButton } from "@clerk/nextjs";
import {
  Package,
  ClipboardList,
  LayoutDashboard,
  ShoppingBag,
  Layers3,
  PlusCircle,
  FolderTree,
  Users,
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
      { href: "/admin/inventory/add", label: "Add inventory" },
      { href: "/admin/inventory/categories", label: "Manage categories" },
    ],
  },
];

export function AdminShell({
  role,
  children,
}: {
  role: AppRole;
  children: ReactNode;
}) {
  const path = usePathname() || "";
  const visible = items.filter((i) => i.roles.includes(role));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 z-20">
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
            <UserButton />
          </div>
        </div>
      </header>
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 shrink-0">
          <nav className="rounded-2xl border border-gray-200 bg-white p-2 space-y-0.5">
            {visible.map((item) => {
              const Icon = item.icon;
              const active = item.children
                ? item.href.startsWith("/admin/inventory")
                  ? path.startsWith("/admin/inventory")
                  : path.startsWith(item.href)
                : path === item.href || path.startsWith(item.href + "/");
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
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                  {item.children && active && (
                    <div className="mt-1 ml-6 space-y-0.5 border-l border-gray-200 pl-3">
                      {item.children.map((child) => {
                        const childActive = path === child.href;
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
                            {child.label}
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
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
