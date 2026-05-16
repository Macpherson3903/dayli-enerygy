import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { PackageDoc, ProductPublic } from "@/lib/types";
import { SEED_PACKAGES, type SeedPackage } from "@/data/seed-packages";
import type { PackageInput } from "@/lib/validators";
import { normalizePriceBounds, priceBoundsFromDoc } from "@/lib/pricing";

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

const COL = "packages";
const PACKAGE_CATEGORY_COL = "packageCategories";

/** Shown in admin + shop filters; cannot remove via UI until no packages use them. */
export const DEFAULT_PACKAGE_CATEGORIES = [
  "general",
  "residential",
  "commercial",
] as const;

function seedPackageToPublic(s: SeedPackage): ProductPublic {
  const { priceMin, priceMax } = normalizePriceBounds(s.priceMin, s.priceMax);
  return {
    id: `seed-pkg:${s.slug}`,
    name: s.name,
    slug: s.slug,
    category: s.category,
    priceMin,
    priceMax,
    description: s.description,
    shortDescription: s.shortDescription,
    image: s.image,
    features: s.features,
    stock: s.stock,
    itemKind: "package",
    typicalAppliances: s.typicalAppliances,
  };
}

function seedPackagesAsPublic(): ProductPublic[] {
  return SEED_PACKAGES.map(seedPackageToPublic);
}

function pdpSlugFromSegment(segment: string): string {
  if (segment.startsWith("seed-pkg:")) return segment.slice("seed-pkg:".length);
  return segment;
}

function seedPublicForPdpSegment(segment: string): ProductPublic | null {
  const slug = pdpSlugFromSegment(segment);
  const s = SEED_PACKAGES.find((p) => p.slug === slug);
  return s ? seedPackageToPublic(s) : null;
}

function packageCategoryOrDefault(p: PackageDoc): string {
  const c = p.category?.trim().toLowerCase();
  return c || "general";
}

function toPublic(p: PackageDoc): ProductPublic {
  const { priceMin, priceMax } = priceBoundsFromDoc(p);
  return {
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    category: packageCategoryOrDefault(p),
    priceMin,
    priceMax,
    description: p.description,
    shortDescription: p.shortDescription,
    image: p.image,
    features: p.features,
    stock: p.stock,
    itemKind: "package",
    typicalAppliances: p.typicalAppliances,
  };
}

export async function ensurePackageCategoryIndexes() {
  const db = await getDb();
  await db
    .collection(PACKAGE_CATEGORY_COL)
    .createIndex({ name: 1 }, { unique: true });
}

export async function ensurePackageIndexes() {
  const db = await getDb();
  await ensurePackageCategoryIndexes();
  await db.collection(COL).createIndex({ slug: 1 }, { unique: true });
  await db.collection(COL).createIndex({ active: 1, featured: 1 });
  await db.collection(COL).createIndex({ active: 1, stock: 1 });
  await db.collection(COL).createIndex({ active: 1, category: 1 });
}

async function migrateLegacyPackageCategories() {
  const db = await getDb();
  await db.collection(COL).updateMany(
    {
      $or: [{ category: { $exists: false } }, { category: "" }],
    },
    { $set: { category: "general", updatedAt: new Date() } }
  );
}

export async function seedPackagesIfEmpty() {
  const db = await getDb();
  const n = await db.collection(COL).countDocuments();
  if (n > 0) return;
  const now = new Date();
  const docs = SEED_PACKAGES.map((s) => {
    const { priceMin, priceMax } = normalizePriceBounds(s.priceMin, s.priceMax);
    return {
    name: s.name,
    slug: s.slug,
    category: s.category.trim().toLowerCase(),
    priceMin,
    priceMax,
    description: s.description,
    shortDescription: s.shortDescription,
    image: s.image,
    features: s.features,
    typicalAppliances: s.typicalAppliances,
    stock: s.stock,
    active: true,
    featured: s.featured,
    createdAt: now,
    updatedAt: now,
  };
  });
  if (docs.length) await db.collection(COL).insertMany(docs);
}

export async function getPackagesPublic(): Promise<ProductPublic[]> {
  try {
    await ensurePackageIndexes();
    await seedPackagesIfEmpty();
    await migrateLegacyPackageCategories();
    const db = await getDb();
    const list = await db
      .collection<PackageDoc>(COL)
      .find({ active: true, stock: { $gt: 0 } })
      .sort({ name: 1 })
      .toArray();
    return list.map(toPublic);
  } catch (e) {
    if (shouldUsePublicSeedFallback() && isMongoUnreachableError(e)) {
      console.warn(
        "[getPackagesPublic] MongoDB unreachable; serving seed packages fallback."
      );
      return seedPackagesAsPublic();
    }
    throw e;
  }
}

export async function getPackagesFeaturedPublic(): Promise<ProductPublic[]> {
  try {
    await ensurePackageIndexes();
    await seedPackagesIfEmpty();
    await migrateLegacyPackageCategories();
    const db = await getDb();
    const list = await db
      .collection<PackageDoc>(COL)
      .find({
        active: true,
        featured: true,
        stock: { $gt: 0 },
      })
      .sort({ name: 1 })
      .limit(6)
      .toArray();
    return list.map(toPublic);
  } catch (e) {
    if (shouldUsePublicSeedFallback() && isMongoUnreachableError(e)) {
      return seedPackagesAsPublic().filter(
        (p) =>
          SEED_PACKAGES.find((s) => s.slug === p.slug)?.featured === true
      );
    }
    throw e;
  }
}

