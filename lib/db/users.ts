import { MongoServerError } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { AppRole, UserDoc } from "@/lib/types";

const COL = "users";

let userIndexesReady: Promise<void> | undefined;

export type UserRecordInput = {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  lastSignInAt: Date | null;
  createdAt: Date;
};

export async function ensureUserIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ clerkId: 1 }, { unique: true });
  await db.collection(COL).createIndex({ createdAt: -1 });
  await db.collection(COL).createIndex({ email: 1 });
  await db.collection(COL).createIndex({ role: 1 });
}

async function ensureUserIndexesOnce() {
  if (!userIndexesReady) {
    userIndexesReady = ensureUserIndexes().catch((err) => {
      userIndexesReady = undefined;
      throw err;
    });
  }
  await userIndexesReady;
}

function isDuplicateClerkIdError(e: unknown): boolean {
  return (
    e instanceof MongoServerError &&
    e.code === 11000 &&
    typeof e.message === "string" &&
    e.message.includes("clerkId")
  );
}

export async function upsertUser(data: UserRecordInput): Promise<void> {
  await ensureUserIndexesOnce();
  const db = await getDb();
  const now = new Date();
  await db.collection<UserDoc>(COL).updateOne(
    { clerkId: data.clerkId },
    {
      $set: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        lastSignInAt: data.lastSignInAt,
        createdAt: data.createdAt,
        updatedAt: now,
      },
      $setOnInsert: {
        clerkId: data.clerkId,
      },
    },
    { upsert: true }
  );
}

export async function upsertUsers(records: UserRecordInput[]): Promise<void> {
  if (records.length === 0) return;
  await ensureUserIndexesOnce();
  const db = await getDb();
  const now = new Date();
  await db.collection<UserDoc>(COL).bulkWrite(
    records.map((data) => ({
      updateOne: {
        filter: { clerkId: data.clerkId },
        update: {
          $set: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            lastSignInAt: data.lastSignInAt,
            createdAt: data.createdAt,
            updatedAt: now,
          },
          $setOnInsert: {
            clerkId: data.clerkId,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );
}

export async function insertUserIfMissing(data: UserRecordInput): Promise<boolean> {
  await ensureUserIndexesOnce();
  const db = await getDb();
  const existing = await db
    .collection<UserDoc>(COL)
    .findOne({ clerkId: data.clerkId }, { projection: { _id: 1 } });
  if (existing) return false;

  const now = new Date();
  const doc: Omit<UserDoc, "_id"> = {
    clerkId: data.clerkId,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
    lastSignInAt: data.lastSignInAt,
    createdAt: data.createdAt,
    updatedAt: now,
  };
  try {
    await db.collection(COL).insertOne(doc);
    return true;
  } catch (e) {
    if (isDuplicateClerkIdError(e)) return false;
    throw e;
  }
}

export async function touchUserLastSignIn(
  clerkId: string,
  lastSignInAt: Date
): Promise<boolean> {
  await ensureUserIndexesOnce();
  const db = await getDb();
  const r = await db.collection<UserDoc>(COL).updateOne(
    { clerkId },
    { $set: { lastSignInAt, updatedAt: new Date() } }
  );
  return r.matchedCount > 0;
}

export async function deleteUserByClerkId(clerkId: string): Promise<void> {
  await ensureUserIndexesOnce();
  const db = await getDb();
  await db.collection(COL).deleteOne({ clerkId });
}

export async function getUserByClerkId(clerkId: string): Promise<UserDoc | null> {
  await ensureUserIndexesOnce();
  const db = await getDb();
  return db.collection<UserDoc>(COL).findOne({ clerkId });
}

export async function listUsers(limit = 500): Promise<UserDoc[]> {
  await ensureUserIndexesOnce();
  const db = await getDb();
  return db
    .collection<UserDoc>(COL)
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function countUsers(): Promise<number> {
  await ensureUserIndexesOnce();
  const db = await getDb();
  return db.collection(COL).countDocuments();
}

export async function countUsersByRole(role: AppRole): Promise<number> {
  await ensureUserIndexesOnce();
  const db = await getDb();
  return db.collection(COL).countDocuments({ role });
}

export function userDisplayName(user: {
  firstName: string;
  lastName: string;
  email: string;
}): string {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email || "N/A";
}