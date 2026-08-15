import Link from "next/link";
import { listAllInvoices } from "@/lib/db/invoices";
import { PageHeader } from "@/components/ui/PageHeader";
import { InvoicesSearchableList } from "@/components/admin/InvoicesSearchableList";
import { formatNaira } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function SalesInvoicesPage() {
  const invoices = await listAllInvoices();
  const rows = invoices.map((invoice) => ({
    id: invoice._id.toString(),
    workOrderNumber: invoice.workOrderNumber,
    customerName: invoice.customer.name,
    customerPhone: invoice.customer.phone,
    customerEmail: invoice.customer.email,
    city: invoice.customer.city,
    grandTotalLabel: formatNaira(invoice.grandTotal),
    issuedAtLabel: invoice.issuedAt.toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Work orders and sales invoices created by sales admin. Search by work order number, customer name, or phone."
        actions={
          <Link
            href="/admin/sales/invoices/new"
            className="inline-flex items-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-900"
          >
            Create invoice
          </Link>
        }
      />
      <InvoicesSearchableList rows={rows} />
    </div>
  );
}
