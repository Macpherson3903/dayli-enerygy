import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getOrderByIdForUser } from "@/lib/db/orders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) {
    notFound();
  }
  const order = await getOrderByIdForUser(id, user.id);
  if (!order) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        description={new Date(order.createdAt).toLocaleString()}
        actions={
          <span className="shrink-0">
            <OrderStatusBadge status={order.status} />
          </span>
        }
      />
      <div className="space-y-6">
        <Card>
          <h2 className="text-sm font-medium text-gray-500 mb-2">Line items</h2>
          <ul className="divide-y">
            {order.lineItems.map((l, i) => (
              <li
                key={`${l.productId}-${i}`}
                className="flex justify-between py-2 text-sm"
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
          <h2 className="text-sm font-medium text-gray-500 mb-2">Contact</h2>
          <p className="text-sm text-gray-800">{order.contact.name}</p>
          <p className="text-sm text-gray-600">{order.contact.email}</p>
          <p className="text-sm text-gray-600">{order.contact.phone}</p>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
            {order.contact.address}
          </p>
        </Card>
        <p className="text-sm text-gray-500">
          <Link href="/account/orders" className="text-brand-700 hover:underline">
            Back to orders
          </Link>
        </p>
      </div>
    </div>
  );
}
