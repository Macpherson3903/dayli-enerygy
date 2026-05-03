import { notFound } from "next/navigation";
import Link from "next/link";
import { getInstallationBookingByProposalToken } from "@/lib/db/installation-bookings";
import { ProposalPayloadReadOnly } from "@/components/proposal/ProposalPayloadReadOnly";
import { ProposalApproveClient } from "./ProposalApproveClient";

export const dynamic = "force-dynamic";

type Params = { token: string };

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw);
  const booking = await getInstallationBookingByProposalToken(token);
  const approval = booking?.proposal?.approval;
  const data = booking?.proposal?.data;

  if (!booking || !approval || !data) {
    notFound();
  }

  if (approval.status === "approved") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-gray-500">
          <Link href="/" className="font-medium text-brand-700 hover:underline">
            Dayli Energy
          </Link>
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Proposal approved</h1>
        <p className="mt-2 text-gray-600">
          This proposal was already approved
          {approval.signerName ? ` by ${approval.signerName}` : ""}
          {approval.approvedAt
            ? ` on ${new Date(approval.approvedAt).toLocaleString()}`
            : ""}
          .
        </p>
      </div>
    );
  }

  if (approval.status !== "sent") {
    notFound();
  }

  const exp = approval.tokenExpiresAt
    ? new Date(approval.tokenExpiresAt).getTime()
    : 0;
  if (!exp || exp <= Date.now()) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-gray-500">
        <Link href="/" className="font-medium text-brand-700 hover:underline">
          Dayli Energy
        </Link>
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">
        Installation proposal — {booking.bookingNumber}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Please review the details below. If everything looks correct, approve using the form at
        the bottom.
      </p>

      <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50/80 p-6 md:p-8">
        <ProposalPayloadReadOnly data={data} />
      </div>

      <div className="mt-10">
        <ProposalApproveClient token={token} />
      </div>
    </div>
  );
}
