export type CatalogPrice = { price: number; promoPrice?: number };

/** Reads current prices and keeps pre-migration range records usable. */
export function priceFromDoc(doc: {
  price?: number;
  promoPrice?: number;
  priceMin?: number;
  priceMax?: number;
}): CatalogPrice {
  const price = Number.isFinite(doc.price)
    ? Number(doc.price)
    : Number(doc.priceMin ?? doc.priceMax ?? 0);
  const promoPrice =
    Number.isFinite(doc.promoPrice) && Number(doc.promoPrice) < price
      ? Number(doc.promoPrice)
      : undefined;
  return { price, promoPrice };
}

/** Cart/checkout line price — promotion price takes precedence. */
export function cartUnitPrice(item: CatalogPrice): number {
  return item.promoPrice ?? item.price;
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatCatalogPrice(item: CatalogPrice): string {
  return formatNaira(item.promoPrice ?? item.price);
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

/** True when the effective sale price is in the selected filter band. */
export function catalogItemMatchesPriceFilter(
  item: CatalogPrice,
  filterId: CatalogPriceFilterId
): boolean {
  const filter =
    CATALOG_PRICE_FILTERS.find((f) => f.id === filterId) ?? CATALOG_PRICE_FILTERS[0];
  const price = item.promoPrice ?? item.price;
  return price >= filter.min && price <= filter.max;
}
