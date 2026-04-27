import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { listOrdersForUser, safeOrderListForUser } from "@/lib/db/orders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await currentUser();
  if (!user) return null;
  const raw = await listOrdersForUser(user.id);
  const list = safeOrderListForUser(raw);

  return (
    <div>
      <PageHeader
        title="Your orders"
        description="Status updates as our team processes your request."
      />
      {list.length === 0 ? (
        <EmptyState
          title="No orders"
          message="You have not placed an order while signed in yet."
          action={{ label: "Go to shop", href: "/shop" }}
        />
      ) : (
        <ul className="space-y-3" role="list">
          {list.map((o) => (
            <li key={o._id}>
              <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {o.lineItems.length} line(s) ·{" "}
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={o.status} />
                  <Link
                    href={`/account/orders/${o._id}`}
                    className="text-sm text-brand-700 font-medium hover:underline"
                  >
                    View
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
