import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

const PRODUCTS = "products";
const PACKAGES = "packages";

export type CatalogSlugConflictOptions = {
  excludeProductId?: string;
  excludePackageId?: string;
};

function slugRegexCaseInsensitive(slug: string): RegExp {
  const esc = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${esc}$`, "i");
}

/**
 * True if slug is used by another product or package (cross-collection uniqueness for PDP URLs).
 */
export async function isCatalogSlugTaken(
  slug: string,
  options: CatalogSlugConflictOptions = {}
): Promise<boolean> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return false;

  const db = await getDb();
  const slugRx = slugRegexCaseInsensitive(normalized);
  const productFilter: Record<string, unknown> = { slug: slugRx };
  if (
    options.excludeProductId &&
    ObjectId.isValid(options.excludeProductId)
  ) {
    productFilter._id = { $ne: new ObjectId(options.excludeProductId) };
  }
  const p = await db.collection(PRODUCTS).countDocuments(productFilter);
  if (p > 0) return true;

  const packageFilter: Record<string, unknown> = { slug: slugRx };
  if (
    options.excludePackageId &&
    ObjectId.isValid(options.excludePackageId)
  ) {
    packageFilter._id = { $ne: new ObjectId(options.excludePackageId) };
  }
  const k = await db.collection(PACKAGES).countDocuments(packageFilter);
  return k > 0;
}
