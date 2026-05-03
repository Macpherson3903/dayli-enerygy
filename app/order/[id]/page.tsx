import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { getProductForPdp, getProductsPublic } from "@/lib/db/products";
import { getPackageForPdp, getPackagesPublic } from "@/lib/db/packages";
import type { ProductPublic } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const p =
    (await getProductForPdp(id)) ?? (await getPackageForPdp(id));
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
  const product =
    (await getProductForPdp(id)) ?? (await getPackageForPdp(id));
  if (!product) {
    notFound();
  }
  const [allProducts, allPackages] = await Promise.all([
    getProductsPublic(),
    getPackagesPublic(),
  ]);
  const related: ProductPublic[] = [];
  if (product.itemKind === "package") {
    related.push(
      ...allPackages.filter((p) => p.id !== product.id),
      ...allProducts.slice(0, 6)
    );
  } else {
    related.push(
      ...allProducts.filter(
        (p) => p.category === product.category && p.id !== product.id
      ),
      ...allPackages.slice(0, 3)
    );
  }
  const relatedDedup = related.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );
  const relatedLimited = relatedDedup.slice(0, 6);

  return (
    <>
      <Navbar />
      <ProductDetailClient product={product} related={relatedLimited} />
      <Footer />
    </>
  );
}
