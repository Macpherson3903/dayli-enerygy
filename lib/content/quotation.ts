import type { ProposalApplianceRow } from "@/lib/types";

export type QuotationAppliance = {
  id: string;
  name: string;
  watts: number;
  defaultHoursPerDay: number;
};

export type QuotationComputedRow = QuotationAppliance & {
  quantity: number;
  /** Hours/day used for daily energy (from the client). */
  hoursPerDay: number;
  peakLoad: number;
  dailyEnergy: number;
};

export const quotationSeo = {
  title: "Solar Quotation",
  description:
    "List your appliances with quantities and hours per day; we use that to build a load summary for your installation request.",
  keywords: [
    "solar quotation",
    "load calculator",
    "energy consumption calculator",
    "dayli energy quotation",
    "peak load estimate",
  ],
};

export const quotationHeader = {
  title: "Solar Quotation Calculator",
  description:
    "Enter quantity and typical hours per day for each appliance you use. A detailed load summary is prepared when you add the estimate to your booking.",
};

export const quotationAppliances: QuotationAppliance[] = [
  { id: "led-bulbs", name: "LED Bulbs", watts: 15, defaultHoursPerDay: 4 },
  {
    id: "cfl-bulb-old",
    name: "CFL bulb (Old Houses)",
    watts: 60,
    defaultHoursPerDay: 4,
  },
  {
    id: "security-lights",
    name: "Security/Outdoor lights",
    watts: 50,
    defaultHoursPerDay: 12,
  },
  { id: "standing-fans", name: "Standing Fans", watts: 60, defaultHoursPerDay: 8 },
  { id: "ceiling-fans", name: "Ceiling Fans", watts: 60, defaultHoursPerDay: 12 },
  { id: "table-fans", name: "Table fans", watts: 60, defaultHoursPerDay: 0.5 },
  {
    id: "air-conditioner-split",
    name: "Air Conditioner (Split)",
    watts: 1500,
    defaultHoursPerDay: 7,
  },
  {
    id: "air-conditioner-window",
    name: "Air Conditioner (Window 1.HP)",
    watts: 1000,
    defaultHoursPerDay: 4,
  },
  {
    id: "refrigerator",
    name: "Refrigerator",
    watts: 300,
    defaultHoursPerDay: 12,
  },
  { id: "freezer", name: "Freezer", watts: 300, defaultHoursPerDay: 12 },
  { id: "microwave", name: "Microwave", watts: 1500, defaultHoursPerDay: 0 },
  {
    id: "electric-kettle",
    name: "Electric kettle",
    watts: 2000,
    defaultHoursPerDay: 0,
  },
  { id: "blender", name: "Blender", watts: 500, defaultHoursPerDay: 0.5 },
  { id: "toaster", name: "Toaster", watts: 1500, defaultHoursPerDay: 0 },
  { id: "television", name: "Television", watts: 100, defaultHoursPerDay: 6 },
  { id: "decoder-dstv", name: "Decoder (DSTV)", watts: 25, defaultHoursPerDay: 12 },
  {
    id: "home-theater-speaker",
    name: "Home Theater/Speaker",
    watts: 150,
    defaultHoursPerDay: 4,
  },
  {
    id: "game-console",
    name: "Game Console (Play Station)",
    watts: 150,
    defaultHoursPerDay: 0,
  },
  { id: "laptops", name: "Laptops", watts: 90, defaultHoursPerDay: 4 },
  { id: "desktop-computer", name: "Desktop Computer", watts: 200, defaultHoursPerDay: 0 },
  { id: "monitor", name: "Monitor", watts: 60, defaultHoursPerDay: 0 },
  { id: "printer", name: "Printer", watts: 500, defaultHoursPerDay: 0 },
  { id: "wifi-router", name: "Wifi Router", watts: 15, defaultHoursPerDay: 12 },
  { id: "phone-charger", name: "Phone Charger", watts: 15, defaultHoursPerDay: 5 },
  { id: "bore-hole-pump", name: "Bore hole pump", watts: 2000, defaultHoursPerDay: 0.5 },
  {
    id: "electric-pressing-iron",
    name: "Electric Pressing Iron",
    watts: 1500,
    defaultHoursPerDay: 1,
  },
  { id: "washing-machine", name: "Washing machine", watts: 800, defaultHoursPerDay: 2 },
  { id: "hair-dryer", name: "Hair Dryer", watts: 2000, defaultHoursPerDay: 0 },
];

export function computeQuotationRow(
  appliance: QuotationAppliance,
  quantity: number,
  hoursPerDay: number
): QuotationComputedRow {
  const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
  const rawHours = Number.isFinite(hoursPerDay) ? hoursPerDay : 0;
  const safeHours = Math.max(0, Math.min(24, rawHours));
  const peakLoad = safeQuantity * appliance.watts;
  const dailyEnergy = peakLoad * safeHours;

  return {
    ...appliance,
    quantity: safeQuantity,
    hoursPerDay: safeHours,
    peakLoad,
    dailyEnergy,
  };
}

