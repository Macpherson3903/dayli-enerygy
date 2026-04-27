import { getProductsForSalesView } from "@/lib/db/products";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
          : "text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
      }
    >
      {active ? "Active" : "Hidden"}
    </span>
  );
}

export default async function SalesCatalogPage() {
  const products = await getProductsForSalesView();
  return (
    <div>
      <PageHeader
        title="Catalog (read-only)"
        description="View products and stock. Inventory changes are made in the inventory admin area."
      />
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm text-left min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Price (₦)</th>
              <th className="px-4 py-2 font-medium">Stock</th>
              <th className="px-4 py-2 font-medium">Status</th>
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
                <td className="px-4 py-2">{p.price.toLocaleString()}</td>
                <td className="px-4 py-2">{p.stock}</td>
                <td className="px-4 py-2">
                  <ActiveBadge active={p.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
