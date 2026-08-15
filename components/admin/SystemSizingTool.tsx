"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Printer, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  computeQuotationRow,
  type QuotationAppliance,
  type QuotationComputedRow,
} from "@/lib/content/quotation";
import {
  computeSystemSizing,
  DEFAULT_SIZING_PARAMS,
  recommendSizingProducts,
  SYSTEM_VOLTAGES,
  type ProductRecommendation,
  type SizingCatalogItem,
  type SystemVoltage,
} from "@/lib/solar-sizing";
import { saveSizingCalculationAction } from "@/app/actions/sizing";
import { createQuotationApplianceAction } from "@/app/actions/quotation-appliances";
import { afterNextPaint, runSizingPrint } from "@/lib/after-paint";
import { useStatusMessage } from "@/context/StatusMessageContext";
import type { SizingRecommendationSnapshot } from "@/lib/types";

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

function hoursMapFromSheet(sheet: QuotationAppliance[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of sheet) {
    out[a.id] = String(a.defaultHoursPerDay);
  }
  return out;
}

export function SystemSizingTool({
  catalog,
  appliances,
}: {
  catalog: SizingCatalogItem[];
  appliances: QuotationAppliance[];
}) {
  const [customerName, setCustomerName] = useState("");
  const [addedAppliances, setAddedAppliances] = useState<QuotationAppliance[]>([]);
  const sheet = useMemo(() => {
    const seen = new Set(appliances.map((a) => a.id));
    return [...appliances, ...addedAppliances.filter((a) => !seen.has(a.id))];
  }, [appliances, addedAppliances]);
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const [hoursInputs, setHoursInputs] = useState<Record<string, string>>(() =>
    hoursMapFromSheet(appliances)
  );
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
  const [newName, setNewName] = useState("");
  const [newWatts, setNewWatts] = useState("");
  const [newHours, setNewHours] = useState("4");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setHoursInputs((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const a of sheet) {
        if (next[a.id] === undefined) {
          next[a.id] = String(a.defaultHoursPerDay);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [sheet]);

  const rows = useMemo<QuotationComputedRow[]>(() => {
    return sheet.map((appliance) =>
      computeQuotationRow(
        appliance,
        parseDecimalInput(quantityInputs[appliance.id]),
        parseDecimalInput(hoursInputs[appliance.id], { max: 24 })
      )
    );
  }, [sheet, quantityInputs, hoursInputs]);

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
  const { showStatusMessage } = useStatusMessage();
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [selectedForPrint, setSelectedForPrint] = useState<
    SizingRecommendationSnapshot[]
  >([]);
  const [manualRole, setManualRole] =
    useState<SizingRecommendationSnapshot["role"]>("panels");
  const [manualName, setManualName] = useState("");
  const [manualQty, setManualQty] = useState("1");
  const [manualUnit, setManualUnit] = useState("pcs");
  const [manualDetails, setManualDetails] = useState("");

  function snapshotRec(
    role: SizingRecommendationSnapshot["role"],
    rec: ProductRecommendation | null
  ): SizingRecommendationSnapshot | null {
    if (!rec) return null;
    return {
      role,
      source: "catalog",
      productId: rec.product.id,
      productName: rec.product.name,
      productSlug: rec.product.slug,
      quantity: rec.quantity,
      unitLabel: rec.unitLabel,
      coverageLabel: rec.coverageLabel,
      priceRange: rec.priceRange,
      note: rec.note,
    };
  }

  function addToPrintList(item: SizingRecommendationSnapshot) {
    setSelectedForPrint((prev) => {
      if (prev.some((p) => p.productId === item.productId)) return prev;
      return [...prev, item];
    });
    showStatusMessage(`${item.productName} added to the print list.`, "success");
  }

  function removeFromPrintList(productId: string) {
    setSelectedForPrint((prev) => prev.filter((p) => p.productId !== productId));
  }

  function addManualRecommendation() {
    const name = manualName.trim();
    const qty = Math.max(1, Math.round(parseDecimalInput(manualQty, { min: 1, max: 10_000 })));
    if (!name) {
      showStatusMessage("Enter a product name.", "error");
      return;
    }
    addToPrintList({
      role: manualRole,
      source: "manual",
      productId: `manual:${Date.now().toString(36)}`,
      productName: name,
      productSlug: "manual",
      quantity: qty,
      unitLabel: manualUnit.trim() || "pcs",
      coverageLabel: manualDetails.trim(),
      priceRange: "",
      note: "Manual recommendation",
    });
    setManualName("");
    setManualQty("1");
    setManualDetails("");
  }

  function addMissingAppliance() {
    const name = newName.trim();
    const watts = parseDecimalInput(newWatts, { min: 0.1, max: 1e6 });
    const hours = parseDecimalInput(newHours, { min: 0, max: 24 });
    if (!name) {
      showStatusMessage("Enter the appliance name.", "error");
      return;
    }
    if (watts <= 0) {
      showStatusMessage("Enter a watt rating greater than 0.", "error");
      return;
    }
    setAdding(true);
    afterNextPaint(async () => {
      try {
        const result = await createQuotationApplianceAction({
          name,
          watts,
          defaultHoursPerDay: hours,
        });
        if (result.error || !result.appliance) {
          showStatusMessage(result.error ?? "Could not add appliance", "error");
          return;
        }
        setAddedAppliances((prev) =>
          prev.some((a) => a.id === result.appliance!.id)
            ? prev
            : [...prev, result.appliance!]
        );
        setHoursInputs((prev) => ({
          ...prev,
          [result.appliance!.id]: String(result.appliance!.defaultHoursPerDay),
        }));
        setNewName("");
        setNewWatts("");
        setNewHours("4");
        showStatusMessage(
          `${result.appliance.name} added to the sheet (also on the public quotation).`,
          "success"
        );
      } finally {
        setAdding(false);
      }
    });
  }

  function saveCalculation() {
    if (!hasLoad) {
      showStatusMessage("Enter at least one appliance quantity before saving.", "error");
      return;
    }
    const peakSunHoursN = parseDecimalInput(peakSunHours, { min: 0.5, max: 8 }) || 5;
    const systemEfficiencyN =
      parseDecimalInput(systemEfficiency, { min: 0.4, max: 1 }) || 0.8;
    const inverterOversizeN =
      parseDecimalInput(inverterOversize, { min: 1, max: 2 }) || 1.25;
    const daysOfAutonomyN =
      parseDecimalInput(daysOfAutonomy, { min: 0.25, max: 5 }) || 1;
    const depthOfDischargeN =
      parseDecimalInput(depthOfDischarge, { min: 0.3, max: 1 }) || 0.8;

    setSaving(true);
    afterNextPaint(async () => {
      try {
        const result = await saveSizingCalculationAction({
          customerName: customerName.trim(),
          appliances: usedRows.map((r) => ({
            name: r.name,
            quantity: r.quantity,
            watts: r.watts,
            peakLoad: r.peakLoad,
            hoursPerDay: r.hoursPerDay,
            dailyEnergyWh: r.dailyEnergy,
          })),
          params: {
            systemVoltage,
            peakSunHours: peakSunHoursN,
            systemEfficiency: systemEfficiencyN,
            inverterOversize: inverterOversizeN,
            daysOfAutonomy: daysOfAutonomyN,
            depthOfDischarge: depthOfDischargeN,
          },
          totals: {
            peakLoadW: totals.peakLoad,
            dailyEnergyWh: totals.dailyEnergy,
          },
          result: sizing,
          recommendations: selectedForPrint,
        });
        if (result.error) {
          showStatusMessage(result.error, "error");
          return;
        }
        showStatusMessage(
          `Saved ${result.sizingNumber ?? "calculation"} to the database.`,
          "success"
        );
      } finally {
        setSaving(false);
      }
    });
  }

  function printWorksheet() {
    setPrinting(true);
    afterNextPaint(() => {
      runSizingPrint();
      setPrinting(false);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden no-print">
        <label className="block text-sm">
          <span className="text-gray-700">Customer name (optional, for print)</span>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-72 max-w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="gap-2"
            pending={saving}
            disabled={!hasLoad}
            onClick={saveCalculation}
          >
            <Save className="h-4 w-4" aria-hidden />
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            pending={printing}
            onClick={printWorksheet}
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print calculations
          </Button>
        </div>
      </div>

      <div className="sizing-print-root space-y-6">
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

      <Card className="p-4 sm:p-6 print:hidden no-print">
        <h2 className="text-sm font-semibold text-gray-900">Add missing appliance</h2>
        <p className="mt-1 text-sm text-gray-600">
          Adds this item to this worksheet and to the shared sheet used on the public quotation
          page.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <label className="block text-sm sm:col-span-2">
            <span className="text-gray-700">Name</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Watts</span>
            <input
              type="text"
              inputMode="decimal"
              value={newWatts}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || DECIMAL_INPUT_RE.test(v)) setNewWatts(v);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Default hours / day</span>
            <input
              type="text"
              inputMode="decimal"
              value={newHours}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || DECIMAL_INPUT_RE.test(v)) setNewHours(v);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
        </div>
        <Button
          type="button"
          className="mt-4 gap-2"
          pending={adding}
          onClick={addMissingAppliance}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add to sheet
        </Button>
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
        <h2 className="text-sm font-semibold text-gray-900">Recommended for this customer</h2>
        {selectedForPrint.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">
            Nothing on the print list yet. Use Recommend on a catalog match, or add a product
            manually below.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100" role="list">
            {selectedForPrint.map((item) => (
              <li key={item.productId} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {item.role}
                    {item.source === "manual" ? " · manual" : ""}
                  </p>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-700">
                    Qty {item.quantity} · {item.unitLabel}
                  </p>
                  {item.coverageLabel ? (
                    <p className="text-sm text-gray-600">{item.coverageLabel}</p>
                  ) : null}
                  {item.priceRange ? (
                    <p className="text-sm text-gray-600">{item.priceRange}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="print:hidden no-print"
                  onClick={() => removeFromPrintList(item.productId)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      </div>

      <Card className="p-4 sm:p-6 print:hidden no-print">
        <h2 className="text-sm font-semibold text-gray-900">Catalog matches</h2>
        <p className="mt-1 text-sm text-gray-600">
          These are suggestions from inventory. Click Recommend to put a product on the print
          document.
        </p>
        {!hasLoad ? (
          <p className="mt-2 text-sm text-gray-600">
            Enter appliance quantities to size the system and match products in stock.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <RecoCard
              title="Solar panels"
              rec={recs.panels}
              empty="No solar products with a watt rating in the catalog."
              recommended={
                recs.panels
                  ? selectedForPrint.some((s) => s.productId === recs.panels!.product.id)
                  : false
              }
              onRecommend={() => {
                const snap = snapshotRec("panels", recs.panels);
                if (snap) addToPrintList(snap);
              }}
            />
            <RecoCard
              title="Inverter"
              rec={recs.inverter}
              empty="No inverters with a kVA rating in the catalog."
              recommended={
                recs.inverter
                  ? selectedForPrint.some((s) => s.productId === recs.inverter!.product.id)
                  : false
              }
              onRecommend={() => {
                const snap = snapshotRec("inverter", recs.inverter);
                if (snap) addToPrintList(snap);
              }}
            />
            <RecoCard
              title="Batteries"
              rec={recs.batteries}
              empty="No batteries with an Ah rating that fit this voltage."
              recommended={
                recs.batteries
                  ? selectedForPrint.some((s) => s.productId === recs.batteries!.product.id)
                  : false
              }
              onRecommend={() => {
                const snap = snapshotRec("batteries", recs.batteries);
                if (snap) addToPrintList(snap);
              }}
            />
          </div>
        )}
      </Card>

      <Card className="p-4 sm:p-6 print:hidden no-print">
        <h2 className="text-sm font-semibold text-gray-900">Manual product</h2>
        <p className="mt-1 text-sm text-gray-600">
          Use this when inventory has no match, or you want to specify panels / equipment not in
          the catalog.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="text-gray-700">Type</span>
            <select
              value={manualRole}
              onChange={(e) =>
                setManualRole(e.target.value as SizingRecommendationSnapshot["role"])
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              <option value="panels">Solar panels</option>
              <option value="inverter">Inverter</option>
              <option value="batteries">Batteries</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-gray-700">Product name</span>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Quantity</span>
            <input
              type="text"
              inputMode="numeric"
              value={manualQty}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || DECIMAL_INPUT_RE.test(v)) setManualQty(v);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">Unit (e.g. panels)</span>
            <input
              type="text"
              value={manualUnit}
              onChange={(e) => setManualUnit(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-3">
            <span className="text-gray-700">Details</span>
            <input
              type="text"
              value={manualDetails}
              onChange={(e) => setManualDetails(e.target.value)}
              placeholder="Wattage, brand, notes"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
        </div>
        <Button type="button" className="mt-4" onClick={addManualRecommendation}>
          Add to print list
        </Button>
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
  recommended,
  onRecommend,
}: {
  title: string;
  rec: ReturnType<typeof recommendSizingProducts>["panels"];
  empty: string;
  recommended: boolean;
  onRecommend: () => void;
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
      <Button
        type="button"
        size="sm"
        className="mt-3"
        disabled={recommended}
        onClick={onRecommend}
      >
        {recommended ? "Added" : "Recommend"}
      </Button>
    </div>
  );
}
