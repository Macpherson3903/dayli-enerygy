import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { generateProductAgentInquiryNumber } from "@/lib/inquiry-number";
import type { ProductAgentInquiryDoc, ProductAgentInquiryStatus } from "@/lib/types";
import type { ProductAgentInquiryInput } from "@/lib/validators";

const COL = "product_agent_inquiries";

export async function ensureProductAgentInquiryIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ inquiryNumber: 1 }, { unique: true });
  await db.collection(COL).createIndex({ status: 1, createdAt: -1 });
  await db.collection(COL).createIndex({ createdAt: -1 });
}

export async function createProductAgentInquiry(
  data: ProductAgentInquiryInput
): Promise<{ _id: ObjectId; inquiryNumber: string }> {
  await ensureProductAgentInquiryIndexes();
  const db = await getDb();
  const now = new Date();
  const inquiryNumber = generateProductAgentInquiryNumber();
  const doc: Omit<ProductAgentInquiryDoc, "_id"> = {
    inquiryNumber,
    status: "new",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    productId: data.productId,
    productName: data.productName,
    productSlug: data.productSlug,
    internalNotes: "",
    createdAt: now,
    updatedAt: now,
  };
  const r = await db.collection(COL).insertOne(doc);
  return { _id: r.insertedId, inquiryNumber };
}

export async function listProductAgentInquiries(): Promise<ProductAgentInquiryDoc[]> {
  await ensureProductAgentInquiryIndexes();
  const db = await getDb();
  return db
    .collection<ProductAgentInquiryDoc>(COL)
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}

export async function countProductAgentInquiriesByStatus(
  status: ProductAgentInquiryStatus
): Promise<number> {
  await ensureProductAgentInquiryIndexes();
  const db = await getDb();
  return db.collection(COL).countDocuments({ status });
}

export async function getProductAgentInquiryById(
  id: string
): Promise<ProductAgentInquiryDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db.collection<ProductAgentInquiryDoc>(COL).findOne({
    _id: new ObjectId(id),
  });
}

export async function updateProductAgentInquiryById(
  id: string,
  patch: { status: ProductAgentInquiryStatus; internalNotes: string }
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
