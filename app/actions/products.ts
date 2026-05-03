"use server";

import { revalidatePath } from "next/cache";
import { getAppRole } from "@/lib/auth/roles";
import { productInputSchema, type ProductInput } from "@/lib/validators";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  addInventoryCategory,
  removeInventoryCategory,
} from "@/lib/db/products";
import { isCatalogSlugTaken } from "@/lib/db/catalog-slugs";

function makeSlugFromName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const safeBase = base || "product";
  const suffix = Date.now().toString(36).slice(-6);
  return `${safeBase}-${suffix}`;
}

function formToProductInput(formData: FormData, forUpdate: boolean) {
  const name = String(formData.get("name") ?? "");
  const category = String(formData.get("category") ?? "solar");
  const brandRaw = String(formData.get("brand") ?? "");
  const price = Number(formData.get("price"));
  const description = String(formData.get("description") ?? "");
  const shortRaw = String(formData.get("shortDescription") ?? "");
  const image = String(formData.get("image") ?? "");
  const featuresRaw = String(formData.get("features") ?? "");
  const features = featuresRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const stock = Number(formData.get("stock"));
  const active =
    formData.get("active") === "on" || formData.get("active") === "true";

  const base = {
    name,
    category: category.trim().toLowerCase(),
    brand: brandRaw.trim() || undefined,
    price,
    description,
    image,
    features,
    stock,
    active: forUpdate ? active : true,
  };
  if (forUpdate) {
    return { ...base, shortDescription: shortRaw || undefined } as ProductInput;
  }
  return {
    ...base,
    shortDescription: shortRaw || undefined,
  } as ProductInput;
}

export async function createProductAction(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  if ((await getAppRole()) !== "inventory_admin") {
    return { error: "Not allowed" };
  }
  const raw = formToProductInput(formData, false);
  const parsed = productInputSchema.safeParse({
    ...raw,
    slug: makeSlugFromName(raw.name),
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
  await createProduct(parsed.data);
  revalidatePath("/admin/inventory");
  revalidatePath("/order");
  revalidatePath("/");
  return { ok: true as const };
}

export async function addInventoryCategoryAction(
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
    await addInventoryCategory(name);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to add category" };
  }
  revalidatePath("/admin/inventory/dashboard");
  revalidatePath("/admin/inventory/add");
  revalidatePath("/admin/inventory");
  revalidatePath("/order");
  return { ok: true as const };
}

export async function removeInventoryCategoryAction(
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
    await removeInventoryCategory(name);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to remove category" };
  }
  revalidatePath("/admin/inventory/dashboard");
  revalidatePath("/admin/inventory/add");
  revalidatePath("/admin/inventory");
  revalidatePath("/order");
  return { ok: true as const };
}

export async function updateProductAction(
  productId: string,
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  if ((await getAppRole()) !== "inventory_admin") {
    return { error: "Not allowed" };
  }
  const raw = formToProductInput(formData, true);
  const parsed = productInputSchema
    .omit({ slug: true })
    .safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().formErrors[0] ?? "Check all fields",
    };
  }
  await updateProduct(productId, parsed.data);
  revalidatePath("/admin/inventory");
  revalidatePath("/order");
  revalidatePath(`/order/${productId}`);
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteProductAction(productId: string) {
  if ((await getAppRole()) !== "inventory_admin") {
    return { error: "Not allowed" };
  }
  await deleteProduct(productId);
  revalidatePath("/admin/inventory");
  revalidatePath("/order");
  revalidatePath("/");
  return { ok: true as const };
}
