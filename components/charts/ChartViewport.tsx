"use client";

import { useSyncExternalStore, type ReactNode } from "react";

function subscribe() {
  return () => {};
}

/** Defers chart mount until the client (avoids Recharts -1 size warnings during SSR). */
export function ChartViewport({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div aria-hidden className="h-full w-full min-h-0 min-w-0" />;
  }

  return <div className="h-full w-full min-h-0 min-w-0">{children}</div>;
}
