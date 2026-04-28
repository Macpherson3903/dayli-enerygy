import { listAllOrders } from "@/lib/db/orders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";
import { buildSalesChartMetrics } from "@/lib/analytics/sales";
import { ChartCard } from "@/components/charts/ChartCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { BreakdownBarChart } from "@/components/charts/BreakdownBarChart";
import { DistributionPieChart } from "@/components/charts/DistributionPieChart";
import { clerkClient } from "@clerk/nextjs/server";

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
  const salesCharts = buildSalesChartMetrics(orders);
  const client = await clerkClient();
  const users = await client.users.getUserList({ limit: 100 });
  const totalUsers = users.totalCount;
  const totalOrders = orders.length;
  const recentOrders = orders.slice(0, 5);
  const recentUsers = users.data
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Sales dashboard"
        description="Summary of website activity, pipeline health, and recent signups."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs uppercase text-gray-500">Total orders</p>
          <p className="text-3xl font-semibold mt-1">{totalOrders}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-gray-500">Signed up users</p>
          <p className="text-3xl font-semibold mt-1">{totalUsers}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-gray-500">New orders</p>
          <p className="text-3xl font-semibold mt-1">
            {orders.filter((order) => order.status === "new").length}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-gray-500">Fulfilled orders</p>
          <p className="text-3xl font-semibold mt-1">
            {orders.filter((order) => order.status === "fulfilled").length}
          </p>
        </Card>
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Pipeline
        </h2>
        <StatusSummary orders={orders} />
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Dashboard insights
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <ChartCard
            title="Orders and users trend"
            description="Daily totals based on order creation dates."
          >
            <TrendLineChart data={salesCharts.ordersAndCustomersByDay} />
          </ChartCard>
          <ChartCard
            title="Order status counts"
            description="Current pipeline distribution by status."
          >
            <BreakdownBarChart data={salesCharts.statusBreakdown} />
          </ChartCard>
          <ChartCard
            title="Status distribution"
            description="Relative share of each order status."
          >
            <DistributionPieChart data={salesCharts.statusBreakdown} />
          </ChartCard>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Recent orders
        </h2>
        <ul className="space-y-2" role="list">
          {recentOrders.map((o) => (
            <li key={o._id.toString()}>
              <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-gray-600">
                    {o.contact.name} · {o.contact.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {o.lineItems.length} line(s) · {o.createdAt.toLocaleString()}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {ORDER_STATUS_LABEL[o.status]}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Recent signups
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Signup date</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-2">
                    {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {u.emailAddresses[0]?.emailAddress ?? "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {u.createdAt.toLocaleString()}
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
