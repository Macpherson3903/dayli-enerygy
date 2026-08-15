"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  computeQuotationRow,
  quotationAppliances,
  type QuotationComputedRow,
} from "@/lib/content/quotation";
import {
  computeSystemSizing,
  DEFAULT_SIZING_PARAMS,
  recommendSizingProducts,
  SYSTEM_VOLTAGES,
  type SizingCatalogItem,
  type SystemVoltage,
} from "@/lib/solar-sizing";

const DECIMAL_INPUT_RE = /^\d*\.?\d*$/;

function parseDecimalInput(
  raw: string | undefined,
  options?: { max?: number; min?: number }
): number {
  const t = raw?.trim();
  if (!t) return 0;
  const n = Number.parseFloat(t);
  if (Number.isNaN(n)) return 0;
  let v = Math.max(options?.min ?? 0, n);
  if (options?.max != null) v = Math.min(options.max, v);
  return v;
}

function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function defaultHoursMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of quotationAppliances) {
    out[a.id] = String(a.defaultHoursPerDay);
  }
  return out;
}

export function SystemSizingTool({ catalog }: { catalog: SizingCatalogItem[] }) {
  const [customerName, setCustomerName] = useState("");
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const [hoursInputs, setHoursInputs] = useState<Record<string, string>>(defaultHoursMap);
  const [systemVoltage, setSystemVoltage] = useState<SystemVoltage>(
    DEFAULT_SIZING_PARAMS.systemVoltage
  );
  const [peakSunHours, setPeakSunHours] = useState(String(DEFAULT_SIZING_PARAMS.peakSunHours));
  const [systemEfficiency, setSystemEfficiency] = useState(
    String(DEFAULT_SIZING_PARAMS.systemEfficiency)
  );
  const [inverterOversize, setInverterOversize] = useState(
    String(DEFAULT_SIZING_PARAMS.inverterOversize)
  );
  const [daysOfAutonomy, setDaysOfAutonomy] = useState(
    String(DEFAULT_SIZING_PARAMS.daysOfAutonomy)
  );
  const [depthOfDischarge, setDepthOfDischarge] = useState(
    String(DEFAULT_SIZING_PARAMS.depthOfDischarge)
  );

  const rows = useMemo<QuotationComputedRow[]>(() => {
    return quotationAppliances.map((appliance) =>
      computeQuotationRow(
        appliance,
        parseDecimalInput(quantityInputs[appliance.id]),
        parseDecimalInput(hoursInputs[appliance.id], { max: 24 })
      )
    );
  }, [quantityInputs, hoursInputs]);

  const usedRows = useMemo(() => rows.filter((r) => r.quantity > 0), [rows]);

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

  const sizing = useMemo(
    () =>
      computeSystemSizing({
        peakLoadW: totals.peakLoad,
        dailyEnergyWh: totals.dailyEnergy,
        systemVoltage,
        peakSunHours: parseDecimalInput(peakSunHours, { min: 0.5, max: 8 }) || 5,
        systemEfficiency:
          parseDecimalInput(systemEfficiency, { min: 0.4, max: 1 }) || 0.8,
        inverterOversize:
          parseDecimalInput(inverterOversize, { min: 1, max: 2 }) || 1.25,
        daysOfAutonomy: parseDecimalInput(daysOfAutonomy, { min: 0.25, max: 5 }) || 1,
        depthOfDischarge:
          parseDecimalInput(depthOfDischarge, { min: 0.3, max: 1 }) || 0.8,
      }),
    [
      totals.peakLoad,
      totals.dailyEnergy,
      systemVoltage,
      peakSunHours,
      systemEfficiency,
      inverterOversize,
      daysOfAutonomy,
      depthOfDischarge,
    ]
  );

  const recs = useMemo(
    () => recommendSizingProducts(catalog, sizing),
    [catalog, sizing]
  );

  const hasLoad = totals.peakLoad > 0 || totals.dailyEnergy > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <label className="block text-sm">
          <span className="text-gray-700">Customer name (optional, for print)</span>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-72 max-w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print calculations
        </Button>
      </div>

      <div className="hidden print:block mb-4">
        <p className="text-lg font-semibold text-gray-900">System sizing worksheet</p>
        <p className="text-sm text-gray-600">
          {customerName.trim() || "Walk-in customer"} · {new Date().toLocaleDateString()} ·{" "}
          {systemVoltage} V system
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="min-w-full border-collapse border-2 border-gray-300 text-sm">
            <caption className="sr-only">
              Appliance list: enter quantity and hours per day.
            </caption>
            <thead className="bg-gray-50 text-left text-gray-700">
              <tr>
                <th className="border-2 border-gray-300 px-3 py-2 font-semibold">Appliance</th>
                <th className="border-2 border-gray-300 px-3 py-2 font-semibold">Watts</th>
                <th className="border-2 border-gray-300 px-3 py-2 font-semibold">Quantity</th>
                <th className="border-2 border-gray-300 px-3 py-2 font-semibold">Hours / day</th>
                <th className="border-2 border-gray-300 px-3 py-2 font-semibold">Peak (W)</th>
                <th className="border-2 border-gray-300 px-3 py-2 font-semibold">Daily (Wh)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="align-middle bg-white even:bg-gray-50/50 print:hidden"
                >
                  <td className="border-2 border-gray-300 px-3 py-2 text-gray-900">{row.name}</td>
                  <td className="border-2 border-gray-300 px-3 py-2 text-gray-700">
                    {row.watts}
                  </td>
                  <td className="border-2 border-gray-300 px-3 py-2">
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
                      className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      aria-label={`${row.name} quantity`}
                    />
                  </td>
                  <td className="border-2 border-gray-300 px-3 py-2">
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
                      className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      aria-label={`${row.name} hours per day`}
                    />
                  </td>
                  <td className="border-2 border-gray-300 px-3 py-2 text-gray-700">
                    {formatNumber(row.peakLoad)}
                  </td>
                  <td className="border-2 border-gray-300 px-3 py-2 text-gray-700">
                    {formatNumber(row.dailyEnergy)}
                  </td>
                </tr>
              ))}
              {usedRows.map((row) => (
                <tr key={`print-${row.id}`} className="hidden print:table-row">
                  <td className="border-2 border-gray-300 px-3 py-2">{row.name}</td>
                  <td className="border-2 border-gray-300 px-3 py-2">{row.watts}</td>
                  <td className="border-2 border-gray-300 px-3 py-2">{row.quantity}</td>
                  <td className="border-2 border-gray-300 px-3 py-2">{row.hoursPerDay}</td>
                  <td className="border-2 border-gray-300 px-3 py-2">
                    {formatNumber(row.peakLoad)}
                  </td>
                  <td className="border-2 border-gray-300 px-3 py-2">
                    {formatNumber(row.dailyEnergy)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan={4} className="border-2 border-gray-300 px-3 py-2">
                  Totals
                </td>
                <td className="border-2 border-gray-300 px-3 py-2">
                  {formatNumber(totals.peakLoad)} W
                </td>
                <td className="border-2 border-gray-300 px-3 py-2">
                  {formatNumber(totals.dailyEnergy)} Wh
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900">System voltage & assumptions</h2>
        <p className="mt-1 text-sm text-gray-600 print:hidden">
          Defaults suit typical Nigerian rooftop installs. Adjust if the site needs more backup or
          different battery chemistry.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm">
            <span className="text-gray-700">System voltage</span>
            <select
              value={systemVoltage}
              onChange={(e) =>
                setSystemVoltage(Number(e.target.value) as SystemVoltage)
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              {SYSTEM_VOLTAGES.map((v) => (
                <option key={v} value={v}>
                  {v} V
                </option>
              ))}
            </select>
          </label>
          <NumberField
            label="Peak sun hours"
            value={peakSunHours}
            onChange={setPeakSunHours}
          />
          <NumberField
            label="System efficiency (0–1)"
            value={systemEfficiency}
            onChange={setSystemEfficiency}
          />
          <NumberField
            label="Inverter oversize factor"
            value={inverterOversize}
            onChange={setInverterOversize}
          />
          <NumberField
            label="Days of autonomy"
            value={daysOfAutonomy}
            onChange={setDaysOfAutonomy}
          />
          <NumberField
            label="Depth of discharge (0–1)"
            value={depthOfDischarge}
            onChange={setDepthOfDischarge}
          />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Inverter target" value={`${formatNumber(sizing.inverterKva, 2)} kVA`} />
        <Stat label="Solar array" value={`${formatNumber(sizing.arrayW, 0)} W`} />
        <Stat
          label={`Battery at ${systemVoltage} V`}
          value={`${formatNumber(sizing.batteryAh, 0)} Ah`}
          hint={`${formatNumber(sizing.batteryWh, 0)} Wh usable-adjusted`}
        />
      </div>

      <Card className="p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900">Catalog recommendations</h2>
        {!hasLoad ? (
          <p className="mt-2 text-sm text-gray-600">
            Enter appliance quantities to size the system and match products in stock.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <RecoCard title="Solar panels" rec={recs.panels} empty="No solar products with a watt rating in the catalog." />
            <RecoCard title="Inverter" rec={recs.inverter} empty="No inverters with a kVA rating in the catalog." />
            <RecoCard title="Batteries" rec={recs.batteries} empty="No batteries with an Ah rating that fit this voltage." />
          </div>
        )}
      </Card>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || DECIMAL_INPUT_RE.test(v)) onChange(v);
        }}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
    </label>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function RecoCard({
  title,
  rec,
  empty,
}: {
  title: string;
  rec: ReturnType<typeof recommendSizingProducts>["panels"];
  empty: string;
}) {
  if (!rec) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>
        <p className="mt-2 text-sm text-gray-600">{empty}</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-2 font-semibold text-gray-900">{rec.product.name}</p>
      <p className="mt-1 text-sm text-gray-700">
        Qty <span className="font-medium">{rec.quantity}</span> · {rec.unitLabel}
      </p>
      <p className="mt-1 text-sm text-gray-700">{rec.coverageLabel}</p>
      <p className="mt-1 text-sm text-gray-600">{rec.priceRange}</p>
      <p className="mt-1 text-xs text-gray-500">Stock: {rec.product.stock}</p>
      {rec.note ? <p className="mt-2 text-xs text-amber-800">{rec.note}</p> : null}
    </div>
  );
}
