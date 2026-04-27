"use client";

import type { Dispatch, SetStateAction } from "react";

import SearchBar from "@/components/shop/SearchBar";
import SortDropdown from "@/components/shop/SortDropdown";

export default function ShopToolbar({
  sort,
  setSort,
  onSearch,
}: {
  sort: string;
  setSort: Dispatch<SetStateAction<string>>;
  onSearch: (q: string) => void;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      <SearchBar onSearch={onSearch} />
      <SortDropdown sort={sort} setSort={setSort} />
    </div>
  );
}
