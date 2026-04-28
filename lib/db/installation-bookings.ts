import { getDb } from "@/lib/mongodb";
import { generateBookingNumber } from "@/lib/booking-number";
import type { InstallationBookingInput } from "@/lib/validators";
import { ObjectId } from "mongodb";
import type { InstallationBookingDoc, InstallationBookingStatus } from "@/lib/types";

const COL = "installation_bookings";

export async function ensureInstallationBookingIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ bookingNumber: 1 }, { unique: true });
  await db.collection(COL).createIndex({ "customer.email": 1, createdAt: -1 });
  await db.collection(COL).createIndex({ status: 1, createdAt: -1 });
  await db.collection(COL).createIndex({ userId: 1, createdAt: -1 });
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
