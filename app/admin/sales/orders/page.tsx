import Link from "next/link";
import { listAllOrders } from "@/lib/db/orders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function SalesOrdersPage() {
  const orders = await listAllOrders();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="All order requests submitted on the website."
      />
      <ul className="space-y-2" role="list">
        {orders.map((order) => (
          <li key={order._id.toString()}>
            <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-gray-600">
                  {order.contact.name} · {order.contact.email}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.lineItems.length} line(s) ·{" "}
                  {order.createdAt.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <Link
                  className="text-sm text-brand-700 font-medium"
                  href={`/admin/sales/orders/${order._id.toString()}`}
                >
                  Open
                </Link>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
