"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { InstallationBookingStatusBadge } from "@/components/ui/StatusBadge";
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

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function rowMatches(query: string, row: BookingListRow): boolean {
  const terms = normalize(query)
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return true;
  const hay = [
    row.bookingNumber,
    row.customerName,
    row.customerEmail,
    row.siteAddress,
    row.city,
    row.state,
  ]
    .map(normalize)
    .join(" ");
  return terms.every((t) => hay.includes(t));
}

export function BookingsSearchableList({ rows }: { rows: BookingListRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => rows.filter((r) => rowMatches(search, r)),
    [rows, search]
  );

  return (
    <div className="space-y-4">
      <Input
        label="Search bookings"
        name="bookingSearch"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Booking number, name, email, or location…"
        autoComplete="off"
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
