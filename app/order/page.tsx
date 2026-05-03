import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopCatalogClient from "@/components/shop/ShopCatalogClient";
import { PageHero } from "@/components/ui/PageHero";
import { getProductsPublic } from "@/lib/db/products";
import { getPackagesPublic, getPackageCategories } from "@/lib/db/packages";
import type { ProductPublic } from "@/lib/types";

export const dynamic = "force-dynamic";

function pickRandomSpotlight<T extends ProductPublic>(
  items: T[],
  count: number
): T[] {
  if (items.length === 0) return [];
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, Math.min(count, copy.length));
}

export default async function OrderCatalogPage() {
  const [products, packages, packageCategories] = await Promise.all([
    getProductsPublic(),
    getPackagesPublic(),
    getPackageCategories(),
  ]);
  const spotlightProducts = pickRandomSpotlight(products, 3);
  const spotlightPackages = pickRandomSpotlight(packages, 3);

  return (
    <main className="bg-white text-gray-800">
      <Navbar />
      <PageHero
        eyebrow="Solar Catalog"
        title="Order dependable solar products for every energy goal"
        description="From high-efficiency panels to long-lasting batteries and smart inverters, find carefully selected products built for real-world performance."
        backgroundImageUrl="https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1920&q=80"
        primaryCta={{ label: "Browse catalog", href: "#order-catalog" }}
        secondaryCta={{ label: "Talk to an Expert", href: "/contact" }}
      />
      <section id="order-catalog" className="mx-auto max-w-7xl px-6 py-12 md:px-12">
        <ShopCatalogClient
          initialProducts={products}
          initialPackages={packages}
          packageCategories={packageCategories}
          spotlightProducts={spotlightProducts}
          spotlightPackages={spotlightPackages}
        />
      </section>
      <Footer />
    </main>
  );
}
