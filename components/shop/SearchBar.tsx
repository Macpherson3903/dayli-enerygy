"use client";

import { useState } from "react";

export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState("");

    const handleChange = (e) => {
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
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
        </div>
    );
}