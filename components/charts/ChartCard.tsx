import type { ReactNode } from "react";
import { ChartViewport } from "@/components/charts/ChartViewport";

type ChartCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <header className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </header>
      <div className="h-64 w-full min-w-0">
        <ChartViewport>{children}</ChartViewport>
      </div>
    </section>
  );
}
