import ProductCard from "./ProductCard";
import { getProductsPublic } from "@/lib/db/products";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";

async function List() {
  const all = await getProductsPublic();
  const products = all.slice(0, 3);
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function FeaturedProducts() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Featured products</h2>
          <p className="text-gray-500 mt-2">
            Premium solar energy solutions built for performance and reliability
          </p>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={3} />}>
          <List />
        </Suspense>
      </div>
    </section>
  );
}
