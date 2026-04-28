import { buildInventoryChartMetrics } from "@/lib/analytics/inventory";
import { ChartCard } from "@/components/charts/ChartCard";
import { BreakdownBarChart } from "@/components/charts/BreakdownBarChart";
import { DistributionPieChart } from "@/components/charts/DistributionPieChart";
import type { ProductDoc } from "@/lib/types";

function getSummary(products: ProductDoc[]) {
  const total = products.length;
  const inStock = products.filter((p) => p.stock > 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  return { total, inStock, lowStock, outOfStock };
}

export function InventoryDashboard({ products }: { products: ProductDoc[] }) {
  const inventoryCharts = buildInventoryChartMetrics(products);
  const summary = getSummary(products);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Total products</p>
          <p className="mt-2 text-2xl font-semibold">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">In stock</p>
          <p className="mt-2 text-2xl font-semibold">{summary.inStock}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Low stock</p>
          <p className="mt-2 text-2xl font-semibold">{summary.lowStock}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Out of stock</p>
          <p className="mt-2 text-2xl font-semibold">{summary.outOfStock}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="Products by category"
          description="Distribution of products across catalog categories."
        >
          <DistributionPieChart data={inventoryCharts.productsByCategory} />
        </ChartCard>
        <ChartCard
          title="Stock health"
          description="Count of in-stock, low-stock, and out-of-stock products."
        >
          <BreakdownBarChart data={inventoryCharts.stockHealth} />
        </ChartCard>
      </div>
    </div>
  );
}
