import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { ProductDoc, ProductPublic } from "@/lib/types";
import { SEED_PRODUCTS, type SeedProduct } from "@/data/seed-products";
import type { ProductInput } from "@/lib/validators";

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

/** Stable public shape from seed file when DB is offline (development only). */
function seedProductToPublic(s: SeedProduct): ProductPublic {
  return {
    id: `seed:${s.slug}`,
    name: s.name,
    slug: s.slug,
    category: s.category,
    price: s.price,
    description: s.description,
    shortDescription: s.shortDescription,
    image: s.image,
    features: s.features,
    stock: s.stock,
  };
}

function seedProductsAsPublic(): ProductPublic[] {
  return SEED_PRODUCTS.map(seedProductToPublic);
}

const COL = "products";

function toPublic(p: ProductDoc): ProductPublic {
  return {
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: p.price,
    description: p.description,
    shortDescription: p.shortDescription,
    image: p.image,
    features: p.features,
    stock: p.stock,
  };
}

export async function ensureIndexes() {
  const db = await getDb();
  await db.collection(COL).createIndex({ slug: 1 }, { unique: true });
  await db.collection(COL).createIndex({ active: 1, category: 1 });
}

export async function seedProductsIfEmpty() {
  const db = await getDb();
  const n = await db.collection(COL).countDocuments();
  if (n > 0) return;
  const now = new Date();
  const docs = SEED_PRODUCTS.map((s) => ({
    name: s.name,
    slug: s.slug,
    category: s.category,
    price: s.price,
    description: s.description,
    shortDescription: s.shortDescription,
    image: s.image,
    features: s.features,
    stock: s.stock,
    active: true,
    createdAt: now,
    updatedAt: now,
  }));
  if (docs.length) await db.collection(COL).insertMany(docs);
}

export async function getProductsPublic(): Promise<ProductPublic[]> {
  try {
    await ensureIndexes();
    await seedProductsIfEmpty();
    const db = await getDb();
    const list = await db
      .collection<ProductDoc>(COL)
      .find({ active: true, stock: { $gt: 0 } })
      .sort({ name: 1 })
      .toArray();
    return list.map(toPublic);
  } catch (e) {
    if (
      shouldUsePublicSeedFallback() &&
      isMongoUnreachableError(e)
    ) {
      console.warn(
        "[getProductsPublic] MongoDB unreachable; serving seed catalog fallback. Set MONGODB_PUBLIC_FALLBACK=false to disable this behavior."
      );
      return seedProductsAsPublic();
    }
    throw e;
  }
}

export async function getProductsAllForAdmin() {
  await ensureIndexes();
  await seedProductsIfEmpty();
  const db = await getDb();
  const list = await db
    .collection<ProductDoc>(COL)
    .find()
    .sort({ name: 1 })
    .toArray();
  return list;
}

export async function getProductById(id: string): Promise<ProductDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db
    .collection<ProductDoc>(COL)
    .findOne({ _id: new ObjectId(id) });
}

export async function getProductPublicById(
  id: string
): Promise<ProductPublic | null> {
  const p = await getProductById(id);
  if (!p || !p.active) return null;
  if (p.stock <= 0) return null;
  return toPublic(p);
}

/** Slug for PDP lookup when the URL segment is `seed:my-slug` (dev seed ids). */
function pdpSlugFromSegment(segment: string): string {
  if (segment.startsWith("seed:")) return segment.slice("seed:".length);
  return segment;
}

function seedPublicForPdpSegment(segment: string): ProductPublic | null {
  const slug = pdpSlugFromSegment(segment);
  const s = SEED_PRODUCTS.find((p) => p.slug === slug);
  return s ? seedProductToPublic(s) : null;
}

/**
 * Product detail: active only; out-of-stock still visible.
 * Resolves by Mongo `_id` (24-char ObjectId) or by `slug` (and dev `seed:*` ids).
 */
export async function getProductForPdp(
  segment: string
): Promise<ProductPublic | null> {
  const slug = pdpSlugFromSegment(segment);

  try {
    if (ObjectId.isValid(segment)) {
      const byId = await getProductById(segment);
      if (byId?.active) return toPublic(byId);
    }

    await ensureIndexes();
    await seedProductsIfEmpty();
    const db = await getDb();
    const bySlug = await db
      .collection<ProductDoc>(COL)
      .findOne({ slug, active: true });
    if (bySlug) return toPublic(bySlug);
  } catch (e) {
    if (
      shouldUsePublicSeedFallback() &&
      isMongoUnreachableError(e)
    ) {
      return seedPublicForPdpSegment(segment);
    }
    throw e;
  }

  if (shouldUsePublicSeedFallback()) {
    const seeded = seedPublicForPdpSegment(segment);
    if (seeded) return seeded;
  }

  return null;
}

export async function getProductPublicBySlug(
  slug: string
): Promise<ProductPublic | null> {
  await ensureIndexes();
  await seedProductsIfEmpty();
  const db = await getDb();
  const p = await db
    .collection<ProductDoc>(COL)
    .findOne({ slug, active: true, stock: { $gt: 0 } });
  return p ? toPublic(p) : null;
}

export async function createProduct(input: ProductInput) {
  const db = await getDb();
  const now = new Date();
  const doc: Omit<ProductDoc, "_id"> = {
    name: input.name,
    slug: input.slug,
    category: input.category,
    price: input.price,
    description: input.description,
    shortDescription: input.shortDescription,
    image: input.image,
    features: input.features,
    stock: input.stock,
    active: input.active,
    createdAt: now,
    updatedAt: now,
  };

  const r = await db
    .collection<Omit<ProductDoc, "_id">>(COL)
    .insertOne(doc);
  return r.insertedId;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
) {
  if (!ObjectId.isValid(id)) throw new Error("Invalid id");
  const db = await getDb();
  const patch: Record<string, unknown> = { ...input, updatedAt: new Date() };
  Object.keys(patch).forEach((k) => {
    if (patch[k] === undefined) delete patch[k];
  });
  await db
    .collection(COL)
    .updateOne({ _id: new ObjectId(id) }, { $set: patch });
}

export async function deleteProduct(id: string) {
  if (!ObjectId.isValid(id)) throw new Error("Invalid id");
  const db = await getDb();
  await db.collection(COL).deleteOne({ _id: new ObjectId(id) });
}

/** Sales / inventory: read catalog including out-of-stock for display rules */
export async function getProductsForSalesView(): Promise<ProductDoc[]> {
  await ensureIndexes();
  await seedProductsIfEmpty();
  const db = await getDb();
  return db
    .collection<ProductDoc>(COL)
    .find()
    .sort({ category: 1, name: 1 })
    .toArray();
}
