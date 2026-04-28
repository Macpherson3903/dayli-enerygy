import { getInventoryCategories } from "@/lib/db/products";
import { CategoryManagerCard } from "@/components/inventory/admin/CategoryManagerCard";

export const dynamic = "force-dynamic";

export default async function InventoryCategoriesPage() {
  const categories = await getInventoryCategories();

  return (
    <div className="max-w-3xl">
      <CategoryManagerCard categories={categories} />
    </div>
  );
}
