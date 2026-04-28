"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { BreakdownPoint } from "@/lib/analytics/types";
import { CHART_COLORS } from "@/components/charts/chartTheme";

type DistributionPieChartProps = {
  data: BreakdownPoint[];
  emptyLabel?: string;
};

export function DistributionPieChart({
  data,
  emptyLabel = "No distribution data available yet.",
}: DistributionPieChartProps) {
  if (data.length === 0 || data.every((point) => point.value === 0)) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          outerRadius={88}
          innerRadius={44}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={`${entry.label}-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
