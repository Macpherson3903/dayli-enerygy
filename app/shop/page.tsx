"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import SearchBar from "@/components/shop/SearchBar";
import FilterSidebar from "@/components/shop/FilterSidebar";
import SortDropdown from "@/components/shop/SortDropdown";
import ProductGrid from "@/components/shop/ProductGrid";

const PRODUCTS = [
    {
        id: 1,
        name: "Solar Panel 300W",
        category: "solar",
        price: 120000,
        image: "/solarRoof.png",
        description: "High efficiency solar panel",
    },
    {
        id: 2,
        name: "Inverter 5kVA",
        category: "inverter",
        price: 350000,
        image: "/inverter.png",
        description: "Reliable inverter system",
    },
    {
        id: 3,
        name: "Lithium Battery 200Ah",
        category: "battery",
        price: 500000,
        image: "/battery.png",
        description: "Long-lasting battery storage",
    },
];

const CATEGORIES = ["all", "solar", "inverter", "battery"];

export default function Shop() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category") || "all";

    const [category, setCategory] = useState(initialCategory);
    const [sort, setSort] = useState("default");
    const [search, setSearch] = useState("");

    const filteredProducts = useMemo(() => {
        let result = PRODUCTS;

        // category filter
        if (category !== "all") {
            result = result.filter((p) => p.category === category);
        }

        // search filter
        if (search) {
            result = result.filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // sorting
        if (sort === "low") {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sort === "high") {
            result = [...result].sort((a, b) => b.price - a.price);
        }

        return result;
    }, [category, sort, search]);

    return (
        <>
            <Navbar />

            <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Shop Energy Products
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            Reliable solar solutions tailored for homes and businesses.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <SearchBar onSearch={setSearch} />
                        <SortDropdown sort={sort} setSort={setSort} />
                    </div>
                </div>

                {/* Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <FilterSidebar
                        category={category}
                        setCategory={setCategory}
                        categories={CATEGORIES}
                    />

                    <div className="md:col-span-3">
                        <ProductGrid products={filteredProducts} />
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}