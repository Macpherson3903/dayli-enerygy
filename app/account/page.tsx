import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { listOrdersForUser, safeOrderListForUser } from "@/lib/db/orders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const orders = await listOrdersForUser(user.id);
  const list = safeOrderListForUser(orders);

  return (
    <div>
      <PageHeader
        title="Account"
        description={`Signed in as ${user.emailAddresses[0]?.emailAddress ?? "user"}`}
        actions={
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            All orders
          </Link>
        }
      />
      {list.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="When you submit a request, it will appear here while you are signed in."
          action={{ label: "Go to shop", href: "/shop" }}
        />
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase">
            Recent orders
          </h2>
          {list.slice(0, 5).map((o) => (
            <Card key={o._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {o.lineItems.length} line(s) ·{" "}
                  {new Date(o.createdAt).toLocaleDateString()}
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
          ))}
        </div>
      )}
    </div>
  );
}
