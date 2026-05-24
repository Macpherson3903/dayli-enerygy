"use server";

import { revalidatePath } from "next/cache";
import { getAppRole } from "@/lib/auth/roles";
import {
  firstZodErrorMessage,
  packageInputSchema,
  type PackageInput,
} from "@/lib/validators";
import { isCatalogSlugTaken } from "@/lib/db/catalog-slugs";
import {
  createPackage,
  updatePackage,
  deletePackage,
  addPackageCategory,
  removePackageCategory,
  renamePackageCategory,
} from "@/lib/db/packages";

function makeSlugFromName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const safeBase = base || "package";
  const suffix = Date.now().toString(36).slice(-6);
  return `${safeBase}-${suffix}`;
}

function formToPackageInput(formData: FormData, forUpdate: boolean) {
  const name = String(formData.get("name") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const priceMin = Number(formData.get("priceMin"));
  const priceMax = Number(formData.get("priceMax"));
  const description = String(formData.get("description") ?? "");
  const shortRaw = String(formData.get("shortDescription") ?? "");
  const image = String(formData.get("image") ?? "").trim();
  const featuresRaw = String(formData.get("features") ?? "");
  const features = featuresRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const appliancesRaw = String(formData.get("typicalAppliances") ?? "");
  const typicalAppliances = appliancesRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const stock = Number(formData.get("stock"));
  const active =
    formData.get("active") === "on" || formData.get("active") === "true";
  const featured =
    formData.get("featured") === "on" || formData.get("featured") === "true";

  const base = {
    name,
    category,
    slug: slugRaw || makeSlugFromName(name),
    priceMin,
    priceMax,
    description,
    image,
    features,
    typicalAppliances,
    stock,
    active: forUpdate ? active : true,
    featured: forUpdate ? featured : featured,
  };
  if (forUpdate) {
    return { ...base, shortDescription: shortRaw || undefined } as PackageInput;
  }
  return {
    ...base,
    shortDescription: shortRaw || undefined,
    featured,
  } as PackageInput;
}

export async function createPackageAction(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  if ((await getAppRole()) !== "inventory_admin") {
    return { error: "Not allowed" };
  }
  const imageField = String(formData.get("image") ?? "").trim();
  if (!imageField) {
    return {
      error:
        "Package image is required. Upload an image and wait for “Image uploaded” before saving.",
    };
  }
  const raw = formToPackageInput(formData, false);
  const parsed = packageInputSchema.safeParse({
    ...raw,
    active: true,
  });
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().formErrors[0] ?? "Check all fields",
    };
  }
  if (await isCatalogSlugTaken(parsed.data.slug)) {
    return { error: "That URL slug is already used by a product or package" };
  }
  await createPackage(parsed.data);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/inventory/packages");
  revalidatePath("/admin/inventory/categories");
  revalidatePath("/order");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updatePackageAction(
  packageId: string,
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  if ((await getAppRole()) !== "inventory_admin") {
    return { error: "Not allowed" };
  }
  const raw = formToPackageInput(formData, true);
  const parsed = packageInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: firstZodErrorMessage(parsed.error) };
  }
  if (
    await isCatalogSlugTaken(parsed.data.slug, { excludePackageId: packageId })
  ) {
    return { error: "That URL slug is already used by a product or package" };
  }
  try {
    await updatePackage(packageId, parsed.data);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update package",
    };
  }
  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/packages/${packageId}`);
  revalidatePath("/admin/inventory/packages");
  revalidatePath("/admin/inventory/categories");
  revalidatePath("/order");
  revalidatePath(`/order/${packageId}`);
  revalidatePath(`/order/${parsed.data.slug}`);
  revalidatePath("/");
  return { ok: true as const };
}

export async function deletePackageAction(packageId: string) {
  if ((await getAppRole()) !== "inventory_admin") {
    return { error: "Not allowed" };
  }
  await deletePackage(packageId);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/inventory/packages");
  revalidatePath("/admin/inventory/categories");
  revalidatePath("/order");
  revalidatePath("/");
  return { ok: true as const };
}

export async function addPackageCategoryAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  if ((await getAppRole()) !== "inventory_admin") {
    return { error: "Not allowed" };
  }
  const name = String(formData.get("categoryName") ?? "");
  if (!name.trim()) {
    return { error: "Category name is required" };
  }
  try {
    await addPackageCategory(name);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to add category",
    };
  }
  revalidatePath("/admin/inventory/categories");
  revalidatePath("/admin/inventory/packages");
  revalidatePath("/admin/inventory/packages/add");
  revalidatePath("/order");
  revalidatePath("/");
  return { ok: true as const };
}

export async function removePackageCategoryAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  if ((await getAppRole()) !== "inventory_admin") {
    return { error: "Not allowed" };
  }
  const name = String(formData.get("categoryName") ?? "");
  if (!name.trim()) {
    return { error: "Select a category to remove" };
  }
  try {
    await removePackageCategory(name);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to remove category",
    };
  }
  revalidatePath("/admin/inventory/categories");
  revalidatePath("/admin/inventory/packages");
  revalidatePath("/order");
  revalidatePath("/");
  return { ok: true as const };
}

export async function renamePackageCategoryAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  if ((await getAppRole()) !== "inventory_admin") {
    return { error: "Not allowed" };
  }
  const from = String(formData.get("fromCategory") ?? "");
  const toRaw = String(formData.get("toCategory") ?? "").trim().toLowerCase();
  if (!from.trim() || !toRaw) {
    return { error: "Select a category and enter a new name" };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(toRaw)) {
    return {
      error: "New name must be lowercase letters, numbers, and hyphens only",
    };
  }
  try {
    await renamePackageCategory(from, toRaw);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to rename category",
    };
  }
  revalidatePath("/admin/inventory/categories");
  revalidatePath("/admin/inventory/packages");
  revalidatePath("/order");
  revalidatePath("/");
  return { ok: true as const };
}
