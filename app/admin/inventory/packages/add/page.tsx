import { PackageCreateForm } from "@/components/inventory/PackageCreateForm";
import { getPackageCategories } from "@/lib/db/packages";

export default async function AddPackagePage() {
  const categories = await getPackageCategories();
  return (
    <div className="max-w-2xl">
      <PackageCreateForm categories={categories} />
    </div>
  );
}
