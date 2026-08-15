import { getProductsForSalesView } from "@/lib/db/products";
import { getQuotationAppliancesPublic } from "@/lib/db/quotation-appliances";
import { priceBoundsFromDoc } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/PageHeader";
import { SystemSizingTool } from "@/components/admin/SystemSizingTool";
import type { SizingCatalogItem } from "@/lib/solar-sizing";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SalesSystemSizingPage() {
  const [products, appliances] = await Promise.all([
    getProductsForSalesView(),
    getQuotationAppliancesPublic(),
  ]);
  const catalog: SizingCatalogItem[] = products.map((p) => {
    const { priceMin, priceMax } = priceBoundsFromDoc(p);
    return {
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      category: p.category,
      priceMin,
      priceMax,
      stock: p.stock,
      active: p.active,
      shortDescription: p.shortDescription,
      description: p.description,
      features: p.features ?? [],
    };
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="System sizing"
        description="Enter appliances, size the system, then Recommend catalog items (or add a manual product) for the print document. Save stores the worksheet and selected products."
        actions={
          <Link
            href="/admin/sales/saved-sizings"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            Saved calculations
          </Link>
        }
      />
      <SystemSizingTool catalog={catalog} appliances={appliances} />
    </div>
  );
}
