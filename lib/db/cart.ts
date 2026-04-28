import { getDb } from "@/lib/mongodb";
import type { CartDoc, CartLine } from "@/lib/types";

const COL = "carts";

export async function ensureCartIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ userId: 1 }, { unique: true });
  await db.collection(COL).createIndex({ updatedAt: -1 });
}

export async function getCartForUser(userId: string): Promise<CartDoc | null> {
  await ensureCartIndexes();
  const db = await getDb();
  return db.collection<CartDoc>(COL).findOne({ userId });
}

export async function replaceCartForUser(
  userId: string,
  lines: CartLine[]
): Promise<CartLine[]> {
  await ensureCartIndexes();
  const db = await getDb();
  const now = new Date();
  await db.collection(COL).updateOne(
    { userId },
    {
      $set: {
        lines,
        updatedAt: now,
      },
      $setOnInsert: {
        userId,
        createdAt: now,
      },
    },
    { upsert: true }
  );
  return lines;
}

export async function clearCartForUser(userId: string): Promise<void> {
  await replaceCartForUser(userId, []);
}
