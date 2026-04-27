"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

export default function SearchBar({
  onSearch,
}: {
  onSearch: (q: string) => void;
}) {
  const [query, setQuery] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="w-full md:w-80">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        className="w-full rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm shadow-[0_2px_10px_-2px_rgba(31,122,92,0.12)] focus:outline-none focus:ring-2 focus:ring-brand-700"
      />
    </div>
  );
}
