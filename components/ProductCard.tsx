"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }) {
    const router = useRouter();

    const handleClick = () => {
        if (product?.category) {
            router.push(`/shop?category=${encodeURIComponent(product.category)}`);
        } else {
            router.push("/shop");
        }
    };

    return (
        <motion.div
            onClick={handleClick}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="group border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-lg cursor-pointer"
        >
            <div className="h-52 w-full bg-gray-100 overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#38C172] transition-colors">
                    {product.name}
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                    {product.description}
                </p>

                <div className="mt-6 text-sm font-medium text-[#38C172]">
                    View in Shop →
                </div>
            </div>
        </motion.div>
    );
}