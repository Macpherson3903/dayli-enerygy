"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from "react";

export default function SortDropdown({
  sort,
  setSort,
}: {
  sort: string;
  setSort: Dispatch<SetStateAction<string>>;
}) {
  return (
    <select
      value={sort}
      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
        setSort(e.target.value)
      }
      className="rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm shadow-[0_2px_10px_-2px_rgba(31,122,92,0.12)] focus:outline-none focus:ring-2 focus:ring-brand-700"
    >
      <option value="default">Sort By</option>
      <option value="low">Price: Low → High</option>
      <option value="high">Price: High → Low</option>
    </select>
  );
}
