"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import type { ProductPublic } from "@/lib/types";

export default function ProductCard({
  product,
  variant = "default",
}: {
  product: ProductPublic;
  variant?: "default" | "shop";
}) {
    const router = useRouter();

    const handleClick = () => {
        if (product?.slug) {
            router.push(`/order/${encodeURIComponent(product.slug)}`);
        } else {
            router.push("/order");
        }
    };

    return (
        <motion.div
            onClick={handleClick}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className={clsx(
              "group cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all",
              variant === "shop"
                ? "border-brand-300 shadow-[0_4px_20px_-2px_rgba(31,122,92,0.14)] hover:shadow-[0_12px_32px_-6px_rgba(31,122,92,0.22)]"
                : "border-gray-200 hover:shadow-xl"
            )}
        >
            {/* Image */}
            <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                <Image
                    src={product?.image || "/placeholder.jpg"}
                    alt={product?.name || "Product image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Category badge */}
                {product?.category && (
                    <span className="absolute top-3 left-3 text-xs bg-white/90 backdrop-blur px-2 py-1 rounded-md capitalize shadow-sm">
                        {product.itemKind === "package" ? "Package" : product.category}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col justify-between h-[180px]">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                        {product?.name}
                    </h3>

                    {(product.shortDescription || product.description) && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {product.shortDescription || product.description}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                    {product?.price && (
                        <p className="font-bold text-green-700">
                            ₦{product.price.toLocaleString()}
                        </p>
                    )}

                    <span className="text-sm font-medium text-green-600 group-hover:underline">
                        View →
                    </span>
                </div>
            </div>
        </motion.div>
    );
}