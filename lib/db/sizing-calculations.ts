import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { generateSizingNumber } from "@/lib/sizing-number";
import type { SizingCalculationDoc } from "@/lib/types";
import type { SizingCalculationInput } from "@/lib/validators";

const COL = "sizing_calculations";

export async function ensureSizingCalculationIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ sizingNumber: 1 }, { unique: true });
  await db.collection(COL).createIndex({ createdAt: -1 });
}

export async function createSizingCalculation(
  data: SizingCalculationInput,
  createdByUserId: string
): Promise<{ _id: ObjectId; sizingNumber: string }> {
  await ensureSizingCalculationIndexes();
  const db = await getDb();
  const now = new Date();
  const sizingNumber = generateSizingNumber();
  const doc: Omit<SizingCalculationDoc, "_id"> = {
    sizingNumber,
    customerName: data.customerName.trim() || "Walk-in customer",
    createdByUserId,
    appliances: data.appliances,
    params: data.params,
    totals: data.totals,
    result: data.result,
    recommendations: data.recommendations,
    createdAt: now,
    updatedAt: now,
  };
  const r = await db.collection(COL).insertOne(doc);
  return { _id: r.insertedId, sizingNumber };
}

export async function listSizingCalculations(): Promise<SizingCalculationDoc[]> {
  await ensureSizingCalculationIndexes();
  const db = await getDb();
  return db
    .collection<SizingCalculationDoc>(COL)
    .find()
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
}

export async function getSizingCalculationById(
  id: string
): Promise<SizingCalculationDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  await ensureSizingCalculationIndexes();
  const db = await getDb();
  return db
    .collection<SizingCalculationDoc>(COL)
    .findOne({ _id: new ObjectId(id) });
}
