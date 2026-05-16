"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { clsx } from "clsx";
import { formatPriceRange } from "@/lib/pricing";

export type InventoryCatalogRow = {
  id: string;
  kind: "product" | "package";
  name: string;
  category: string;
  brand?: string;
  slug: string;
  priceMin: number;
  priceMax: number;
  stock: number;
  active: boolean;
  featured?: boolean;
  image: string;
  editHref: string;
};

type FilterKind = "all" | "product" | "package";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function rowMatches(query: string, row: InventoryCatalogRow): boolean {
  const terms = normalize(query)
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return true;
  const hay = [
    row.name,
    row.slug,
    row.category,
    row.brand ?? "",
    row.kind,
    row.kind === "product" ? "product" : "package bundle",
    ...(row.kind === "package" && row.featured ? ["featured"] : []),
  ]
    .map(normalize)
    .join(" ");
  return terms.every((t) => hay.includes(t));
}

const FILTER_OPTIONS: { value: FilterKind; label: string }[] = [
  { value: "all", label: "All items" },
  { value: "product", label: "Products" },
  { value: "package", label: "Packages" },
];

export function InventoryCatalogOverview({ rows }: { rows: InventoryCatalogRow[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");

  const productCount = rows.filter((r) => r.kind === "product").length;
  const packageCount = rows.filter((r) => r.kind === "package").length;

  const filtered = useMemo(() => {
    return rows
      .filter((r) => filter === "all" || r.kind === filter)
      .filter((r) => rowMatches(search, r))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [rows, search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 max-w-xl">
          <Input
            label="Search catalog"
            name="catalogSearch"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, slug, category, brand, or type…"
            autoComplete="off"
            hint={
              rows.length === 0
                ? undefined
                : `Showing ${filtered.length} of ${rows.length} items (${productCount} products, ${packageCount} packages)`
            }
          />
        </div>
        <div
          className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1"
          role="tablist"
          aria-label="Filter by item type"
        >
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={filter === opt.value}
              onClick={() => setFilter(opt.value)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filter === opt.value
                  ? "bg-brand-700 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[960px] text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-700">Image</th>
              <th className="px-4 py-3 font-medium text-gray-700">Type</th>
              <th className="px-4 py-3 font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 font-medium text-gray-700">Category</th>
              <th className="px-4 py-3 font-medium text-gray-700">Brand</th>
              <th className="px-4 py-3 font-medium text-gray-700">Price</th>
              <th className="px-4 py-3 font-medium text-gray-700">Stock</th>
              <th className="px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 font-medium text-gray-700" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  {rows.length === 0
                    ? "No products or packages in the database yet."
                    : "No items match your search. Try another term or filter."}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={`${row.kind}-${row.id}`}
                  className="border-b border-gray-100 align-middle last:border-0 hover:bg-gray-50/80"
                >
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.image}
                      alt=""
                      className="h-12 w-12 rounded-md border border-gray-200 object-cover bg-gray-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        row.kind === "product"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-violet-100 text-violet-800"
                      )}
                    >
                      {row.kind === "product" ? "Product" : "Package"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{row.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-gray-500">{row.slug}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-700">
                    {row.category?.trim() || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.kind === "product" ? row.brand ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {formatPriceRange({
                      priceMin: row.priceMin,
                      priceMax: row.priceMax,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "font-medium",
                        row.stock <= 0
                          ? "text-red-600"
                          : row.stock <= 5
                            ? "text-amber-700"
                            : "text-gray-900"
                      )}
                    >
                      {row.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={clsx(
                          "inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium",
                          row.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {row.active ? "Active" : "Inactive"}
                      </span>
                      {row.kind === "package" && row.featured ? (
                        <span className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={row.editHref}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && filtered.length > 0 ? (
        <p className="text-xs text-gray-500">
          Tip: use the sidebar to{" "}
          <Link href="/admin/inventory/add" className="text-brand-700 hover:underline">
            add products
          </Link>{" "}
          or{" "}
          <Link
            href="/admin/inventory/packages/add"
            className="text-brand-700 hover:underline"
          >
            add packages
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
