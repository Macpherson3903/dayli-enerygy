"use client";

import type { ReactNode } from "react";

import FilterSidebar from "@/components/shop/FilterSidebar";

export default function ShopCatalogLayout({
  category,
  setCategory,
  categories,
  filterLabel = "Category",
  children,
}: {
  category: string;
  setCategory: (cat: string) => void;
  categories: string[];
  filterLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
      <FilterSidebar
        category={category}
        setCategory={setCategory}
        categories={categories}
        filterLabel={filterLabel}
      />
      <div className="md:col-span-3">{children}</div>
    </div>
  );
}
