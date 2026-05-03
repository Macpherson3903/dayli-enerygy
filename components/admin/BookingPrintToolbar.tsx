"use client";

import { useId } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Printer } from "lucide-react";

/** Print control for booking detail: keyboard-activatable, named for assistive tech, with extra description on focus. */
export function BookingPrintButton({ className = "" }: { className?: string }) {
  const descriptionId = useId();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className={clsx("gap-2 shrink-0", className)}
      onClick={() => window.print()}
      aria-describedby={descriptionId}
    >
      <Printer className="h-4 w-4 shrink-0" aria-hidden />
      Print booking
      <span id={descriptionId} className="sr-only">
        Opens the browser print dialog. The printed page hides the admin sidebar, navigation, and
        editable forms, and includes the booking details and proposal snapshot.
      </span>
    </Button>
  );
}

/**
 * Fixed print control so it stays reachable while scrolling long booking / proposal forms.
 * Hidden when printing; sits above main content (below typical modals).
 */
export function BookingPrintDock() {
  return (
    <div
      className={clsx(
        "print:hidden fixed z-40 flex justify-end",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        "right-[max(1rem,env(safe-area-inset-right))]",
        "md:bottom-6 md:right-6"
      )}
      role="region"
      aria-label="Print this booking"
    >
      <BookingPrintButton className="shadow-lg ring-1 ring-gray-200/80 bg-white hover:bg-gray-50" />
    </div>
  );
}

/** Visible hint below the header (optional companion to {@link BookingPrintButton}). */
export function BookingPrintHint() {
  return (
    <p className="text-xs text-gray-500 print:hidden max-w-2xl">
      A <strong className="font-medium text-gray-600">Print booking</strong> button stays fixed at
      the bottom-right while you scroll. The printed copy omits navigation and form controls.
    </p>
  );
}
