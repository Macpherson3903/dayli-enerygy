"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  computeQuotationRow,
  quotationAppliances,
  type QuotationComputedRow,
} from "@/lib/content/quotation";

function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function QuotationCalculator() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const rows = useMemo<QuotationComputedRow[]>(() => {
    return quotationAppliances.map((appliance) =>
      computeQuotationRow(appliance, quantities[appliance.id] ?? 0)
    );
  }, [quantities]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.peakLoad += row.peakLoad;
        acc.dailyEnergy += row.dailyEnergy;
        return acc;
      },
      { peakLoad: 0, dailyEnergy: 0 }
    );
  }, [rows]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Appliance</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Watts (W)</th>
                <th className="px-4 py-3 font-semibold">Peak Load (W)</th>
                <th className="px-4 py-3 font-semibold">Hours/Day</th>
                <th className="px-4 py-3 font-semibold">Daily Energy (Wh)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 align-middle">
                  <td className="px-4 py-3 text-gray-900">{row.name}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={row.quantity}
                      onChange={(event) => {
                        const parsed = Number.parseInt(event.target.value, 10);
                        const next = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
                        setQuantities((prev) => ({ ...prev, [row.id]: next }));
                      }}
                      className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      aria-label={`${row.name} quantity`}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatNumber(row.watts)}</td>
                  <td className="px-4 py-3 text-gray-900">{formatNumber(row.peakLoad)}</td>
                  <td className="px-4 py-3 text-gray-700">{row.defaultHoursPerDay}</td>
                  <td className="px-4 py-3 text-gray-900">{formatNumber(row.dailyEnergy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Total Estimate</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-600">Total Peak Load</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatNumber(totals.peakLoad)} W
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-600">Total Daily Energy</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatNumber(totals.dailyEnergy)} Wh
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
