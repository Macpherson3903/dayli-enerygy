/** Catalog/list price bounds (legacy `price` treated as both min and max). */
export type PriceBounds = { priceMin: number; priceMax: number };

export function normalizePriceBounds(
  priceMin: number,
  priceMax: number
): PriceBounds {
  const a = Number.isFinite(priceMin) ? priceMin : 0;
  const b = Number.isFinite(priceMax) ? priceMax : a;
  return {
    priceMin: Math.min(a, b),
    priceMax: Math.max(a, b),
  };
}

export function priceBoundsFromDoc(doc: {
  priceMin?: number;
  priceMax?: number;
  price?: number;
}): PriceBounds {
  if (doc.priceMin != null || doc.priceMax != null) {
    return normalizePriceBounds(
      doc.priceMin ?? doc.priceMax ?? 0,
      doc.priceMax ?? doc.priceMin ?? 0
    );
  }
  const legacy = doc.price ?? 0;
  return { priceMin: legacy, priceMax: legacy };
}

/** Cart/checkout line price — uses catalog minimum. */
export function cartUnitPrice(bounds: PriceBounds): number {
  return bounds.priceMin;
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatPriceRange(bounds: PriceBounds): string {
  const { priceMin, priceMax } = normalizePriceBounds(
    bounds.priceMin,
    bounds.priceMax
  );
  if (priceMin === priceMax) return formatNaira(priceMin);
  return `${formatNaira(priceMin)} - ${formatNaira(priceMax)}`;
}

export type CatalogPriceFilterId =
  | "all"
  | "under-500k"
  | "500k-1m"
  | "1m-2m"
  | "2m-5m"
  | "over-5m";

export const CATALOG_PRICE_FILTERS: {
  id: CatalogPriceFilterId;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "all", label: "All prices", min: 0, max: Number.POSITIVE_INFINITY },
  { id: "under-500k", label: "Under ₦500,000", min: 0, max: 499_999 },
  { id: "500k-1m", label: "₦500,000 – ₦1,000,000", min: 500_000, max: 999_999 },
  { id: "1m-2m", label: "₦1,000,000 – ₦2,000,000", min: 1_000_000, max: 1_999_999 },
  { id: "2m-5m", label: "₦2,000,000 – ₦5,000,000", min: 2_000_000, max: 4_999_999 },
  { id: "over-5m", label: "Over ₦5,000,000", min: 5_000_000, max: Number.POSITIVE_INFINITY },
];

export function parseCatalogPriceFilterId(
  raw: string | null | undefined
): CatalogPriceFilterId {
  const hit = CATALOG_PRICE_FILTERS.find((f) => f.id === raw);
  return hit?.id ?? "all";
}

/** True when the item's range overlaps the selected filter band. */
export function catalogItemMatchesPriceFilter(
  bounds: PriceBounds,
  filterId: CatalogPriceFilterId
): boolean {
  const filter =
    CATALOG_PRICE_FILTERS.find((f) => f.id === filterId) ?? CATALOG_PRICE_FILTERS[0];
  const { priceMin, priceMax } = normalizePriceBounds(
    bounds.priceMin,
    bounds.priceMax
  );
  return priceMin <= filter.max && priceMax >= filter.min;
}
