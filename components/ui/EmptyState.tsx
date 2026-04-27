import type { ReactNode } from "react";
import Link from "next/link";
import { clsx } from "clsx";

export function EmptyState({
  title,
  message,
  action,
  tone = "neutral",
}: {
  title: string;
  message: string;
  action?: { label: string; href: string };
  children?: ReactNode;
  tone?: "neutral" | "shop";
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-dashed px-6 py-12 text-center",
        tone === "shop"
          ? "border-brand-300 bg-brand-300/10 shadow-[0_4px_24px_-4px_rgba(31,122,92,0.2)]"
          : "border-gray-200 bg-gray-50/50"
      )}
      role="status"
    >
      <p className="text-base font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{message}</p>
      {action && (
        <div className="mt-4">
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-900"
          >
            {action.label}
          </Link>
        </div>
      )}
    </div>
  );
}
