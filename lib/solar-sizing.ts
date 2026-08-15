import { formatPriceRange } from "@/lib/pricing";
import {
  batterySpecFromCatalog,
  inverterSpecFromCatalog,
  panelSpecFromCatalog,
} from "@/lib/product-capacity";

export const SYSTEM_VOLTAGES = [12, 24, 48] as const;
export type SystemVoltage = (typeof SYSTEM_VOLTAGES)[number];

export type SizingCatalogItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  priceMin: number;
  priceMax: number;
  stock: number;
  active: boolean;
  shortDescription?: string;
  description: string;
  features: string[];
};

export type SystemSizingParams = {
  peakLoadW: number;
  dailyEnergyWh: number;
  systemVoltage: SystemVoltage;
  peakSunHours: number;
  systemEfficiency: number;
  inverterOversize: number;
  daysOfAutonomy: number;
  depthOfDischarge: number;
};

export type SystemSizingResult = {
  inverterW: number;
  inverterKva: number;
  arrayW: number;
  batteryWh: number;
  batteryAh: number;
  systemVoltage: SystemVoltage;
};

export type ProductRecommendation = {
  product: SizingCatalogItem;
  quantity: number;
  unitLabel: string;
  coverageLabel: string;
  priceRange: string;
  note?: string;
};

export const DEFAULT_SIZING_PARAMS: Omit<
  SystemSizingParams,
  "peakLoadW" | "dailyEnergyWh"
