"use client";

export default function SortDropdown({ sort, setSort }) {
    return (
        <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        >
            <option value="default">Sort By</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
        </select>
    );
}