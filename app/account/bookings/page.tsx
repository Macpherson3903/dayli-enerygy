import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  listInstallationBookingsForUser,
  safeInstallationBookingListForUser,
} from "@/lib/db/installation-bookings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { InstallationBookingStatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AccountBookingsPage() {
  const user = await currentUser();
  if (!user) return null;
  const raw = await listInstallationBookingsForUser(user.id);
  const list = safeInstallationBookingListForUser(raw);

  return (
    <div>
      <PageHeader
        title="Your bookings"
        description="Track updates for your installation requests."
      />
      {list.length === 0 ? (
        <EmptyState
          title="No bookings"
          message="You have not submitted an installation booking while signed in yet."
          action={{ label: "Book installation", href: "/installation-booking" }}
        />
      ) : (
        <ul className="space-y-3" role="list">
          {list.map((booking) => (
            <li key={booking._id}>
              <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{booking.bookingNumber}</p>
                  <p className="text-sm text-gray-500">
                    {booking.site.city}, {booking.site.state} ·{" "}
                    {new Date(booking.createdAt).toLocaleString()}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
