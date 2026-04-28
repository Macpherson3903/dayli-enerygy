import { getInventoryCategories } from "@/lib/db/products";
import { ProductCreateForm } from "@/components/inventory/ProductCreateForm";

export default async function AddInventoryPage() {
  const categories = await getInventoryCategories();
  return (
    <div className="max-w-2xl">
      <ProductCreateForm categories={categories} />
    </div>
  );
}
