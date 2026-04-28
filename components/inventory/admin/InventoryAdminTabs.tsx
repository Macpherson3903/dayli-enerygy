"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/inventory/dashboard", label: "Dashboard" },
  { href: "/admin/inventory/overview", label: "Overview" },
  { href: "/admin/inventory/add", label: "Add inventory" },
];

export function InventoryAdminTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Inventory admin navigation"
      className="inline-flex flex-wrap rounded-xl border border-gray-200 bg-white p-1"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-700 text-white"
                : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
