import { clsx } from "clsx";
import type { ComponentProps } from "react";

export function Skeleton({
  className = "",
  ...rest
}: ComponentProps<"div">) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
      aria-hidden
      {...rest}
    />
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
