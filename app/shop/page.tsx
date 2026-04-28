import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopCatalogClient from "@/components/shop/ShopCatalogClient";
import { PageHero } from "@/components/ui/PageHero";
import { getProductsPublic } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getProductsPublic();

  return (
    <main className="bg-white text-gray-800">
      <Navbar />
      <PageHero
        eyebrow="Solar Catalog"
        title="Shop dependable solar products for every energy goal"
        description="From high-efficiency panels to long-lasting batteries and smart inverters, find carefully selected products built for real-world performance."
        backgroundImageUrl="https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1920&q=80"
        primaryCta={{ label: "Start Shopping", href: "#shop-catalog" }}
        secondaryCta={{ label: "Talk to an Expert", href: "/contact" }}
      />
      <section id="shop-catalog" className="mx-auto max-w-7xl px-6 py-12 md:px-12">
        <ShopCatalogClient initialProducts={products} />
      </section>
      <Footer />
    </main>
  );
}
