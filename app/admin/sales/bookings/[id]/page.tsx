import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstallationBookingById } from "@/lib/db/installation-bookings";
import { BookingLoadEstimateSection } from "@/components/installation/BookingLoadEstimateSection";
import { getInitialProposalPayloadForEditor } from "@/lib/proposal-defaults";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { InstallationBookingStatusBadge } from "@/components/ui/StatusBadge";
import { ProposalFormEditor } from "@/components/admin/ProposalFormEditor";
import {
  BookingPrintDock,
  BookingPrintHint,
} from "@/components/admin/BookingPrintToolbar";
import { ProposalPayloadReadOnly } from "@/components/proposal/ProposalPayloadReadOnly";
import { BookingUpdateForm } from "./BookingUpdateForm";
import {
  INSTALLATION_BOOKING_STATUSES,
  INSTALLATION_BOOKING_STATUS_LABEL,
} from "@/lib/constants";
import type { ProposalApprovalStatus } from "@/lib/types";

const PROPOSAL_APPROVAL_PRINT_LABEL: Record<ProposalApprovalStatus, string> = {
  none: "Not started",
  draft: "Draft",
  sent: "Sent — awaiting client",
  approved: "Approved",
  declined: "Declined",
};

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

  const proposalPayload = getInitialProposalPayloadForEditor(booking);
  const proposalApprovalStatus: ProposalApprovalStatus =
    booking.proposal?.approval?.status ?? "none";
  const proposalApprovedMeta =
    proposalApprovalStatus === "approved" &&
    booking.proposal?.approval?.signerName &&
    booking.proposal?.approval?.approvedAt
      ? {
          signerName: booking.proposal.approval.signerName,
          approvedAt: booking.proposal.approval.approvedAt,
        }
      : null;

  return (
    <div className="booking-print-root space-y-6">
      <div className="hidden print:block border-b border-gray-300 pb-4 print:break-inside-avoid">
        <p className="text-sm font-semibold text-gray-900">Dayli Energy</p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">
          Installation booking record
        </h1>
        <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Reference</dt>
            <dd className="font-medium text-gray-900">{booking.bookingNumber}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Created</dt>
            <dd>{booking.createdAt.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Booking status</dt>
            <dd>{INSTALLATION_BOOKING_STATUS_LABEL[booking.status]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Proposal workflow</dt>
            <dd>{PROPOSAL_APPROVAL_PRINT_LABEL[proposalApprovalStatus]}</dd>
          </div>
        </dl>
        {proposalApprovedMeta ? (
          <p className="mt-3 text-sm text-gray-700">
            Approved by <span className="font-medium">{proposalApprovedMeta.signerName}</span>
            {proposalApprovedMeta.approvedAt
              ? ` on ${proposalApprovedMeta.approvedAt.toLocaleString()}`
              : ""}
            .
          </p>
        ) : null}
      </div>

      <div className="print:hidden space-y-3">
        <PageHeader
          title={booking.bookingNumber}
          description={booking.createdAt.toLocaleString()}
          actions={
            <span>
              <InstallationBookingStatusBadge status={booking.status} />
            </span>
          }
        />
        <BookingPrintHint />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="print:shadow-none print:break-inside-avoid">
          <h2 className="mb-2 text-sm font-medium text-gray-500">Customer</h2>
          <p className="text-sm font-medium text-gray-900">{booking.customer.name}</p>
          <p className="text-sm text-gray-600">{booking.customer.email}</p>
          <p className="text-sm text-gray-600">{booking.customer.phone}</p>
        </Card>

        <Card className="print:shadow-none print:break-inside-avoid">
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

      <Card className="print:shadow-none print:break-inside-auto">
        <h2 className="mb-2 text-sm font-medium text-gray-500">Schedule and notes</h2>
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
        <BookingLoadEstimateSection
          booking={booking}
          heading="Load estimate (quotation)"
        />
        {booking.details.message && (
          <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
            <span className="font-medium">Customer notes: </span>
            {booking.details.message}
          </p>
        )}
      </Card>

      <div className="hidden print:block print:break-inside-avoid">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Internal
        </h2>
        <p className="mt-2 text-sm text-gray-800">
          <span className="font-medium text-gray-700">Internal notes: </span>
          {booking.internalNotes?.trim() ? (
            <span className="whitespace-pre-line">{booking.internalNotes}</span>
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </p>
      </div>

      <div className="print:hidden space-y-6">
        <BookingUpdateForm
          bookingId={id}
          currentStatus={booking.status}
          internalNotes={booking.internalNotes}
          statusOptions={INSTALLATION_BOOKING_STATUSES}
        />

        <ProposalFormEditor
          bookingId={id}
          bookingNumber={booking.bookingNumber}
          initialPayload={proposalPayload}
          approvalStatus={proposalApprovalStatus}
          approvedMeta={proposalApprovedMeta}
        />
      </div>

      <div className="hidden print:block space-y-4 print:break-inside-auto">
        <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-300 pb-2 print:break-after-avoid">
          Installation proposal (snapshot)
        </h2>
        <ProposalPayloadReadOnly data={proposalPayload} />
      </div>

      <p className="print:hidden pb-20 md:pb-16">
        <Link
          href="/admin/sales/bookings"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Back to bookings
        </Link>
      </p>

      <BookingPrintDock />
    </div>
  );
}
