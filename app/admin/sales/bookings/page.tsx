import Link from "next/link";
import { listAllInstallationBookings } from "@/lib/db/installation-bookings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { InstallationBookingStatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function SalesBookingsPage() {
  const bookings = await listAllInstallationBookings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Installation bookings"
        description="All installation booking requests submitted on the website."
      />
      <ul className="space-y-2" role="list">
        {bookings.map((booking) => (
          <li key={booking._id.toString()}>
            <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{booking.bookingNumber}</p>
                <p className="text-sm text-gray-600">
                  {booking.customer.name} · {booking.customer.email}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {booking.site.city}, {booking.site.state} ·{" "}
                  {booking.createdAt.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <InstallationBookingStatusBadge status={booking.status} />
                <Link
                  className="text-sm font-medium text-brand-700"
                  href={`/admin/sales/bookings/${booking._id.toString()}`}
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
