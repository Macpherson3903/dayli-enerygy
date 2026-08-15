"use client";

import { useMemo, useState } from "react";
import { AdminSearchField } from "@/components/admin/AdminSearchField";
import { matchesSearch } from "@/lib/admin/search";
import { formatPriceRange } from "@/lib/pricing";

export type CatalogListRow = {
  id: string;
  name: string;
  category: string;
  slug?: string;
  priceMin: number;
  priceMax: number;
  stock: number;
  active: boolean;
  featured?: boolean;
};

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

function CatalogTable({
  rows,
  kind,
}: {
  rows: CatalogListRow[];
  kind: "product" | "package";
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        matchesSearch(search, [row.name, row.category, row.slug ?? ""])
      ),
    [rows, search]
  );

  return (
    <div className="space-y-3">
      <AdminSearchField
        label={kind === "product" ? "Search products" : "Search packages"}
        value={search}
        onChange={setSearch}
        placeholder="Name, category, or slug…"
        hint={
          rows.length === 0
            ? undefined
            : `Showing ${filtered.length} of ${rows.length}`
        }
      />
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Category</th>
              {kind === "package" ? (
                <th className="px-4 py-2 font-medium">Slug</th>
              ) : null}
              <th className="px-4 py-2 font-medium">Price range</th>
              <th className="px-4 py-2 font-medium">Stock</th>
              {kind === "package" ? (
                <th className="px-4 py-2 font-medium">Featured</th>
              ) : null}
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-gray-600"
                  colSpan={kind === "package" ? 7 : 5}
                >
                  {rows.length === 0
                    ? `No ${kind === "product" ? "products" : "packages"} yet.`
                    : "No items match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-2 font-medium">{row.name}</td>
                  <td className="px-4 py-2 capitalize">{row.category}</td>
                  {kind === "package" ? (
                    <td className="px-4 py-2 font-mono text-xs">{row.slug}</td>
                  ) : null}
                  <td className="px-4 py-2">
                    {formatPriceRange({
                      priceMin: row.priceMin,
                      priceMax: row.priceMax,
                    })}
                  </td>
                  <td className="px-4 py-2">{row.stock}</td>
                  {kind === "package" ? (
                    <td className="px-4 py-2">{row.featured ? "Yes" : "No"}</td>
                  ) : null}
                  <td className="px-4 py-2">
                    <ActiveBadge active={row.active} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CatalogSearchableTables({
  products,
  packages,
}: {
  products: CatalogListRow[];
  packages: CatalogListRow[];
}) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Products</h2>
        <CatalogTable rows={products} kind="product" />
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Packages</h2>
        <CatalogTable rows={packages} kind="package" />
      </div>
    </div>
  );
}
