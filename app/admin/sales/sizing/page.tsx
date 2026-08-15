import { getProductsForSalesView } from "@/lib/db/products";
import { priceBoundsFromDoc } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/PageHeader";
import { SystemSizingTool } from "@/components/admin/SystemSizingTool";
import type { SizingCatalogItem } from "@/lib/solar-sizing";

export const dynamic = "force-dynamic";

export default async function SalesSystemSizingPage() {
  const products = await getProductsForSalesView();
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
    <div>
      <PageHeader
        title="System sizing"
        description="Enter the customer’s appliances and system voltage. Totals size the inverter, battery bank, and solar array, then match products from the catalog (watt, kVA, and Ah ratings in the product name or description)."
      />
      <SystemSizingTool catalog={catalog} />
    </div>
  );
}
