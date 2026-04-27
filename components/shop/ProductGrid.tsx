"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";

export default function ProductGrid({ products }) {
    if (!products.length) {
        return (
            <div className="text-center py-20 border rounded-2xl">
                <p className="text-gray-500">No products found.</p>
            </div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <ProductCard product={product} />
                </motion.div>
            ))}
        </div>
    );
}