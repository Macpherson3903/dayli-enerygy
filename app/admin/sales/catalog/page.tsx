import { getProductsForSalesView } from "@/lib/db/products";
import { getPackagesForSalesView } from "@/lib/db/packages";
import { priceBoundsFromDoc } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogSearchableTables } from "@/components/admin/CatalogSearchableTables";

export const dynamic = "force-dynamic";

export default async function SalesCatalogPage() {
  const [products, packages] = await Promise.all([
    getProductsForSalesView(),
    getPackagesForSalesView(),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Catalog (read-only)"
        description="View products, packages, and stock. Use search to find an item by name, category, or slug. Inventory changes are made in the inventory admin area."
      />
      <CatalogSearchableTables
        products={products.map((p) => {
          const { priceMin, priceMax } = priceBoundsFromDoc(p);
          return {
            id: p._id.toString(),
            name: p.name,
            category: p.category,
            priceMin,
            priceMax,
            stock: p.stock,
            active: p.active,
          };
        })}
        packages={packages.map((p) => {
          const { priceMin, priceMax } = priceBoundsFromDoc(p);
          return {
            id: p._id.toString(),
            name: p.name,
            category: p.category?.trim() || "general",
            slug: p.slug,
            priceMin,
            priceMax,
            stock: p.stock,
            active: p.active,
            featured: p.featured,
          };
        })}
      />
    </div>
  );
}
