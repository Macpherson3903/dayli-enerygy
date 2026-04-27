"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PRODUCTS = [
    {
        id: 1,
        name: "Solar Panel 300W",
        category: "solar",
        price: 120000,
        image: "/solar.jpg",
        description: "High efficiency solar panel designed for residential and commercial usage.",
        features: [
            "High conversion efficiency",
            "Durable tempered glass",
            "Weather resistant",
            "25-year lifespan",
        ],
    },
    {
        id: 2,
        name: "Inverter 5kVA",
        category: "inverter",
        price: 350000,
        image: "/inverter.jpg",
        description: "Reliable inverter system for stable and uninterrupted power supply.",
        features: [
            "Pure sine wave output",
            "Smart load management",
            "Overload protection",
            "Silent operation",
        ],
    },
    {
        id: 3,
        name: "Lithium Battery 200Ah",
        category: "battery",
        price: 500000,
        image: "/battery.jpg",
        description: "Long-lasting lithium battery for energy storage systems.",
        features: [
            "Deep cycle performance",
            "Fast charging",
            "Lightweight design",
            "Long lifespan",
        ],
    },
];

export default function ProductDetails() {
    const { id } = useParams();
    const router = useRouter();

    const product = PRODUCTS.find((p) => p.id === Number(id));

    if (!product) {
        return (
            <>
                <Navbar />
                <div className="py-32 text-center">
                    <h2 className="text-2xl font-semibold">Product not found</h2>
                    <button
                        onClick={() => router.push("/shop")}
                        className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg"
                    >
                        Back to Shop
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-10">
                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="relative w-full h-[400px] bg-gray-100 rounded-2xl overflow-hidden"
                    >
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col"
                    >
                        <p className="text-sm text-green-600 capitalize mb-2">
                            {product.category}
                        </p>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {product.name}
                        </h1>

                        <p className="text-2xl font-bold text-green-700 mt-4">
                            ₦{product.price.toLocaleString()}
                        </p>

                        <p className="text-gray-600 mt-4 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Features */}
                        <div className="mt-6">
                            <h3 className="font-semibold mb-3">Key Features</h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="text-sm text-gray-600 flex items-start gap-2"
                                    >
                                        <span className="text-green-600">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() =>
                                    window.open(
                                        `mailto:macpherson885@gmail.com?subject=Inquiry about ${product.name}`
                                    )
                                }
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Request via Email
                            </button>

                            <button
                                onClick={() => router.push("/shop")}
                                className="px-6 py-3 border rounded-lg hover:bg-gray-100 transition"
                            >
                                Back to Shop
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Related Products */}
                <div className="mt-20">
                    <h2 className="text-xl font-semibold mb-6">
                        Related Products
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PRODUCTS.filter(
                            (p) =>
                                p.category === product.category &&
                                p.id !== product.id
                        ).map((item) => (
                            <div
                                key={item.id}
                                onClick={() => router.push(`/shop/${item.id}`)}
                                className="cursor-pointer border rounded-xl p-4 hover:shadow-md transition"
                            >
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    ₦{item.price.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}