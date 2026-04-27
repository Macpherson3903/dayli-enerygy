import type { ReactNode } from "react";
import { clsx } from "clsx";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
