import Link from "next/link";
import type { ProductDoc } from "@/lib/types";

export function InventoryOverviewTable({ products }: { products: ProductDoc[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full min-w-[900px] text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-2 font-medium">Image</th>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Category</th>
            <th className="px-4 py-2 font-medium">Brand</th>
            <th className="px-4 py-2 font-medium">Price</th>
            <th className="px-4 py-2 font-medium">Stock</th>
            <th className="px-4 py-2 font-medium">Active</th>
            <th className="px-4 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product._id.toString()}
              className="border-b border-gray-100 align-middle last:border-0"
            >
              <td className="px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-12 w-12 rounded-md border border-gray-200 object-cover"
                />
              </td>
              <td className="px-4 py-3 font-medium">{product.name}</td>
              <td className="px-4 py-3 capitalize">{product.category}</td>
              <td className="px-4 py-3">{product.brand ?? "-"}</td>
              <td className="px-4 py-3">₦{product.price.toLocaleString()}</td>
              <td className="px-4 py-3">{product.stock}</td>
              <td className="px-4 py-3">{product.active ? "Yes" : "No"}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/inventory/${product._id.toString()}`}
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
  );
}
