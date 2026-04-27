import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { getProductForPdp, getProductsPublic } from "@/lib/db/products";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductForPdp(id);
  if (!p) {
    return { title: "Product" };
  }
  return {
    title: p.name,
    description: p.shortDescription ?? p.description,
    openGraph: { images: [{ url: p.image, alt: p.name }] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const product = await getProductForPdp(id);
  if (!product) {
    notFound();
  }
  const all = await getProductsPublic();
  const related = all.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  return (
    <>
      <Navbar />
      <ProductDetailClient product={product} related={related} />
      <Footer />
    </>
  );
}
