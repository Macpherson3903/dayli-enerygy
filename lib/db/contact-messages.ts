import { MongoServerError, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { generateContactMessageNumber } from "@/lib/inquiry-number";
import type { ContactMessageDoc, ContactMessageStatus } from "@/lib/types";
import type { ContactMessageInput } from "@/lib/validators";

const COL = "contact_messages";

/** One resolved promise per server instance — avoids createIndex round-trips on every submit. */
let contactIndexesReady: Promise<void> | undefined;

export async function ensureContactMessageIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ messageNumber: 1 }, { unique: true });
  await db.collection(COL).createIndex({ status: 1, createdAt: -1 });
  await db.collection(COL).createIndex({ createdAt: -1 });
  await db.collection(COL).createIndex({ email: 1, createdAt: -1 });
}

async function ensureContactIndexesOnce() {
  if (!contactIndexesReady) {
    contactIndexesReady = ensureContactMessageIndexes().catch((err) => {
      contactIndexesReady = undefined;
      throw err;
    });
  }
  await contactIndexesReady;
}

function isDuplicateMessageNumberError(e: unknown): boolean {
  return (
    e instanceof MongoServerError &&
    e.code === 11000 &&
    typeof e.message === "string" &&
    e.message.includes("messageNumber")
  );
}

/**
 * Persist a validated contact form payload. Call before sending notification emails.
 */
export async function createContactMessage(
  data: ContactMessageInput,
  options?: { sourceIp?: string }
): Promise<{ _id: ObjectId; messageNumber: string }> {
  await ensureContactIndexesOnce();
  const db = await getDb();
  const now = new Date();
  const sourceIp = options?.sourceIp?.trim() || undefined;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const messageNumber = generateContactMessageNumber();
    const doc: Omit<ContactMessageDoc, "_id"> = {
      messageNumber,
      status: "new",
      name: data.name,
      email: data.email,
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      subject: data.subject,
      message: data.message,
      staffEmailSent: false,
      customerEmailSent: false,
      internalNotes: "",
      ...(sourceIp ? { sourceIp } : {}),
      createdAt: now,
      updatedAt: now,
    };
    try {
      const r = await db.collection(COL).insertOne(doc);
      return { _id: r.insertedId, messageNumber };
    } catch (e) {
      if (isDuplicateMessageNumberError(e) && attempt < 5) continue;
      throw e;
    }
  }

  throw new Error("Could not allocate a unique contact reference");
}

export async function markContactMessageEmailFlags(
  id: ObjectId,
  flags: { staffEmailSent?: boolean; customerEmailSent?: boolean }
) {
  const db = await getDb();
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (flags.staffEmailSent !== undefined)
    set.staffEmailSent = flags.staffEmailSent;
  if (flags.customerEmailSent !== undefined)
    set.customerEmailSent = flags.customerEmailSent;
  await db.collection(COL).updateOne({ _id: id }, { $set: set });
}

export async function listContactMessages(): Promise<ContactMessageDoc[]> {
  await ensureContactIndexesOnce();
  const db = await getDb();
  return db
    .collection<ContactMessageDoc>(COL)
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getContactMessageById(
  id: string
): Promise<ContactMessageDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db.collection<ContactMessageDoc>(COL).findOne({
    _id: new ObjectId(id),
  });
}

export async function updateContactMessageById(
  id: string,
  patch: { status: ContactMessageStatus; internalNotes: string }
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const r = await db.collection(COL).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: patch.status,
        internalNotes: patch.internalNotes,
        updatedAt: new Date(),
      },
    }
  );
  return r.matchedCount > 0;
}

export async function countContactMessagesByStatus(
  status: ContactMessageStatus
): Promise<number> {
  await ensureContactIndexesOnce();
  const db = await getDb();
  return db.collection(COL).countDocuments({ status });
}
