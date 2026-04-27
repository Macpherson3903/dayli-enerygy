import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopCatalogClient from "@/components/shop/ShopCatalogClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { getProductsPublic } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getProductsPublic();

  return (
    <main className="bg-white text-gray-800">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-12">
        <PageHeader
          title="Shop Energy Products"
          description="Reliable solar solutions tailored for homes and businesses."
        />
        <ShopCatalogClient initialProducts={products} />
      </section>
      <Footer />
    </main>
  );
}
