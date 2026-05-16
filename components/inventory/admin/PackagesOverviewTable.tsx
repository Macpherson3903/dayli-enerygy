import Link from "next/link";
import type { PackageDoc } from "@/lib/types";
import { formatPriceRange, priceBoundsFromDoc } from "@/lib/pricing";

export function PackagesOverviewTable({ packages }: { packages: PackageDoc[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full min-w-[900px] text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-2 font-medium">Image</th>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Category</th>
            <th className="px-4 py-2 font-medium">Slug</th>
            <th className="px-4 py-2 font-medium">Price</th>
            <th className="px-4 py-2 font-medium">Stock</th>
            <th className="px-4 py-2 font-medium">Featured</th>
            <th className="px-4 py-2 font-medium">Active</th>
            <th className="px-4 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr
              key={pkg._id.toString()}
              className="border-b border-gray-100 align-middle last:border-0"
            >
              <td className="px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="h-12 w-12 rounded-md border border-gray-200 object-cover"
                />
              </td>
              <td className="px-4 py-3 font-medium">{pkg.name}</td>
              <td className="px-4 py-3 capitalize">
                {pkg.category?.trim() || "general"}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{pkg.slug}</td>
              <td className="px-4 py-3">
                {formatPriceRange(priceBoundsFromDoc(pkg))}
              </td>
              <td className="px-4 py-3">{pkg.stock}</td>
              <td className="px-4 py-3">{pkg.featured ? "Yes" : "No"}</td>
              <td className="px-4 py-3">{pkg.active ? "Yes" : "No"}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/inventory/packages/${pkg._id.toString()}`}
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