/** Plain-text summary for booking / email (line-oriented). */
export function formatQuotationSummaryText(
  rows: QuotationComputedRow[],
  totals: { peakLoad: number; dailyEnergy: number }
): string {
  const lines: string[] = ["Load estimate (quotation calculator)", ""];

  const used = rows.filter((r) => r.quantity > 0);
  if (used.length === 0) {
    lines.push("(No appliance quantities entered — totals are zero.)", "");
  } else {
    for (const r of used) {
      const qty =
        Math.abs(r.quantity - Math.round(r.quantity)) < 1e-6
          ? String(Math.round(r.quantity))
          : String(Number(r.quantity.toFixed(2)));
      const h =
        Math.abs(r.hoursPerDay - Math.round(r.hoursPerDay)) < 1e-6
          ? String(Math.round(r.hoursPerDay))
          : String(Number(r.hoursPerDay.toFixed(2)));
      lines.push(
        `• ${r.name}: qty ${qty}, ${h} h/day → peak ${r.peakLoad.toLocaleString()} W, daily ${r.dailyEnergy.toLocaleString()} Wh`
      );
    }
    lines.push("");
  }

  lines.push(
    `Total peak load: ${totals.peakLoad.toLocaleString()} W`,
    `Total daily energy: ${totals.dailyEnergy.toLocaleString()} Wh`
  );

  return lines.join("\n");
}

/** Matches lines emitted by {@link formatQuotationSummaryText} (quotation calculator). */
const QUOTATION_SUMMARY_LINE =
  /^\s*•\s*(.+?):\s*qty\s*(\d+)\s*,\s*([\d.]+)\s*h\/day\s*→\s*peak\s*([\d,\s]+)\s*W\s*,\s*daily\s*([\d,\s]+)\s*Wh\s*$/;

function parseSummaryNumberFragment(raw: string): number {
  const n = Number.parseFloat(raw.replace(/[\s,]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Rebuild structured appliance rows from the plain-text load summary stored on a booking.
 * Used when `quotationAppliances` JSON was not saved (legacy) but the client used the calculator.
 */
export function parseQuotationSummaryTextToAppliances(text: string): ProposalApplianceRow[] {
  const out: ProposalApplianceRow[] = [];
  if (!text?.trim()) return out;

  for (const line of text.split(/\r?\n/)) {
    const m = line.match(QUOTATION_SUMMARY_LINE);
    if (!m) continue;
    const name = m[1].trim();
    const quantity = Math.max(0, Number.parseInt(m[2], 10) || 0);
    const hoursPerDay = Math.min(24, Math.max(0, parseSummaryNumberFragment(m[3])));
    const peakLoad = Math.max(0, parseSummaryNumberFragment(m[4]));
    const dailyEnergyWh = Math.max(0, parseSummaryNumberFragment(m[5]));
    const watts =
      quantity > 0 ? Math.round(peakLoad / quantity) : 0;
    out.push({
      name,
      quantity,
      watts: Number.isFinite(watts) && watts >= 0 ? watts : 0,
      peakLoad,
      hoursPerDay,
      dailyEnergyWh,
    });
  }
  return out;
}

/**
 * Plain-text load summary matching {@link formatQuotationSummaryText}, for persisting on the
 * booking when an admin edits proposal appliances (keeps admin + account views in sync).
 */
export function formatProposalAppliancesToQuotationSummary(
  rows: ProposalApplianceRow[]
): string {
  const lines: string[] = ["Load estimate (quotation calculator)", ""];
  const used = rows.filter((r) => r.quantity > 0 && r.name.trim() !== "");
  let totalPeak = 0;
  let totalDaily = 0;

  if (used.length === 0) {
    lines.push("(No appliance quantities entered — totals are zero.)", "");
  } else {
    for (const r of used) {
      const peakLoad = r.quantity * r.watts;
      const dailyEnergyWh = peakLoad * r.hoursPerDay;
      totalPeak += peakLoad;
      totalDaily += dailyEnergyWh;
      const h =
        Math.abs(r.hoursPerDay - Math.round(r.hoursPerDay)) < 1e-6
          ? String(Math.round(r.hoursPerDay))
          : String(Number(r.hoursPerDay.toFixed(2)));
      lines.push(
        `• ${r.name.trim()}: qty ${r.quantity}, ${h} h/day → peak ${peakLoad.toLocaleString()} W, daily ${dailyEnergyWh.toLocaleString()} Wh`
      );
    }
    lines.push("");
  }

  lines.push(
    `Total peak load: ${totalPeak.toLocaleString()} W`,
    `Total daily energy: ${totalDaily.toLocaleString()} Wh`
  );

  return lines.join("\n");
}
