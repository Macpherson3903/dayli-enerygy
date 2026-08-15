import { getProductsForSalesView } from "@/lib/db/products";
import { listSizingCalculations } from "@/lib/db/sizing-calculations";
import { getQuotationAppliancesPublic } from "@/lib/db/quotation-appliances";
import { priceBoundsFromDoc } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/PageHeader";
import { SystemSizingTool } from "@/components/admin/SystemSizingTool";
import { SavedSizingList } from "@/components/admin/SavedSizingList";
import type { SizingCatalogItem } from "@/lib/solar-sizing";

export const dynamic = "force-dynamic";

export default async function SalesSystemSizingPage() {
  const [products, saved, appliances] = await Promise.all([
    getProductsForSalesView(),
    listSizingCalculations(),
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
        description="Enter the customer’s appliances and system voltage. Totals size the inverter, battery bank, and solar array, then match products from the catalog (watt, kVA, and Ah ratings in the product name or description). Save stores the worksheet in MongoDB."
      />
      <SystemSizingTool catalog={catalog} appliances={appliances} />
      <SavedSizingList rows={saved} />
    </div>
  );
}