> = {
  systemVoltage: 24,
  peakSunHours: 5,
  systemEfficiency: 0.8,
  inverterOversize: 1.25,
  daysOfAutonomy: 1,
  depthOfDischarge: 0.8,
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function computeSystemSizing(p: SystemSizingParams): SystemSizingResult {
  const peak = Math.max(0, p.peakLoadW);
  const daily = Math.max(0, p.dailyEnergyWh);
  const psh = clamp(p.peakSunHours, 0.5, 8);
  const eff = clamp(p.systemEfficiency, 0.4, 1);
  const oversize = clamp(p.inverterOversize, 1, 2);
  const days = clamp(p.daysOfAutonomy, 0.25, 5);
  const dod = clamp(p.depthOfDischarge, 0.3, 1);
  const v = p.systemVoltage;

  const inverterW = peak * oversize;
  const inverterKva = inverterW / 1000;
  const arrayW = daily <= 0 ? 0 : daily / (psh * eff);
  const batteryWh = daily <= 0 ? 0 : (daily * days) / dod;
  const batteryAh = batteryWh <= 0 ? 0 : batteryWh / v;

  return {
    inverterW,
    inverterKva,
    arrayW,
    batteryWh,
    batteryAh,
    systemVoltage: v,
  };
}

function itemText(item: SizingCatalogItem): string[] {
  return [item.name, item.shortDescription, item.description, ...(item.features ?? [])].filter(
    (part): part is string => Boolean(part)
  );
}

function isCategory(item: SizingCatalogItem, ...names: string[]): boolean {
  const c = item.category.trim().toLowerCase();
  return names.some((n) => c === n || c.includes(n));
}

function recommendPanels(
  catalog: SizingCatalogItem[],
  arrayW: number
): ProductRecommendation | null {
  if (arrayW <= 0) return null;
  const scored = catalog
    .filter((p) => p.active && isCategory(p, "solar", "panel", "pv"))
    .map((product) => {
      const spec = panelSpecFromCatalog(itemText(product));
      if (!spec) return null;
      const quantity = Math.max(1, Math.ceil(arrayW / spec.watts));
      const totalW = quantity * spec.watts;
      const overshoot = totalW - arrayW;
      return { product, spec, quantity, totalW, overshoot };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  if (scored.length === 0) return null;
  scored.sort((a, b) => {
    const stockA = a.product.stock >= a.quantity ? 0 : 1;
    const stockB = b.product.stock >= b.quantity ? 0 : 1;
    if (stockA !== stockB) return stockA - stockB;
    if (a.quantity !== b.quantity) return a.quantity - b.quantity;
    return a.overshoot - b.overshoot;
  });
  const best = scored[0];
  const note =
    best.product.stock < best.quantity
      ? `Need ${best.quantity} units; only ${best.product.stock} in stock.`
      : undefined;
  return {
    product: best.product,
    quantity: best.quantity,
    unitLabel: `${best.spec.watts} W each`,
    coverageLabel: `${best.totalW.toLocaleString()} W array (${best.quantity} × ${best.spec.watts} W)`,
    priceRange: formatPriceRange(best.product),
    note,
  };
}

function recommendInverter(
  catalog: SizingCatalogItem[],
  inverterW: number
): ProductRecommendation | null {
  if (inverterW <= 0) return null;
  const parsed = catalog
    .filter((p) => p.active && isCategory(p, "inverter"))
    .map((product) => {
      const spec = inverterSpecFromCatalog(itemText(product));
      if (!spec) return null;
      return { product, spec };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  if (parsed.length === 0) return null;

  const fitting = parsed.filter((x) => x.spec.va >= inverterW);
  const pool = fitting.length > 0 ? fitting : parsed;
  pool.sort((a, b) => {
    const stockA = a.product.stock > 0 ? 0 : 1;
    const stockB = b.product.stock > 0 ? 0 : 1;
    if (stockA !== stockB) return stockA - stockB;
    return a.spec.va - b.spec.va;
  });
  const best = pool[0];
  const kva = best.spec.va / 1000;
  const note =
    best.spec.va < inverterW
      ? `Largest catalog inverter (${kva} kVA) is below the ${inverterW.toLocaleString()} W target.`
      : best.product.stock < 1
        ? "Out of stock."
        : undefined;
  return {
    product: best.product,
    quantity: 1,
    unitLabel: `${kva} kVA`,
    coverageLabel: `${kva} kVA inverter for ${inverterW.toLocaleString()} W target`,
    priceRange: formatPriceRange(best.product),
    note,
  };
}

function recommendBatteries(
  catalog: SizingCatalogItem[],
  sizing: SystemSizingResult
): ProductRecommendation | null {
  if (sizing.batteryWh <= 0) return null;
  const parsed = catalog
    .filter((p) => p.active && isCategory(p, "battery"))
    .map((product) => {
      const spec = batterySpecFromCatalog(itemText(product));
      if (!spec) return null;
      const bankVolts = spec.volts ?? 12;
      if (sizing.systemVoltage % bankVolts !== 0) return null;
      const series = sizing.systemVoltage / bankVolts;
      const usableWhPerString = spec.ah * sizing.systemVoltage * 1;
      const strings = Math.max(1, Math.ceil(sizing.batteryWh / usableWhPerString));
      const quantity = series * strings;
      const totalAhAtSystemV = spec.ah * strings;
      const totalWh = spec.ah * sizing.systemVoltage * strings;
      return { product, spec, bankVolts, series, strings, quantity, totalAhAtSystemV, totalWh };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  if (parsed.length === 0) return null;
  parsed.sort((a, b) => {
    const stockA = a.product.stock >= a.quantity ? 0 : 1;
    const stockB = b.product.stock >= b.quantity ? 0 : 1;
    if (stockA !== stockB) return stockA - stockB;
    if (a.quantity !== b.quantity) return a.quantity - b.quantity;
    return a.totalWh - b.totalWh;
  });
  const best = parsed[0];
  const wiring =
    best.series > 1
      ? `${best.series} in series × ${best.strings} string${best.strings === 1 ? "" : "s"}`
      : `${best.strings} unit${best.strings === 1 ? "" : "s"} in parallel if needed`;
  const noteParts: string[] = [wiring];
  if (best.product.stock < best.quantity) {
    noteParts.push(`Need ${best.quantity}; ${best.product.stock} in stock.`);
  }
  return {
    product: best.product,
    quantity: best.quantity,
    unitLabel: `${best.spec.ah} Ah${best.spec.volts ? ` / ${best.spec.volts} V` : ""}`,
    coverageLabel: `${best.totalAhAtSystemV.toLocaleString()} Ah at ${sizing.systemVoltage} V (${best.totalWh.toLocaleString()} Wh bank)`,
    priceRange: formatPriceRange(best.product),
    note: noteParts.join(" "),
  };
}

export type SizingRecommendations = {
  panels: ProductRecommendation | null;
  inverter: ProductRecommendation | null;
  batteries: ProductRecommendation | null;
};

export function recommendSizingProducts(
  catalog: SizingCatalogItem[],
  sizing: SystemSizingResult
): SizingRecommendations {
  return {
    panels: recommendPanels(catalog, sizing.arrayW),
    inverter: recommendInverter(catalog, sizing.inverterW),
    batteries: recommendBatteries(catalog, sizing),
  };
}
