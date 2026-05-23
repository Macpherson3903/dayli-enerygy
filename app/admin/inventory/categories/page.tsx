import { getInventoryCategoriesWithUsage } from "@/lib/db/products";
import { getPackageCategoriesWithUsage } from "@/lib/db/packages";
import { CatalogCategoryManagerCard } from "@/components/inventory/admin/CatalogCategoryManagerCard";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function InventoryCategoriesPage() {
  const [productCategories, packageCategories] = await Promise.all([
    getInventoryCategoriesWithUsage(),
    getPackageCategoriesWithUsage(),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Catalog categories"
        description="Manage product and package categories in one place. Built-in product categories (solar, inverter, battery) and package categories (general, residential, commercial) can be renamed but not deleted."
      />
      <CatalogCategoryManagerCard
        productCategories={productCategories}
        packageCategories={packageCategories}
      />
    </div>
  );
}
