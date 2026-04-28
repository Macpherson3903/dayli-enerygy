import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstallationBookingById } from "@/lib/db/installation-bookings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { InstallationBookingStatusBadge } from "@/components/ui/StatusBadge";
import { BookingUpdateForm } from "./BookingUpdateForm";
import { INSTALLATION_BOOKING_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function SalesBookingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const booking = await getInstallationBookingById(id);
  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={booking.bookingNumber}
        description={booking.createdAt.toLocaleString()}
        actions={
          <span>
            <InstallationBookingStatusBadge status={booking.status} />
          </span>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-sm font-medium text-gray-500">Customer</h2>
          <p className="text-sm font-medium text-gray-900">{booking.customer.name}</p>
          <p className="text-sm text-gray-600">{booking.customer.email}</p>
          <p className="text-sm text-gray-600">{booking.customer.phone}</p>
        </Card>

        <Card>
          <h2 className="mb-2 text-sm font-medium text-gray-500">Site</h2>
          <p className="text-sm text-gray-700">{booking.site.address}</p>
          <p className="text-sm text-gray-700">
            {booking.site.city}, {booking.site.state}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            <span className="font-medium">Property: </span>
            {booking.site.propertyType}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Roof: </span>
            {booking.site.roofType}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-gray-500">Schedule and notes</h2>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Preferred date: </span>
          {booking.schedule.preferredDate}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Preferred time: </span>
          {booking.schedule.preferredTime}
        </p>
        <p className="mt-2 text-sm text-gray-700">
          <span className="font-medium">Estimated bill: </span>
          {booking.details.electricityBillRange}
        </p>
        {booking.details.message && (
          <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
            <span className="font-medium">Customer notes: </span>
            {booking.details.message}
          </p>
        )}
      </Card>

      <BookingUpdateForm
        bookingId={id}
        currentStatus={booking.status}
        internalNotes={booking.internalNotes}
        statusOptions={INSTALLATION_BOOKING_STATUSES}
      />

      <p>
        <Link
          href="/admin/sales/bookings"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Back to bookings
        </Link>
      </p>
    </div>
  );
}
