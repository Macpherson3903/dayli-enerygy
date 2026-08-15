import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { CreateInvoiceInput } from "@/lib/validators";
import { computeInvoiceTotals } from "@/lib/invoice-totals";
import type { InvoiceDoc, InvoiceLineItem } from "@/lib/types";

const COL = "invoices";
const COUNTERS = "counters";

type CounterDoc = { _id: string; seq: number };

export async function ensureInvoiceIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ workOrderNumber: 1 }, { unique: true });
  await db.collection(COL).createIndex({ createdAt: -1 });
  await db.collection(COL).createIndex({ "customer.name": 1, createdAt: -1 });
  await db.collection(COL).createIndex({ "customer.phone": 1 });
}

async function nextWorkOrderNumber(): Promise<string> {
  const db = await getDb();
  const r = await db.collection<CounterDoc>(COUNTERS).findOneAndUpdate(
    { _id: "workOrder" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  if (!r?.seq) {
    throw new Error("Could not allocate work order number");
  }
  return String(r.seq).padStart(4, "0");
}

function parseIssuedAt(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid invoice date");
  }
  return d;
}

function toLineItems(input: CreateInvoiceInput): InvoiceLineItem[] {
  const { lineTotals } = computeInvoiceTotals({
    lineItems: input.lineItems,
    labour: input.labour,
    transportation: input.transportation,
    discount: input.discount,
    vatPercent: input.vatPercent,
  });
  return input.lineItems.map((row, i) => ({
    catalogItemId: row.catalogItemId ?? null,
    catalogKind: row.catalogKind ?? null,
    description: row.description,
    quantity: row.quantity,
    unitCost: row.unitCost,
    totalCost: lineTotals[i] ?? 0,
  }));
}

export async function createInvoice(
  data: CreateInvoiceInput,
  createdByUserId: string
) {
  await ensureInvoiceIndexes();
  const totals = computeInvoiceTotals({
    lineItems: data.lineItems,
    labour: data.labour,
    transportation: data.transportation,
    discount: data.discount,
    vatPercent: data.vatPercent,
  });
  if (data.discount > totals.subtotal + data.labour + data.transportation) {
    throw new Error("Discount cannot exceed subtotal plus labour and transportation");
  }
  const db = await getDb();
  const now = new Date();
  const doc: Omit<InvoiceDoc, "_id"> = {
    workOrderNumber: await nextWorkOrderNumber(),
    issuedAt: parseIssuedAt(data.issuedAt),
    customer: data.customer,
    lineItems: toLineItems(data),
    labour: data.labour,
    transportation: data.transportation,
    discount: data.discount,
    vatPercent: data.vatPercent,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    grandTotal: totals.grandTotal,
    paymentTerms: data.paymentTerms,
    warranty: data.warranty,
    validity: data.validity,
    accountNumber: data.accountNumber,
    createdByUserId,
    createdAt: now,
    updatedAt: now,
  };
  const r = await db.collection(COL).insertOne(doc);
  return {
    _id: r.insertedId,
    workOrderNumber: doc.workOrderNumber,
  };
}

export async function getInvoiceById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db.collection<InvoiceDoc>(COL).findOne({ _id: new ObjectId(id) });
}

export async function listAllInvoices() {
  await ensureInvoiceIndexes();
  const db = await getDb();
  return db
    .collection<InvoiceDoc>(COL)
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}
