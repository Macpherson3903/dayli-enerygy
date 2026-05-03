import { getPackageCategories } from "@/lib/db/packages";
import { PackageCategoryManagerCard } from "@/components/inventory/admin/PackageCategoryManagerCard";

export const dynamic = "force-dynamic";

export default async function PackageCategoriesPage() {
  const categories = await getPackageCategories();

  return (
    <div className="max-w-5xl">
      <PackageCategoryManagerCard categories={categories} />
    </div>
  );
}
