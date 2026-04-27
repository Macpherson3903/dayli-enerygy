"use client";

export default function FilterSidebar({ category, setCategory, categories }) {
    return (
        <aside className="md:col-span-1 bg-white border rounded-2xl p-5 h-fit sticky top-24 shadow-sm">
            <h3 className="font-semibold mb-4 text-gray-900">Filters</h3>

            <div className="space-y-4">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                        Category
                    </p>

                    <div className="flex flex-col gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm capitalize transition ${category === cat
                                        ? "bg-green-600 text-white"
                                        : "hover:bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}