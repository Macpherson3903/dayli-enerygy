import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/db/orders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import { OrderUpdateForm } from "./OrderUpdateForm";
import { ORDER_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function SalesOrderPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={order.createdAt.toLocaleString()}
        actions={
          <span>
            <OrderStatusBadge status={order.status} />
          </span>
        }
      />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-medium text-gray-500 mb-2">Line items</h2>
          <ul className="divide-y text-sm">
            {order.lineItems.map((l, i) => (
              <li
                key={`${l.productId}-${i}`}
                className="flex justify-between py-2"
              >
                <span>
                  {l.name} × {l.quantity}
                </span>
                <span>₦{(l.price * l.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-sm font-medium text-gray-500 mb-2">Customer</h2>
          <p className="text-sm font-medium text-gray-900">
            {order.contact.name}
          </p>
          <p className="text-sm text-gray-600">{order.contact.email}</p>
          <p className="text-sm text-gray-600">{order.contact.phone}</p>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
            {order.contact.address}
          </p>
          {order.contact.notes && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Customer notes: </span>
              {order.contact.notes}
            </p>
          )}
          {order.contact.preferredTime && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Preferred time: </span>
              {order.contact.preferredTime}
            </p>
          )}
        </Card>
      </div>
      <OrderUpdateForm
        orderId={id}
        currentStatus={order.status}
        internalNotes={order.internalNotes}
        statusOptions={ORDER_STATUSES}
      />
      <p>
        <Link
          href="/admin/sales"
          className="text-sm text-brand-700 font-medium hover:underline"
        >
          Back to sales
        </Link>
      </p>
    </div>
  );
}
