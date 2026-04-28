"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BreakdownPoint } from "@/lib/analytics/types";
import { CHART_COLORS, GRID_STROKE } from "@/components/charts/chartTheme";

type BreakdownBarChartProps = {
  data: BreakdownPoint[];
  emptyLabel?: string;
};

export function BreakdownBarChart({
  data,
  emptyLabel = "No breakdown data available yet.",
}: BreakdownBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`${entry.label}-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
