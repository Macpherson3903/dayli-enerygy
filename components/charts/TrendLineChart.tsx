"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MultiSeriesPoint } from "@/lib/analytics/types";
import { CHART_COLORS, GRID_STROKE } from "@/components/charts/chartTheme";

type TrendLineChartProps = {
  data: MultiSeriesPoint[];
  emptyLabel?: string;
};

export function TrendLineChart({
  data,
  emptyLabel = "No trend data available yet.",
}: TrendLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={24} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="customers"
          name="Unique order emails"
          stroke={CHART_COLORS[1]}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="bookings"
          name="Install bookings"
          stroke={CHART_COLORS[2]}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
