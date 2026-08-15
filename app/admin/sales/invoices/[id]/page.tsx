import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/db/invoices";
import { PageHeader } from "@/components/ui/PageHeader";
import { InvoiceDocument } from "@/components/admin/InvoiceDocument";
import { InvoicePrintButton } from "@/components/admin/InvoicePrintButton";
import { InvoiceSendEmailForm } from "@/components/admin/InvoiceSendEmailForm";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Work order ${invoice.workOrderNumber}`}
        description={`${invoice.customer.name} · ${invoice.issuedAt.toLocaleDateString()} · saved invoice`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/sales/invoices"
              className="text-sm font-medium text-brand-700 hover:underline print:hidden"
            >
              Saved invoices
            </Link>
            <InvoicePrintButton />
          </div>
        }
      />

      <InvoiceSendEmailForm
        invoiceId={id}
        defaultEmail={invoice.customer.email}
        lastSentTo={invoice.lastSentTo}
        lastSentAtLabel={invoice.lastSentAt ? invoice.lastSentAt.toLocaleString() : null}
      />

      <div className="sizing-print-root space-y-6">
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
}
