import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getInstallationBookingByIdForUser } from "@/lib/db/installation-bookings";
import { BookingLoadEstimateSection } from "@/components/installation/BookingLoadEstimateSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { InstallationBookingStatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function AccountBookingDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) {
    notFound();
  }

  const booking = await getInstallationBookingByIdForUser(id, user.id);
  if (!booking) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={booking.bookingNumber}
        description={new Date(booking.createdAt).toLocaleString()}
        actions={
          <span className="shrink-0">
            <InstallationBookingStatusBadge status={booking.status} />
          </span>
        }
      />
      <div className="space-y-6">
        <Card>
          <h2 className="mb-2 text-sm font-medium text-gray-500">Site details</h2>
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
        <Card>
          <h2 className="mb-2 text-sm font-medium text-gray-500">Schedule</h2>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Preferred date: </span>
            {booking.schedule.preferredDate}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Preferred time: </span>
            {booking.schedule.preferredTime}
          </p>
          {booking.details.electricityBillRange !== "unknown" ? (
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-medium">Estimated bill: </span>
              {booking.details.electricityBillRange}
            </p>
          ) : null}
          <BookingLoadEstimateSection booking={booking} heading="Your load estimate" />
          {booking.details.message && (
            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
              <span className="font-medium">Your notes: </span>
              {booking.details.message}
            </p>
          )}
        </Card>
        <p className="text-sm text-gray-500">
          <Link href="/account/bookings" className="text-brand-700 hover:underline">
            Back to bookings
          </Link>
        </p>
      </div>
    </div>
  );
}
