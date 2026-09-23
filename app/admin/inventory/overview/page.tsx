import { getProductsAllForAdmin } from "@/lib/db/products";
import { getPackagesAllForAdmin } from "@/lib/db/packages";
import {
  InventoryCatalogOverview,
  type InventoryCatalogRow,
} from "@/components/inventory/admin/InventoryCatalogOverview";
import { priceFromDoc } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function InventoryOverviewPage() {
  const [products, packages] = await Promise.all([
    getProductsAllForAdmin(),
    getPackagesAllForAdmin(),
  ]);

  const rows: InventoryCatalogRow[] = [
    ...products.map((product) => {
      const { price, promoPrice } = priceFromDoc(product);
      return {
        id: product._id.toString(),
        kind: "product" as const,
        name: product.name,
        category: product.category,
        brand: product.brand,
        slug: product.slug,
        price,
        promoPrice,
        stock: product.stock,
        active: product.active,
        image: product.image,
        editHref: `/admin/inventory/${product._id.toString()}`,
      };
    }),
    ...packages.map((pkg) => {
      const { price, promoPrice } = priceFromDoc(pkg);
      return {
        id: pkg._id.toString(),
        kind: "package" as const,
        name: pkg.name,
        category: pkg.category,
        slug: pkg.slug,
        price,
        promoPrice,
        stock: pkg.stock,
        active: pkg.active,
        featured: pkg.featured,
        image: pkg.image,
        editHref: `/admin/inventory/packages/${pkg._id.toString()}`,
      };
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory overview"
        description="Browse and search all products and packages in your catalog."
      />
      <InventoryCatalogOverview rows={rows} />
    </div>
  );
}
