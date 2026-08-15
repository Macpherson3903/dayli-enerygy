import { listAllOrders } from "@/lib/db/orders";
import { PageHeader } from "@/components/ui/PageHeader";
import { OrdersSearchableList } from "@/components/admin/OrdersSearchableList";

export const dynamic = "force-dynamic";

export default async function SalesOrdersPage() {
  const orders = await listAllOrders();
  const rows = orders.map((order) => ({
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerName: order.contact.name,
    customerEmail: order.contact.email,
    customerPhone: order.contact.phone,
    lineCount: order.lineItems.length,
    createdAtLabel: order.createdAt.toLocaleString(),
    status: order.status,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="All order requests submitted on the website. Search by order number, customer name, email, or phone."
      />
      <OrdersSearchableList rows={rows} />
    </div>
  );
}
