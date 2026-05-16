import { randomBytes } from "crypto";
import { getDb } from "@/lib/mongodb";
import { generateBookingNumber } from "@/lib/booking-number";
import type { InstallationBookingInput } from "@/lib/validators";
import { ObjectId } from "mongodb";
import { formatProposalAppliancesToQuotationSummary } from "@/lib/content/quotation";
import type {
  InstallationBookingDoc,
  InstallationBookingProposal,
  InstallationBookingStatus,
  ProposalApplianceRow,
  ProposalApproval,
  ProposalPayload,
} from "@/lib/types";

const COL = "installation_bookings";

const PROPOSAL_TOKEN_BYTES = 24;

export function generateProposalApprovalToken(): string {
  return randomBytes(PROPOSAL_TOKEN_BYTES).toString("base64url");
}

function draftApproval(): ProposalApproval {
  return {
    status: "draft",
    token: null,
    tokenExpiresAt: null,
    sentAt: null,
    approvedAt: null,
    signerName: null,
    signerIp: null,
  };
}

export async function ensureInstallationBookingIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ bookingNumber: 1 }, { unique: true });
  await db.collection(COL).createIndex({ "customer.email": 1, createdAt: -1 });
  await db.collection(COL).createIndex({ status: 1, createdAt: -1 });
  await db.collection(COL).createIndex({ userId: 1, createdAt: -1 });
  await db.collection(COL).createIndex(
    { "proposal.approval.token": 1 },
    { unique: true, sparse: true }
  );
}

export async function createInstallationBooking(data: InstallationBookingInput) {
  if (!data.consent) {
    throw new Error("Consent is required");
  }

  await ensureInstallationBookingIndexes();
  const db = await getDb();
  const now = new Date();
  const booking: Omit<InstallationBookingDoc, "_id"> = {
    bookingNumber: generateBookingNumber(),
    customer: data.customer,
    site: data.site,
    schedule: data.schedule,
    details: data.details,
    consent: true,
    status: "new",
    internalNotes: "",
    userId: data.userId ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const r = await db.collection(COL).insertOne(booking);
  return { _id: r.insertedId, bookingNumber: booking.bookingNumber };
}

/** Removes a booking created during a failed request (e.g. email send failure). */
export async function deleteInstallationBookingById(id: string) {
  if (!ObjectId.isValid(id)) return;
  const db = await getDb();
  await db.collection(COL).deleteOne({ _id: new ObjectId(id) });
}

export async function getInstallationBookingById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db
    .collection<InstallationBookingDoc>(COL)
    .findOne({ _id: new ObjectId(id) });
}

export async function getInstallationBookingByIdForUser(id: string, userId: string) {
  const booking = await getInstallationBookingById(id);
  if (!booking || booking.userId !== userId) return null;
  return booking;
}

export async function listAllInstallationBookings() {
  await ensureInstallationBookingIndexes();
  const db = await getDb();
  return db
    .collection<InstallationBookingDoc>(COL)
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}

export async function countInstallationBookingsByStatus(
  status: InstallationBookingStatus
): Promise<number> {
  await ensureInstallationBookingIndexes();
  const db = await getDb();
  return db.collection(COL).countDocuments({ status });
}

export async function listInstallationBookingsForUser(userId: string) {
  await ensureInstallationBookingIndexes();
  const db = await getDb();
  return db
    .collection<InstallationBookingDoc>(COL)
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function updateInstallationBookingById(
  id: string,
  patch: { status?: InstallationBookingStatus; internalNotes?: string }
) {
  if (!ObjectId.isValid(id)) throw new Error("Invalid booking id");
  const db = await getDb();
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.status) set.status = patch.status;
  if (patch.internalNotes !== undefined) set.internalNotes = patch.internalNotes;
  await db
    .collection(COL)
    .updateOne({ _id: new ObjectId(id) }, { $set: set });
}

/** Keeps booking load estimate (structured + text) aligned with proposal appliances for all site views. */
export async function syncBookingLoadEstimateFromAppliances(
  bookingId: string,
  appliances: ProposalApplianceRow[]
) {
  if (!ObjectId.isValid(bookingId)) throw new Error("Invalid booking id");
  await ensureInstallationBookingIndexes();
  const db = await getDb();
  const quotationSummary = formatProposalAppliancesToQuotationSummary(appliances);
  await db.collection(COL).updateOne(
    { _id: new ObjectId(bookingId) },
    {
      $set: {
        "details.quotationAppliances": appliances,
        "details.quotationSummary": quotationSummary,
        updatedAt: new Date(),
      },
    }
  );
}

