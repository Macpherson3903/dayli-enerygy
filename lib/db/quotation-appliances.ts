import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { seedQuotationAppliances, type QuotationAppliance } from "@/lib/content/quotation";
import type { QuotationApplianceSheetDoc } from "@/lib/types";
import type { QuotationApplianceSheetInput } from "@/lib/validators";

const COL = "quotation_appliances";

function isMongoUnreachableError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const name = (e as { name?: string }).name;
  const message = (e as { message?: string }).message ?? "";
  return (
    name === "MongoServerSelectionError" ||
    name === "MongoNetworkError" ||
    name === "MongoTimeoutError" ||
    message.includes("ESERVFAIL") ||
    message.includes("ENOTFOUND") ||
    message.includes("EAI_AGAIN")
  );
}

function shouldUsePublicSeedFallback(): boolean {
  return process.env.MONGODB_PUBLIC_FALLBACK !== "false";
}

export function slugifyApplianceName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || `appliance-${Date.now().toString(36)}`;
}

function toPublic(doc: QuotationApplianceSheetDoc): QuotationAppliance {
  return {
    id: doc.slug,
    name: doc.name,
    watts: doc.watts,
    defaultHoursPerDay: doc.defaultHoursPerDay,
  };
}

export type QuotationApplianceAdminRow = QuotationAppliance & {
  mongoId: string;
  sortOrder: number;
};

function toAdmin(doc: QuotationApplianceSheetDoc): QuotationApplianceAdminRow {
  return {
    mongoId: doc._id.toString(),
    id: doc.slug,
    name: doc.name,
    watts: doc.watts,
    defaultHoursPerDay: doc.defaultHoursPerDay,
    sortOrder: doc.sortOrder,
  };
}

export async function ensureQuotationApplianceIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ slug: 1 }, { unique: true });
  await db.collection(COL).createIndex({ sortOrder: 1, name: 1 });
}

export async function seedQuotationAppliancesIfEmpty() {
  const db = await getDb();
  const n = await db.collection(COL).countDocuments();
  if (n > 0) return;
  const now = new Date();
  const docs = seedQuotationAppliances.map((a, i) => ({
    slug: a.id,
    name: a.name,
    watts: a.watts,
    defaultHoursPerDay: a.defaultHoursPerDay,
    sortOrder: i,
    createdAt: now,
    updatedAt: now,
  }));
  if (docs.length) await db.collection(COL).insertMany(docs);
}

export async function getQuotationAppliancesPublic(): Promise<QuotationAppliance[]> {
  try {
    await ensureQuotationApplianceIndexes();
    await seedQuotationAppliancesIfEmpty();
    const db = await getDb();
    const list = await db
      .collection<QuotationApplianceSheetDoc>(COL)
      .find()
      .sort({ sortOrder: 1, name: 1 })
      .toArray();
    return list.map(toPublic);
  } catch (e) {
    if (shouldUsePublicSeedFallback() && isMongoUnreachableError(e)) {
      console.warn(
        "[getQuotationAppliancesPublic] MongoDB unreachable; serving seed appliance sheet."
      );
      return seedQuotationAppliances.map((a) => ({ ...a }));
    }
    throw e;
  }
}

export async function listQuotationAppliancesForAdmin(): Promise<
  QuotationApplianceAdminRow[]
> {
  await ensureQuotationApplianceIndexes();
  await seedQuotationAppliancesIfEmpty();
  const db = await getDb();
  const list = await db
    .collection<QuotationApplianceSheetDoc>(COL)
    .find()
    .sort({ sortOrder: 1, name: 1 })
    .toArray();
  return list.map(toAdmin);
}

async function uniqueSlug(db: Awaited<ReturnType<typeof getDb>>, base: string) {
  let slug = base;
  let n = 2;
  while (await db.collection(COL).findOne({ slug })) {
    slug = `${base}-${n}`.slice(0, 90);
    n += 1;
  }
  return slug;
}

export async function createQuotationAppliance(
  input: QuotationApplianceSheetInput
): Promise<QuotationApplianceAdminRow> {
  await ensureQuotationApplianceIndexes();
  await seedQuotationAppliancesIfEmpty();
  const db = await getDb();
  const now = new Date();
  const slug = await uniqueSlug(db, slugifyApplianceName(input.name));
  const maxSort = await db
    .collection<QuotationApplianceSheetDoc>(COL)
    .find()
    .sort({ sortOrder: -1 })
    .limit(1)
    .toArray();
  const sortOrder = input.sortOrder ?? (maxSort[0]?.sortOrder ?? 0) + 1;
  const doc: Omit<QuotationApplianceSheetDoc, "_id"> = {
    slug,
    name: input.name.trim(),
    watts: input.watts,
    defaultHoursPerDay: input.defaultHoursPerDay,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
  const r = await db.collection(COL).insertOne(doc);
  return toAdmin({ ...doc, _id: r.insertedId });
}

export async function updateQuotationAppliance(
  id: string,
  input: QuotationApplianceSheetInput
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const patch: Record<string, unknown> = {
    name: input.name.trim(),
    watts: input.watts,
    defaultHoursPerDay: input.defaultHoursPerDay,
    updatedAt: new Date(),
  };
  if (input.sortOrder != null) patch.sortOrder = input.sortOrder;
  const r = await db
    .collection(COL)
    .updateOne({ _id: new ObjectId(id) }, { $set: patch });
  return r.matchedCount > 0;
}

export async function deleteQuotationAppliance(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const r = await db.collection(COL).deleteOne({ _id: new ObjectId(id) });
  return r.deletedCount > 0;
}
