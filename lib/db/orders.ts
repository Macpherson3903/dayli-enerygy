import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { CreateOrderInput } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/order-number";
import type { OrderDoc, OrderStatus } from "@/lib/types";

const COL = "orders";

export async function ensureOrderIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ orderNumber: 1 }, { unique: true });
  await db.collection(COL).createIndex({ userId: 1, createdAt: -1 });
  await db.collection(COL).createIndex({ "contact.email": 1, createdAt: -1 });
  await db.collection(COL).createIndex({ status: 1, createdAt: -1 });
}

export async function createOrder(data: CreateOrderInput) {
  if (!data.consent) {
    throw new Error("Consent is required");
  }
  await ensureOrderIndexes();
  const db = await getDb();
  const now = new Date();
  const userId = data.userId ?? null;
  const order: Omit<OrderDoc, "_id"> = {
    orderNumber: generateOrderNumber(),
    lineItems: data.lineItems,
    contact: data.contact,
    status: "new",
    internalNotes: "",
    userId,
    createdAt: now,
    updatedAt: now,
  };
  const r = await db.collection(COL).insertOne(order);
  return { _id: r.insertedId, orderNumber: order.orderNumber };
}

export async function getOrderById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db.collection<OrderDoc>(COL).findOne({ _id: new ObjectId(id) });
}

export async function getOrderByIdForUser(id: string, userId: string) {
  const o = await getOrderById(id);
  if (!o || o.userId !== userId) return null;
  return o;
}

export async function listOrdersForUser(userId: string) {
  await ensureOrderIndexes();
  const db = await getDb();
  return db
    .collection<OrderDoc>(COL)
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function listAllOrders() {
  await ensureOrderIndexes();
  const db = await getDb();
  return db
    .collection<OrderDoc>(COL)
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}

export async function countOrdersByStatus(status: OrderStatus): Promise<number> {
  await ensureOrderIndexes();
  const db = await getDb();
  return db.collection(COL).countDocuments({ status });
}

export async function updateOrderById(
  id: string,
  patch: { status?: OrderStatus; internalNotes?: string }
) {
  if (!ObjectId.isValid(id)) throw new Error("Invalid order id");
  const db = await getDb();
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.status) set.status = patch.status;
  if (patch.internalNotes !== undefined)
    set.internalNotes = patch.internalNotes;
  await db
    .collection(COL)
    .updateOne({ _id: new ObjectId(id) }, { $set: set });
}

export type OrderPublic = {
  _id: string;
  orderNumber: string;
  lineItems: OrderDoc["lineItems"];
  contact: OrderDoc["contact"];
  status: OrderStatus;
  createdAt: Date;
};

function toOrderPublic(o: OrderDoc): OrderPublic {
  return {
    _id: o._id.toString(),
    orderNumber: o.orderNumber,
    lineItems: o.lineItems,
    contact: o.contact,
    status: o.status,
    createdAt: o.createdAt,
  };
}

export function safeOrderListForUser(orders: OrderDoc[]): OrderPublic[] {
  return orders.map(toOrderPublic);
}

export function orderDetailForUser(o: OrderDoc): OrderPublic {
  return toOrderPublic(o);
}