export async function getPackagesAllForAdmin(): Promise<PackageDoc[]> {
  await ensurePackageIndexes();
  await seedPackagesIfEmpty();
  await migrateLegacyPackageCategories();
  const db = await getDb();
  return db
    .collection<PackageDoc>(COL)
    .find()
    .sort({ name: 1 })
    .toArray();
}

export async function getPackageById(id: string): Promise<PackageDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  await ensurePackageIndexes();
  await migrateLegacyPackageCategories();
  const db = await getDb();
  return db.collection<PackageDoc>(COL).findOne({ _id: new ObjectId(id) });
}

export async function getPackagePublicById(
  id: string
): Promise<ProductPublic | null> {
  const p = await getPackageById(id);
  if (!p || !p.active) return null;
  if (p.stock <= 0) return null;
  return toPublic(p);
}

/**
 * Package PDP: active only; out-of-stock still visible (same as products).
 */
export async function getPackageForPdp(
  segment: string
): Promise<ProductPublic | null> {
  const slug = pdpSlugFromSegment(segment).toLowerCase();

  try {
    if (ObjectId.isValid(segment)) {
      const byId = await getPackageById(segment);
      if (byId?.active) return toPublic(byId);
    }

    await ensurePackageIndexes();
    await seedPackagesIfEmpty();
    await migrateLegacyPackageCategories();
    const db = await getDb();
    const bySlug = await db
      .collection<PackageDoc>(COL)
      .findOne({ slug, active: true });
    if (bySlug) return toPublic(bySlug);
  } catch (e) {
    if (shouldUsePublicSeedFallback() && isMongoUnreachableError(e)) {
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

export async function createPackage(input: PackageInput) {
  const db = await getDb();
  const now = new Date();
  const { priceMin, priceMax } = normalizePriceBounds(
    input.priceMin,
    input.priceMax
  );
  const doc: Omit<PackageDoc, "_id"> = {
    name: input.name,
    slug: input.slug,
    category: input.category,
    priceMin,
    priceMax,
    description: input.description,
    shortDescription: input.shortDescription,
    image: input.image,
    features: input.features,
    typicalAppliances: input.typicalAppliances,
    stock: input.stock,
    active: input.active,
    featured: input.featured,
    createdAt: now,
    updatedAt: now,
  };
  const r = await db
    .collection<Omit<PackageDoc, "_id">>(COL)
    .insertOne(doc);
  return r.insertedId;
}

export async function updatePackage(id: string, input: Partial<PackageInput>) {
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

export async function deletePackage(id: string) {
  if (!ObjectId.isValid(id)) throw new Error("Invalid id");
  const db = await getDb();
  await db.collection(COL).deleteOne({ _id: new ObjectId(id) });
}

/** Sales read-only view */
export async function getPackagesForSalesView(): Promise<PackageDoc[]> {
  await ensurePackageIndexes();
  await seedPackagesIfEmpty();
  await migrateLegacyPackageCategories();
  const db = await getDb();
  return db
    .collection<PackageDoc>(COL)
    .find()
    .sort({ name: 1 })
    .toArray();
}

export async function getPackageCategories(): Promise<string[]> {
  await ensurePackageIndexes();
  await seedPackagesIfEmpty();
  await migrateLegacyPackageCategories();
  const db = await getDb();
  const docs = await db
    .collection<{ name: string }>(PACKAGE_CATEGORY_COL)
    .find()
    .project({ _id: 0, name: 1 })
    .toArray();
  const pkgs = await db
    .collection<PackageDoc>(COL)
    .find()
    .project({ _id: 0, category: 1 })
    .toArray();
  const fromPkgs = pkgs
    .map((p) => p.category)
    .filter((c): c is string => Boolean(c && String(c).trim()));
  return Array.from(
    new Set([
      ...DEFAULT_PACKAGE_CATEGORIES,
      ...docs.map((d) => d.name),
      ...fromPkgs.map((c) => c.trim().toLowerCase()),
    ])
  ).sort((a, b) => a.localeCompare(b));
}

export async function addPackageCategory(name: string) {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) throw new Error("Category name is required");
  const db = await getDb();
  await ensurePackageCategoryIndexes();
  await db.collection(PACKAGE_CATEGORY_COL).updateOne(
    { name: trimmed },
    { $setOnInsert: { name: trimmed, createdAt: new Date() } },
    { upsert: true }
  );
}

export async function removePackageCategory(name: string) {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) throw new Error("Category name is required");
  if (
    (DEFAULT_PACKAGE_CATEGORIES as readonly string[]).includes(trimmed)
  ) {
    throw new Error("Cannot remove a built-in category");
  }
  const db = await getDb();
  const inUse = await db.collection(COL).countDocuments({ category: trimmed });
  if (inUse > 0) {
    throw new Error("Cannot remove a category that has packages");
  }
  await db.collection(PACKAGE_CATEGORY_COL).deleteOne({ name: trimmed });
}

export async function renamePackageCategory(from: string, to: string) {
  const fromN = from.trim().toLowerCase();
  const toN = to.trim().toLowerCase();
  if (!fromN || !toN) throw new Error("Category name is required");
  if (fromN === toN) return;
  const db = await getDb();
  const clash = await db.collection(COL).countDocuments({ category: toN });
  if (clash > 0) {
    throw new Error(
      "Target category name is already in use. Choose another name."
    );
  }
  await db.collection(COL).updateMany(
    { category: fromN },
    { $set: { category: toN, updatedAt: new Date() } }
  );
  await db.collection(PACKAGE_CATEGORY_COL).deleteOne({ name: fromN });
  await db.collection(PACKAGE_CATEGORY_COL).updateOne(
    { name: toN },
    { $setOnInsert: { name: toN, createdAt: new Date() } },
    { upsert: true }
  );
}
