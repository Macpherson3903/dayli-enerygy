import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/db/products";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductEditForm } from "@/components/inventory/ProductEditForm";
import { DeleteProductButton } from "@/components/inventory/DeleteProductButton";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const p = await getProductById(id);
  if (!p) {
    notFound();
  }
  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader
        title={`Edit: ${p.name}`}
        description="Update catalog fields or remove the product."
      />
      <ProductEditForm
        productId={p._id.toString()}
        product={{
          name: p.name,
          category: p.category,
          price: p.price,
          description: p.description,
          shortDescription: p.shortDescription,
          image: p.image,
          features: p.features,
          stock: p.stock,
          active: p.active,
        }}
      />
      <div className="pt-4 border-t">
        <DeleteProductButton productId={p._id.toString()} name={p.name} />
        <p className="mt-4">
          <Link
            href="/admin/inventory"
            className="text-sm text-brand-700 hover:underline"
          >
            Back to inventory
          </Link>
        </p>
      </div>
    </div>
  );
}
