import type { ProductDoc } from "@/lib/types";
import type { BreakdownPoint } from "@/lib/analytics/types";

export type InventoryChartMetrics = {
  productsByCategory: BreakdownPoint[];
  stockHealth: BreakdownPoint[];
};

export function buildInventoryChartMetrics(
  products: ProductDoc[]
): InventoryChartMetrics {
  const categoryCounts = new Map<string, number>();

  for (const product of products) {
    const label = product.category[0].toUpperCase() + product.category.slice(1);
    categoryCounts.set(label, (categoryCounts.get(label) ?? 0) + 1);
  }

  const productsByCategory = Array.from(categoryCounts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;

  for (const product of products) {
    if (product.stock <= 0) {
      outOfStock += 1;
      continue;
    }
    if (product.stock <= 5) {
      lowStock += 1;
      continue;
    }
    inStock += 1;
  }

  const stockHealth: BreakdownPoint[] = [
    { label: "In stock", value: inStock },
    { label: "Low stock", value: lowStock },
    { label: "Out of stock", value: outOfStock },
  ];

  return {
    productsByCategory,
    stockHealth,
  };
}
