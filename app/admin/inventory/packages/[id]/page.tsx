import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackageById, getPackageCategories } from "@/lib/db/packages";
import { PageHeader } from "@/components/ui/PageHeader";
import { PackageEditForm } from "@/components/inventory/PackageEditForm";
import { DeletePackageButton } from "@/components/inventory/DeletePackageButton";

type Params = { id: string };

export default async function EditPackagePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const [pkg, categories] = await Promise.all([
    getPackageById(id),
    getPackageCategories(),
  ]);
  if (!pkg) {
    notFound();
  }
  const category =
    pkg.category?.trim().toLowerCase() ||
    (categories[0] ?? "general");
  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader
        title={`Edit: ${pkg.name}`}
        description="Update package fields, typical loads, or remove the package."
      />
      <PackageEditForm
        packageId={pkg._id.toString()}
        categories={
          categories.includes(category) ? categories : [...categories, category]
        }
        pkg={{
          name: pkg.name,
          slug: pkg.slug,
          category,
          price: pkg.price,
          description: pkg.description,
          shortDescription: pkg.shortDescription,
          image: pkg.image,
          features: pkg.features,
          typicalAppliances: pkg.typicalAppliances,
          stock: pkg.stock,
          active: pkg.active,
          featured: pkg.featured,
        }}
      />
      <div className="pt-4 border-t">
        <DeletePackageButton packageId={pkg._id.toString()} name={pkg.name} />
        <p className="mt-4">
          <Link
            href="/admin/inventory/packages"
            className="text-sm text-brand-700 hover:underline"
          >
            Back to packages
          </Link>
        </p>
      </div>
    </div>
  );
}
