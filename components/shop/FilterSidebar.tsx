"use client";

import {
  CATALOG_PRICE_FILTERS,
  type CatalogPriceFilterId,
} from "@/lib/pricing";

export default function FilterSidebar({
  category,
  setCategory,
  categories,
  filterLabel = "Category",
  priceFilter,
  setPriceFilter,
}: {
  category: string;
  setCategory: (cat: string) => void;
  categories: string[];
  /** e.g. "Product category" vs "Package category" */
  filterLabel?: string;
  priceFilter: CatalogPriceFilterId;
  setPriceFilter: (id: CatalogPriceFilterId) => void;
}) {
  return (
    <aside className="md:col-span-1 h-fit rounded-2xl border border-brand-300 bg-white p-5 shadow-[0_4px_20px_-2px_rgba(31,122,92,0.16)] md:sticky md:top-24">
      <h3 className="font-semibold mb-4 text-gray-900">Filters</h3>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            {filterLabel}
          </p>

          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm capitalize transition ${
                  category === cat
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            Price range
          </p>
          <div className="flex flex-col gap-2">
            {CATALOG_PRICE_FILTERS.map((band) => (
              <button
                type="button"
                key={band.id}
                onClick={() => setPriceFilter(band.id)}
                className={`px-3 py-2 rounded-lg text-left text-sm transition ${
                  priceFilter === band.id
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {band.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
