"use client";

import { useActionState, useEffect } from "react";
import { updateInstallationBookingStatusAction } from "@/app/actions/bookings";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { InstallationBookingStatus } from "@/lib/types";
import { INSTALLATION_BOOKING_STATUS_LABEL } from "@/lib/constants";
import { useStatusMessage } from "@/context/StatusMessageContext";

type S = { error?: string; ok?: boolean } | undefined;

const initial: S = undefined;

export function BookingUpdateForm({
  bookingId,
  currentStatus,
  internalNotes,
  statusOptions,
}: {
  bookingId: string;
  currentStatus: InstallationBookingStatus;
  internalNotes: string;
  statusOptions: InstallationBookingStatus[];
}) {
  const { showStatusMessage } = useStatusMessage();
  const [state, formAction, pending] = useActionState(
    updateInstallationBookingStatusAction,
    initial
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      showStatusMessage(`Booking update failed: ${state.error}`, "error");
      return;
    }
    if (state.ok) {
      showStatusMessage("Booking updated successfully.", "success");
    }
  }, [state, showStatusMessage]);

  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium text-gray-500">Update booking</h2>
      {state?.error && (
        <p className="mb-2 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="mb-2 text-sm text-green-600" role="status">
          Saved.
        </p>
      )}
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="bookingId" value={bookingId} readOnly />
        <div>
          <label htmlFor="status" className="mb-1 block text-sm text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            defaultValue={currentStatus}
            required
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {INSTALLATION_BOOKING_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>
        <Textarea
          name="internalNotes"
          label="Internal notes (team only)"
          defaultValue={internalNotes}
          rows={4}
          className="font-mono text-sm"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save update"}
        </Button>
      </form>
    </Card>
  );
}
