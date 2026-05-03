import Link from "next/link";
import { listProductAgentInquiries } from "@/lib/db/product-agent-inquiries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ProductAgentInquiryStatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ProductInquiriesPage() {
  const inquiries = await listProductAgentInquiries();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product inquiries"
        description="Messages from “Talk to an agent” on product pages. Follow up even if the customer did not see email — reference numbers match confirmation emails."
      />
      <ul className="space-y-2" role="list">
        {inquiries.length === 0 ? (
          <li className="text-sm text-gray-500">No inquiries yet.</li>
        ) : (
          inquiries.map((row) => (
            <li key={row._id.toString()}>
              <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium">{row.inquiryNumber}</p>
                  <p className="text-sm text-gray-600">
                    {row.name} · {row.email}
                    {row.phone ? ` · ${row.phone}` : ""}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {row.productName} · {row.createdAt.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ProductAgentInquiryStatusBadge status={row.status} />
                  <Link
                    className="text-sm text-brand-700 font-medium"
                    href={`/admin/sales/product-inquiries/${row._id.toString()}`}
                  >
                    Open
                  </Link>
                </div>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
