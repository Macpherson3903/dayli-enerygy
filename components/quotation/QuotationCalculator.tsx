"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  computeQuotationRow,
  formatQuotationSummaryText,
  quotationAppliances,
  type QuotationComputedRow,
} from "@/lib/content/quotation";
import type { ProposalApplianceRow } from "@/lib/types";

export type QuotationApplyEstimatePayload = {
  summaryText: string;
  appliances: ProposalApplianceRow[];
};

type QuotationCalculatorProps = {
  /** When set, shows a button that sends the current estimate as text + structured rows. */
  onApplyEstimate?: (payload: QuotationApplyEstimatePayload) => void;
  applyEstimateLabel?: string;
};

function formatNumber(value: number): string {
  return value.toLocaleString();
}

/** Allows typing whole numbers and decimals (e.g. 1, 0.5, 12.25). */
const DECIMAL_INPUT_RE = /^\d*\.?\d*$/;

function parseDecimalInput(
  raw: string | undefined,
  options?: { max?: number }
): number {
  const t = raw?.trim();
  if (!t) return 0;
  const n = Number.parseFloat(t);
  if (Number.isNaN(n)) return 0;
  let v = Math.max(0, n);
  if (options?.max != null) v = Math.min(options.max, v);
  return v;
}

export function QuotationCalculator({
  onApplyEstimate,
  applyEstimateLabel = "Add this estimate to my booking request",
}: QuotationCalculatorProps = {}) {
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const [hoursInputs, setHoursInputs] = useState<Record<string, string>>({});

  const rows = useMemo<QuotationComputedRow[]>(() => {
    return quotationAppliances.map((appliance) =>
      computeQuotationRow(
        appliance,
        parseDecimalInput(quantityInputs[appliance.id]),
        parseDecimalInput(hoursInputs[appliance.id], { max: 24 })
      )
    );
  }, [quantityInputs, hoursInputs]);

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
          <table className="min-w-full border-collapse border-2 border-gray-300 text-sm">
            <caption className="sr-only">
              Appliance list: enter quantity and hours per day for each item you use.
            </caption>
            <thead className="bg-gray-50 text-left text-gray-700">
              <tr>
                <th className="border-2 border-gray-300 px-4 py-3 font-semibold">
                  Appliance
                </th>
                <th className="border-2 border-gray-300 px-4 py-3 font-semibold">
                  Quantity
                </th>
                <th className="border-2 border-gray-300 px-4 py-3 font-semibold">
                  Hours / day
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="align-middle bg-white even:bg-gray-50/50">
                  <td className="border-2 border-gray-300 px-4 py-3 text-gray-900">
                    {row.name}
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={quantityInputs[row.id] ?? ""}
                      onChange={(event) => {
                        const v = event.target.value;
                        if (v === "" || DECIMAL_INPUT_RE.test(v)) {
                          setQuantityInputs((prev) => ({ ...prev, [row.id]: v }));
                        }
                      }}
                      className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      aria-label={`${row.name} quantity`}
                    />
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={hoursInputs[row.id] ?? ""}
                      onChange={(event) => {
                        const v = event.target.value;
                        if (v === "" || DECIMAL_INPUT_RE.test(v)) {
                          setHoursInputs((prev) => ({ ...prev, [row.id]: v }));
                        }
                      }}
                      className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      aria-label={`${row.name} hours per day`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="border-t border-gray-100 bg-gray-50 px-4 py-5 sm:px-6"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2 className="text-sm font-semibold text-gray-900">Total estimate</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-600">Total peak load</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatNumber(totals.peakLoad)} W
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-600">Total daily energy</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatNumber(totals.dailyEnergy)} Wh
              </p>
            </div>
          </div>
        </div>

        {onApplyEstimate ? (
          <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-5 sm:px-6">
            <p className="text-sm text-gray-600">
              Add this estimate to your booking to send the same summary (including these totals) to
              you and our team by email.
            </p>
            <Button
              type="button"
              className="mt-4 w-full sm:w-auto"
              onClick={() => {
                const appliances: ProposalApplianceRow[] = rows
                  .filter((r) => r.quantity > 0)
                  .map((r) => ({
                    name: r.name,
                    quantity: r.quantity,
                    watts: r.watts,
                    peakLoad: r.peakLoad,
                    hoursPerDay: r.hoursPerDay,
                    dailyEnergyWh: r.dailyEnergy,
                  }));
                onApplyEstimate?.({
                  summaryText: formatQuotationSummaryText(rows, totals),
                  appliances,
                });
              }}
            >
              {applyEstimateLabel}
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
