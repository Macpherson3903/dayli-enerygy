"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./types";

export default function NavItems({
  items,
  onItemClick,
  vertical = false,
}: {
  items: NavItem[];
  onItemClick?: () => void;
  vertical?: boolean;
}) {
  const pathname = usePathname() || "/";

  return (
    <nav
      className={
        vertical ? "flex flex-col gap-1" : "hidden items-center gap-2 md:flex"
      }
    >
      {items.map((item) => {
        const external =
          item.href.startsWith("http://") || item.href.startsWith("https://");
        const active =
          !external &&
          (pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href)));
        const className = `rounded-md px-3 py-2 text-sm font-medium transition ${
          active
            ? "bg-brand-900 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`;

        if (external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onItemClick}
              className={className}
            >
              {item.label}
            </a>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={className}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
