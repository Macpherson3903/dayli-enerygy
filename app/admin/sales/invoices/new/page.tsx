import { getProductsForSalesView } from "@/lib/db/products";
import { getPackagesForSalesView } from "@/lib/db/packages";
import { priceFromDoc } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/PageHeader";
import { InvoiceForm } from "@/components/admin/InvoiceForm";
import type { InvoiceCatalogPick } from "@/components/admin/InvoiceForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const [products, packages] = await Promise.all([
    getProductsForSalesView(),
    getPackagesForSalesView(),
  ]);
  const catalog: InvoiceCatalogPick[] = [
    ...products.map((p) => {
      const { price, promoPrice } = priceFromDoc(p);
      return {
        id: p._id.toString(),
        kind: "product" as const,
        name: p.name,
        category: p.category,
        price,
        promoPrice,
      };
    }),
    ...packages.map((p) => {
      const { price, promoPrice } = priceFromDoc(p);
      return {
        id: p._id.toString(),
        kind: "package" as const,
        name: p.name,
        category: p.category?.trim() || "general",
        price,
        promoPrice,
      };
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create invoice"
        description="Work order / sales & installation order. Search the catalog to add products, then adjust quantities, labour, transport, discount, and VAT. Saving opens the invoice so you can print it or email it."
        actions={
          <Link
            href="/admin/sales/invoices"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            Saved invoices
          </Link>
        }
      />
      <InvoiceForm catalog={catalog} />
    </div>
  );
}
