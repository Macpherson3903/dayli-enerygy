import ProductCard from "./ProductCard";
import { getPackagesFeaturedPublic } from "@/lib/db/packages";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";

async function SectionWithList() {
  const packages = await getPackagesFeaturedPublic();
  if (packages.length === 0) return null;
  return (
    <section className="py-16 px-6 bg-gray-50/80">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Featured packages</h2>
          <p className="text-gray-500 mt-2">
            Ready-made solar bundles with typical home loads — one cart line per
            package
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <ProductCard key={pkg.id} product={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function FeaturedPackages() {
  return (
    <Suspense
      fallback={
        <div className="py-16 px-6 bg-gray-50/80">
          <div className="max-w-7xl mx-auto">
            <ProductGridSkeleton count={3} />
          </div>
        </div>
      }
    >
      <SectionWithList />
    </Suspense>
  );
}
