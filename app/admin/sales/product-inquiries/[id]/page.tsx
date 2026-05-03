import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductAgentInquiryById } from "@/lib/db/product-agent-inquiries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ProductAgentInquiryStatusBadge } from "@/components/ui/StatusBadge";
import { ProductAgentInquiryUpdateForm } from "./ProductAgentInquiryUpdateForm";
import { PRODUCT_AGENT_INQUIRY_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { id: string };

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export default async function ProductInquiryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const row = await getProductAgentInquiryById(id);
  if (!row) {
    notFound();
  }

  const productUrl = `${getAppUrl()}/order/${encodeURIComponent(row.productSlug)}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={row.inquiryNumber}
        description={row.createdAt.toLocaleString()}
        actions={<ProductAgentInquiryStatusBadge status={row.status} />}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-sm font-medium text-gray-500">Customer</h2>
          <p className="text-sm font-medium text-gray-900">{row.name}</p>
          <p className="text-sm text-gray-600">{row.email}</p>
          {row.phone ? (
            <p className="text-sm text-gray-600">{row.phone}</p>
          ) : null}
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-medium text-gray-500">Product</h2>
          <p className="text-sm font-medium text-gray-900">{row.productName}</p>
          <p className="text-xs text-gray-500 mt-1">ID: {row.productId}</p>
          <p className="mt-2">
            <Link
              href={productUrl}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              View product page
            </Link>
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-gray-500">Customer message</h2>
        <p className="text-sm text-gray-800 whitespace-pre-line">{row.message}</p>
      </Card>

      <ProductAgentInquiryUpdateForm
        inquiryId={id}
        currentStatus={row.status}
        internalNotes={row.internalNotes}
        statusOptions={PRODUCT_AGENT_INQUIRY_STATUSES}
      />

      <p>
        <Link
          href="/admin/sales/product-inquiries"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Back to product inquiries
        </Link>
      </p>
    </div>
  );
}
