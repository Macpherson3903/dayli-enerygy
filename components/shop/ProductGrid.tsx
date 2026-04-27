"use client";

import { motion } from "framer-motion";

import ProductCard from "@/components/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ProductPublic } from "@/lib/types";

export default function ProductGrid({
  products,
}: {
  products: ProductPublic[];
}) {
  if (!products.length) {
    return (
      <EmptyState
        tone="shop"
        title="No products found"
        message="Try another category or search term, or clear filters to see everything in the catalog."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <ProductCard product={product} variant="shop" />
        </motion.div>
      ))}
    </div>
  );
}
