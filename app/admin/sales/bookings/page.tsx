import { listAllInstallationBookings } from "@/lib/db/installation-bookings";
import { PageHeader } from "@/components/ui/PageHeader";
import { BookingsSearchableList } from "@/components/admin/BookingsSearchableList";

export const dynamic = "force-dynamic";

export default async function SalesBookingsPage() {
  const bookings = await listAllInstallationBookings();

  const rows = bookings.map((booking) => ({
    id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    customerName: booking.customer.name,
    customerEmail: booking.customer.email,
    siteAddress: booking.site.address,
    city: booking.site.city,
    state: booking.site.state,
    createdAtLabel: booking.createdAt.toLocaleString(),
    status: booking.status,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Installation bookings"
        description="All installation booking requests submitted on the website. Use search to find a booking by number, customer, email, or location."
      />
      <BookingsSearchableList rows={rows} />
    </div>
  );
}
