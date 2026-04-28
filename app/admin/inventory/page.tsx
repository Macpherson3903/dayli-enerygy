import Link from "next/link";
import { getProductsAllForAdmin } from "@/lib/db/products";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCreateForm } from "@/components/inventory/ProductCreateForm";
import { buildInventoryChartMetrics } from "@/lib/analytics/inventory";
import { ChartCard } from "@/components/charts/ChartCard";
import { BreakdownBarChart } from "@/components/charts/BreakdownBarChart";
import { DistributionPieChart } from "@/components/charts/DistributionPieChart";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await getProductsAllForAdmin();
  const inventoryCharts = buildInventoryChartMetrics(products);
  return (
    <div className="space-y-10">
      <PageHeader
        title="Inventory"
        description="Create, update, and remove products. Uploads go to Cloudinary when configured."
      />
      <ProductCreateForm />
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Dashboard insights
        </h2>
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
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          All products
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Price</th>
                <th className="px-4 py-2 font-medium">Stock</th>
                <th className="px-4 py-2 font-medium">Active</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p._id.toString()}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2 capitalize">{p.category}</td>
                  <td className="px-4 py-2">₦{p.price.toLocaleString()}</td>
                  <td className="px-4 py-2">{p.stock}</td>
                  <td className="px-4 py-2">{p.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/inventory/${p._id.toString()}`}
                      className="text-brand-700 font-medium hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