export async function saveProposalDraft(bookingId: string, data: ProposalPayload) {
  if (!ObjectId.isValid(bookingId)) throw new Error("Invalid booking id");
  await ensureInstallationBookingIndexes();
  const db = await getDb();
  const booking = await getInstallationBookingById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const st = booking.proposal?.approval?.status ?? "none";
  if (st === "sent") {
    throw new Error("Proposal is waiting for client approval; cannot edit draft.");
  }
  if (st === "approved") {
    throw new Error("Proposal is already approved; cannot edit.");
  }

  const proposal: InstallationBookingProposal = {
    data,
    approval: draftApproval(),
  };

  await db.collection(COL).updateOne(
    { _id: new ObjectId(bookingId) },
    { $set: { proposal, updatedAt: new Date() } }
  );
}

export async function setProposalSent(bookingId: string, data: ProposalPayload, token: string) {
  if (!ObjectId.isValid(bookingId)) throw new Error("Invalid booking id");
  await ensureInstallationBookingIndexes();
  const db = await getDb();
  const booking = await getInstallationBookingById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const st = booking.proposal?.approval?.status ?? "none";
  if (st === "sent") {
    throw new Error("Proposal was already sent to the client.");
  }
  if (st === "approved") {
    throw new Error("Proposal is already approved.");
  }

  const now = new Date();
  const tokenExpiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const approval: ProposalApproval = {
    status: "sent",
    token,
    tokenExpiresAt,
    sentAt: now,
    approvedAt: null,
    signerName: null,
    signerIp: null,
  };

  const proposal: InstallationBookingProposal = { data, approval };

  await db.collection(COL).updateOne(
    { _id: new ObjectId(bookingId) },
    { $set: { proposal, updatedAt: now } }
  );
}

/** Restore proposal after a failed post-`setProposalSent` email (or omit field if snapshot was null). */
export async function revertProposalToSnapshot(
  bookingId: string,
  snapshot: InstallationBookingProposal | null
) {
  if (!ObjectId.isValid(bookingId)) throw new Error("Invalid booking id");
  const db = await getDb();
  if (snapshot === null) {
    await db.collection(COL).updateOne(
      { _id: new ObjectId(bookingId) },
      { $unset: { proposal: "" }, $set: { updatedAt: new Date() } }
    );
    return;
  }
  await db.collection(COL).updateOne(
    { _id: new ObjectId(bookingId) },
    { $set: { proposal: snapshot, updatedAt: new Date() } }
  );
}

export async function getInstallationBookingByProposalToken(token: string) {
  if (!token || token.length < 16) return null;
  await ensureInstallationBookingIndexes();
  const db = await getDb();
  return db.collection<InstallationBookingDoc>(COL).findOne({
    "proposal.approval.token": token,
  });
}

/** Public proposal page: excludes expired tokens (impure time check stays in data layer). */
export async function getInstallationBookingByProposalTokenForDisplay(
  token: string
) {
  const booking = await getInstallationBookingByProposalToken(token);
  const expiresAt = booking?.proposal?.approval?.tokenExpiresAt;
  if (!expiresAt || expiresAt.getTime() <= Date.now()) {
    return null;
  }
  return booking;
}

export type ApproveProposalResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "not_sent" | "expired" | "already_approved" };

export async function approveProposalByToken(
  token: string,
  signerName: string,
  signerIp: string | null
): Promise<ApproveProposalResult> {
  if (!token || token.length < 16) return { ok: false, reason: "not_found" };

  await ensureInstallationBookingIndexes();
  const db = await getDb();
  const booking = await getInstallationBookingByProposalToken(token);
  if (!booking?.proposal?.approval) return { ok: false, reason: "not_found" };

  const { approval } = booking.proposal;
  if (approval.status === "approved") return { ok: false, reason: "already_approved" };
  if (approval.status !== "sent") return { ok: false, reason: "not_sent" };
  if (!approval.tokenExpiresAt || approval.tokenExpiresAt.getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const now = new Date();
  const r = await db.collection(COL).updateOne(
    {
      _id: booking._id,
      "proposal.approval.token": token,
      "proposal.approval.status": "sent",
    },
    {
      $set: {
        "proposal.approval.status": "approved",
        "proposal.approval.approvedAt": now,
        "proposal.approval.signerName": signerName,
        "proposal.approval.signerIp": signerIp,
        updatedAt: now,
      },
    }
  );

  if (r.matchedCount === 0) return { ok: false, reason: "not_found" };
  return { ok: true };
}

export type InstallationBookingPublic = {
  _id: string;
  bookingNumber: string;
  customer: InstallationBookingDoc["customer"];
  site: InstallationBookingDoc["site"];
  schedule: InstallationBookingDoc["schedule"];
  details: InstallationBookingDoc["details"];
  status: InstallationBookingStatus;
  createdAt: Date;
};

function toInstallationBookingPublic(
  booking: InstallationBookingDoc
): InstallationBookingPublic {
  return {
    _id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    customer: booking.customer,
    site: booking.site,
    schedule: booking.schedule,
    details: booking.details,
    status: booking.status,
    createdAt: booking.createdAt,
  };
}

export function safeInstallationBookingListForUser(
  bookings: InstallationBookingDoc[]
): InstallationBookingPublic[] {
  return bookings.map(toInstallationBookingPublic);
}
