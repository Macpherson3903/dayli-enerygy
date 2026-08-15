"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdminSearchField } from "@/components/admin/AdminSearchField";
import { InstallationBookingStatusBadge } from "@/components/ui/StatusBadge";
import { matchesSearch } from "@/lib/admin/search";
import type { InstallationBookingStatus } from "@/lib/types";

export type BookingListRow = {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  siteAddress: string;
  city: string;
  state: string;
  createdAtLabel: string;
  status: InstallationBookingStatus;
};

function rowMatches(query: string, row: BookingListRow): boolean {
  return matchesSearch(query, [
    row.bookingNumber,
    row.customerName,
    row.customerEmail,
    row.siteAddress,
    row.city,
    row.state,
  ]);
}

export function BookingsSearchableList({ rows }: { rows: BookingListRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => rows.filter((r) => rowMatches(search, r)),
    [rows, search]
  );

  return (
    <div className="space-y-4">
      <AdminSearchField
        label="Search bookings"
        value={search}
        onChange={setSearch}
        placeholder="Booking number, name, email, or location…"
        hint={
          rows.length === 0
            ? undefined
            : `Showing ${filtered.length} of ${rows.length} booking${rows.length === 1 ? "" : "s"}`
        }
      />
      <ul className="space-y-2" role="list">
        {filtered.length === 0 ? (
          <li>
            <Card className="py-8 text-center text-sm text-gray-600">
              {rows.length === 0
                ? "No installation bookings yet."
                : "No bookings match your search. Try another term."}
            </Card>
          </li>
        ) : (
          filtered.map((booking) => (
            <li key={booking.id}>
              <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{booking.bookingNumber}</p>
                  <p className="text-sm text-gray-600">
                    {booking.customerName} · {booking.customerEmail}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {booking.city}, {booking.state} · {booking.createdAtLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <InstallationBookingStatusBadge status={booking.status} />
                  <Link
                    className="text-sm font-medium text-brand-700 hover:underline"
                    href={`/admin/sales/bookings/${booking.id}`}
                  >
                    Open
                  </Link>
                </div>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
