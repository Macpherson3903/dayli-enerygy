import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { listOrdersForUser, safeOrderListForUser } from "@/lib/db/orders";
import {
  listInstallationBookingsForUser,
  safeInstallationBookingListForUser,
} from "@/lib/db/installation-bookings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  InstallationBookingStatusBadge,
  OrderStatusBadge,
} from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const orders = await listOrdersForUser(user.id);
  const list = safeOrderListForUser(orders);
  const bookingRaw = await listInstallationBookingsForUser(user.id);
  const bookings = safeInstallationBookingListForUser(bookingRaw);

  return (
    <div>
      <PageHeader
        title="Account"
        description={`Signed in as ${user.emailAddresses[0]?.emailAddress ?? "user"}`}
        actions={
          <div className="flex gap-2">
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              All orders
            </Link>
            <Link
              href="/account/bookings"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              All bookings
            </Link>
          </div>
        }
      />
      {list.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="When you submit a request, it will appear here while you are signed in."
          action={{ label: "Browse products", href: "/order" }}
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
      {bookings.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No installation bookings yet"
            message="When you submit an installation booking while signed in, it will appear here."
            action={{ label: "Book installation", href: "/installation-booking" }}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-medium uppercase text-gray-500">
            Recent installation bookings
          </h2>
          {bookings.slice(0, 5).map((booking) => (
            <Card
              key={booking._id}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{booking.bookingNumber}</p>
                <p className="text-sm text-gray-500">
                  {booking.site.city}, {booking.site.state} ·{" "}
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <InstallationBookingStatusBadge status={booking.status} />
                <Link
                  href={`/account/bookings/${booking._id}`}
                  className="text-sm font-medium text-brand-700 hover:underline"
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
