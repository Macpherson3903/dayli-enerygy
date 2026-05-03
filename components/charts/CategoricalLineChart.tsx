"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BreakdownPoint } from "@/lib/analytics/types";
import { CHART_COLORS, GRID_STROKE } from "@/components/charts/chartTheme";

type CategoricalLineChartProps = {
  data: BreakdownPoint[];
  emptyLabel?: string;
  /** Degrees; use e.g. -28 for long stage labels. */
  xTickAngle?: number;
};

export function CategoricalLineChart({
  data,
  emptyLabel = "No data to chart yet.",
  xTickAngle = 0,
}: CategoricalLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        {emptyLabel}
      </div>
    );
  }

  const bottomMargin = xTickAngle !== 0 ? 56 : 8;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ left: 4, right: 12, top: 8, bottom: bottomMargin }}
      >
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10 }}
          angle={xTickAngle}
          textAnchor={xTickAngle !== 0 ? "end" : "middle"}
          interval={0}
          height={xTickAngle !== 0 ? 72 : undefined}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          name="Count"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          dot={{ r: 4, fill: CHART_COLORS[0], strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
