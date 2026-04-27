import Link from "next/link";
import { listAllOrders } from "@/lib/db/orders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function StatusSummary({ orders }: { orders: { status: OrderStatus }[] }) {
  const counts: Record<OrderStatus, number> = {
    new: 0,
    contacted: 0,
    scheduled: 0,
    fulfilled: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    counts[o.status]++;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {ORDER_STATUSES.map((s) => (
        <div key={s} className="rounded-xl border border-gray-200 p-3 bg-white">
          <p className="text-xs text-gray-500">{ORDER_STATUS_LABEL[s]}</p>
          <p className="text-2xl font-semibold">{counts[s]}</p>
        </div>
      ))}
    </div>
  );
}

export default async function SalesAdminPage() {
  const orders = await listAllOrders();
  const customers = (() => {
    const m = new Map<
      string,
      { name: string; last: Date }
    >();
    for (const o of orders) {
      const email = o.contact.email.toLowerCase();
      const prev = m.get(email);
      if (!prev || o.createdAt > prev.last) {
        m.set(email, { name: o.contact.name, last: o.createdAt });
      }
    }
    return Array.from(m.entries())
      .map(([email, v]) => ({
        email,
        name: v.name,
        lastOrder: v.last,
      }))
      .sort((a, b) => b.lastOrder.getTime() - a.lastOrder.getTime());
  })();

  return (
    <div className="space-y-10">
      <PageHeader
        title="Sales"
        description="All order requests, customer contacts, and pipeline health."
      />
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Pipeline
        </h2>
        <StatusSummary orders={orders} />
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Orders
        </h2>
        <ul className="space-y-2" role="list">
          {orders.map((o) => (
            <li key={o._id.toString()}>
              <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-gray-600">
                    {o.contact.name} · {o.contact.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {o.lineItems.length} line(s) · {o.createdAt.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={o.status} />
                  <Link
                    className="text-sm text-brand-700 font-medium"
                    href={`/admin/sales/orders/${o._id.toString()}`}
                  >
                    Open
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Customers (from orders)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Last request</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.email}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">
                    {c.lastOrder.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
