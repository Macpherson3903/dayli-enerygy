"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { AppRole } from "@/lib/types";
import type { SalesNavBadgeCounts } from "@/lib/admin/sales-nav-badges";
import { clsx } from "clsx";
import { ClerkLoaded, UserButton } from "@clerk/nextjs";
import {
  ClipboardList,
  LayoutDashboard,
  ShoppingBag,
  Layers3,
  PlusCircle,
  FolderTree,
  Boxes,
  Users,
  MessageCircle,
  Calculator,
  FileText,
  List,
  Receipt,
  type LucideIcon,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: keyof SalesNavBadgeCounts;
};

type NavSection = {
  label: string;
  links: NavLink[];
};

type NavArea = {
  label: string;
  roles: AppRole[];
  prefix: string;
  home: string;
  sections: NavSection[];
};

const areas: NavArea[] = [
  {
    label: "Sales",
    roles: ["sales_admin"],
    prefix: "/admin/sales",
    home: "/admin/sales",
    sections: [
      {
        label: "Overview",
        links: [
          { href: "/admin/sales", label: "Dashboard", icon: LayoutDashboard },
        ],
      },
      {
        label: "Customers",
        links: [
          {
            href: "/admin/sales/orders",
            label: "Orders",
            icon: ClipboardList,
            badge: "newOrders",
          },
          {
            href: "/admin/sales/invoices/new",
            label: "Create invoice",
            icon: PlusCircle,
          },
          {
            href: "/admin/sales/invoices",
            label: "Saved invoices",
            icon: Receipt,
          },
          {
            href: "/admin/sales/bookings",
            label: "Bookings",
            icon: ClipboardList,
            badge: "newBookings",
          },
          {
            href: "/admin/sales/product-inquiries",
            label: "Product inquiries",
            icon: MessageCircle,
            badge: "newProductInquiries",
          },
        ],
      },
      {
        label: "Sizing",
        links: [
          { href: "/admin/sales/sizing", label: "System sizing", icon: Calculator },
          {
            href: "/admin/sales/saved-sizings",
            label: "Saved calculations",
            icon: FileText,
          },
          {
            href: "/admin/sales/appliance-sheet",
            label: "Appliance sheet",
            icon: List,
          },
        ],
      },
      {
        label: "Directory",
        links: [
          { href: "/admin/sales/catalog", label: "Catalog", icon: ShoppingBag },
          { href: "/admin/sales/users", label: "Users", icon: Users },
        ],
      },
    ],
  },
  {
    label: "Inventory",
    roles: ["inventory_admin"],
    prefix: "/admin/inventory",
    home: "/admin/inventory/dashboard",
    sections: [
      {
        label: "Overview",
        links: [
          {
            href: "/admin/inventory/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            href: "/admin/inventory/overview",
            label: "Stock overview",
            icon: Layers3,
          },
        ],
      },
      {
        label: "Products",
        links: [
          { href: "/admin/inventory/add", label: "Add product", icon: PlusCircle },
        ],
      },
      {
        label: "Packages",
        links: [
          { href: "/admin/inventory/packages", label: "Packages", icon: Boxes },
          {
            href: "/admin/inventory/packages/add",
            label: "Add package",
            icon: PlusCircle,
          },
        ],
      },
      {
        label: "Setup",
        links: [
          {
            href: "/admin/inventory/categories",
            label: "Categories",
            icon: FolderTree,
          },
        ],
      },
    ],
  },
];

function isLinkActive(path: string, href: string, home: string): boolean {
  if (href === home) return path === href;
  if (href === "/admin/inventory/packages") {
    return (
      path === href ||
      (path.startsWith(`${href}/`) &&
        !path.startsWith("/admin/inventory/packages/add"))
    );
  }
  if (href === "/admin/sales/invoices") {
    return (
      path === href ||
      (path.startsWith(`${href}/`) &&
        !path.startsWith("/admin/sales/invoices/new"))
    );
  }
  return path === href || path.startsWith(`${href}/`);
}

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
  salesNavBadges?: SalesNavBadgeCounts;
  children: ReactNode;
}) {
  const path = usePathname() || "";
  const visible = areas.filter((a) => a.roles.includes(role));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 print:min-h-0 print:overflow-visible print:bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-20 print:hidden">
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
        <aside className="w-full md:w-60 shrink-0 print:hidden md:sticky md:top-14 md:self-start md:max-h-[calc(100vh-3.5rem)] md:overflow-y-auto">
          <nav
            className="rounded-2xl border border-gray-200 bg-white p-3 space-y-5"
            aria-label="Admin"
          >
            {visible.map((area) => (
              <div key={area.prefix}>
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {area.label}
                </p>
                <div className="mt-2 space-y-4">
                  {area.sections.map((section) => (
                    <div key={section.label}>
                      <p className="px-2 mb-1 text-[11px] font-medium text-gray-400">
                        {section.label}
                      </p>
                      <ul className="space-y-0.5" role="list">
                        {section.links.map((link) => {
                          const Icon = link.icon;
                          const active = isLinkActive(path, link.href, area.home);
                          const badgeCount =
                            link.badge && salesNavBadges
                              ? salesNavBadges[link.badge]
                              : 0;
                          return (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className={clsx(
                                  "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm",
                                  active
                                    ? "bg-brand-700 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                )}
                              >
                                <Icon className="w-4 h-4 shrink-0" aria-hidden />
                                <span className="flex-1 truncate">{link.label}</span>
                                {badgeCount > 0 ? (
                                  <NavAttentionBadge
                                    count={badgeCount}
                                    variant={active ? "onDark" : "default"}
                                  />
                                ) : null}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0 print:w-full print:min-h-0 print:overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );
}
