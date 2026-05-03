import Link from "next/link";
import { listAllOrders } from "@/lib/db/orders";
import { listAllInstallationBookings } from "@/lib/db/installation-bookings";
import { listProductAgentInquiries } from "@/lib/db/product-agent-inquiries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  INSTALLATION_BOOKING_STATUS_LABEL,
  INSTALLATION_BOOKING_STATUSES,
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  PRODUCT_AGENT_INQUIRY_STATUS_LABEL,
} from "@/lib/constants";
import { buildSalesChartMetrics } from "@/lib/analytics/sales";
import { ChartCard } from "@/components/charts/ChartCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { BreakdownBarChart } from "@/components/charts/BreakdownBarChart";
import { DistributionPieChart } from "@/components/charts/DistributionPieChart";
import { CategoricalLineChart } from "@/components/charts/CategoricalLineChart";
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

function formatTimestamp(value: number | null | undefined): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export default async function SalesAdminPage() {
  const [orders, installationBookings, productInquiries] = await Promise.all([
    listAllOrders(),
    listAllInstallationBookings(),
    listProductAgentInquiries(),
  ]);

  const salesCharts = buildSalesChartMetrics(orders, installationBookings);
  const client = await clerkClient();
  const userList = await client.users.getUserList({ limit: 100 });
  const totalUsers = userList.totalCount;
  const totalOrders = orders.length;
  const totalBookings = installationBookings.length;
  const recentOrders = orders.slice(0, 5);
  const recentBookings = installationBookings.slice(0, 5);
  const recentUsers = userList.data
    .slice()
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, 5);

  const newOrdersCount = orders.filter((o) => o.status === "new").length;
  const newBookingsCount = installationBookings.filter((b) => b.status === "new").length;
  const newProductInquiriesCount = productInquiries.filter((q) => q.status === "new").length;
  const installedBookingsCount = installationBookings.filter(
    (b) => b.status === "installed"
  ).length;

  const headlineSnapshotData = [
    { label: "Total orders", value: totalOrders },
    { label: "Install bookings", value: totalBookings },
    { label: "Product inquiries", value: productInquiries.length },
    { label: "Signed-up users", value: totalUsers },
    { label: "New orders", value: newOrdersCount },
    { label: "New bookings", value: newBookingsCount },
    { label: "New product inquiries", value: newProductInquiriesCount },
    { label: "Installed (bookings)", value: installedBookingsCount },
  ];

  const orderPipelineData = ORDER_STATUSES.map((s) => ({
    label: ORDER_STATUS_LABEL[s],
    value: orders.filter((o) => o.status === s).length,
  }));

  const bookingPipelineData = INSTALLATION_BOOKING_STATUSES.map((s) => ({
    label: INSTALLATION_BOOKING_STATUS_LABEL[s],
    value: installationBookings.filter((b) => b.status === s).length,
  }));

  const summaryBreakdown = [
    { label: "Orders", value: totalOrders },
    { label: "Bookings", value: totalBookings },
    { label: "Product inquiries", value: productInquiries.length },
    { label: "Users", value: totalUsers },
    { label: "New orders", value: newOrdersCount },
    { label: "New bookings", value: newBookingsCount },
    { label: "New inquiries", value: newProductInquiriesCount },
    { label: "Installed", value: installedBookingsCount },
  ];

  const recentInquiries = productInquiries.slice(0, 5);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Sales dashboard"
        description="Live counts from MongoDB (orders, installation bookings, product inquiries) and Clerk (users)."
      />
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Headline metrics (snapshot)
        </h2>
        <ChartCard
          title="Key volumes"
          description="Current totals from MongoDB and Clerk. New orders, bookings, and product inquiries match sidebar unattended badges. Hover points for exact values."
        >
          <CategoricalLineChart data={headlineSnapshotData} xTickAngle={-22} />
        </ChartCard>
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">Pipelines</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard
            title="Order pipeline"
            description="Product orders by status (same counts as the former cards)."
          >
            <CategoricalLineChart data={orderPipelineData} />
          </ChartCard>
          <ChartCard
            title="Installation booking pipeline"
            description="Installation bookings by status."
          >
            <CategoricalLineChart data={bookingPipelineData} xTickAngle={-30} />
          </ChartCard>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">Dashboard insights</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChartCard
            title="Volume summary"
            description="Totals from the database and Clerk (user count may exceed loaded sample)."
          >
            <BreakdownBarChart data={summaryBreakdown} />
          </ChartCard>
          <ChartCard
            title="Summary distribution"
            description="Relative share of headline metrics."
          >
            <DistributionPieChart data={summaryBreakdown} />
          </ChartCard>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Activity trend & pipeline
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <ChartCard
            title="Orders, bookings & unique order emails"
            description="Daily new orders and installation bookings (Mongo). “Unique order emails” counts distinct customer emails on orders created that day."
          >
            <TrendLineChart data={salesCharts.ordersAndCustomersByDay} />
          </ChartCard>
          <ChartCard
            title="Order status counts"
            description="Current product order pipeline distribution."
          >
            <BreakdownBarChart data={salesCharts.statusBreakdown} />
          </ChartCard>
          <ChartCard title="Order status share" description="Share of each order status.">
            <DistributionPieChart data={salesCharts.statusBreakdown} />
          </ChartCard>
        </div>
      </div>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
          <h2 className="text-sm font-medium text-gray-500 uppercase">
            Recent product inquiries
          </h2>
          <Link
            href="/admin/sales/product-inquiries"
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            View all
          </Link>
        </div>
        <ul className="space-y-2" role="list">
          {recentInquiries.length === 0 ? (
            <li className="text-sm text-gray-500">No product inquiries yet.</li>
          ) : (
            recentInquiries.map((q) => (
              <li key={q._id.toString()}>
                <Link href={`/admin/sales/product-inquiries/${q._id.toString()}`}>
                  <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 transition hover:border-brand-200">
                    <div>
                      <p className="font-medium">{q.inquiryNumber}</p>
                      <p className="text-sm text-gray-600">
                        {q.name} · {q.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {q.productName} · {q.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {PRODUCT_AGENT_INQUIRY_STATUS_LABEL[q.status]}
                    </div>
                  </Card>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
          <h2 className="text-sm font-medium text-gray-500 uppercase">Recent orders</h2>
          <Link
            href="/admin/sales/orders"
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            View all
          </Link>
        </div>
        <ul className="space-y-2" role="list">
          {recentOrders.length === 0 ? (
            <li className="text-sm text-gray-500">No orders yet.</li>
          ) : (
            recentOrders.map((o) => (
              <li key={o._id.toString()}>
                <Link href={`/admin/sales/orders/${o._id.toString()}`}>
                  <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 transition hover:border-brand-200">
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
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
          <h2 className="text-sm font-medium text-gray-500 uppercase">Recent bookings</h2>
          <Link
            href="/admin/sales/bookings"
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            View all
          </Link>
        </div>
        <ul className="space-y-2" role="list">
          {recentBookings.length === 0 ? (
            <li className="text-sm text-gray-500">No installation bookings yet.</li>
          ) : (
            recentBookings.map((b) => (
              <li key={b._id.toString()}>
                <Link href={`/admin/sales/bookings/${b._id.toString()}`}>
                  <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 transition hover:border-brand-200">
                    <div>
                      <p className="font-medium">{b.bookingNumber}</p>
                      <p className="text-sm text-gray-600">
                        {b.customer.name} · {b.customer.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {b.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {INSTALLATION_BOOKING_STATUS_LABEL[b.status]}
                    </div>
                  </Card>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">Recent signups</h2>
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
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-gray-500">
                    No users in the loaded sample.
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
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
                    <td className="px-4 py-2">{formatTimestamp(u.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalUsers > recentUsers.length ? (
          <p className="mt-2 text-xs text-gray-500">
            Showing {recentUsers.length} of {totalUsers} users (Clerk). Open{" "}
            <Link href="/admin/sales/users" className="text-brand-700 hover:underline">
              Users
            </Link>{" "}
            for the directory.
          </p>
        ) : null}
      </div>
    </div>
  );
}
