"use client";

import ProductCard from "./ProductCard";

const products = [
    {
        id: 1,
        name: "Solar Panel",
        description:
            "High-efficiency monocrystalline solar panels designed for residential and commercial installations.",
        image: "/solarRoof.png",
        category: "solar-panel",
    },
    {
        id: 2,
        name: "Inverter",
        description:
            "Reliable pure sine wave inverter for stable and efficient energy conversion.",
        image: "/inverter.png",
        category: "inverter",
    },
    {
        id: 3,
        name: "Battery",
        description:
            "Durable deep-cycle lithium battery for long-lasting energy storage solutions.",
        image: "/battery.png",
        category: "battery",
    },
];

export default function FeaturedProducts() {
    return (
        <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Featured Products
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Premium solar energy solutions built for performance and reliability
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}