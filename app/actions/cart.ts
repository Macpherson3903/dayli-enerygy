"use server";

import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";
import { clearCartForUser, getCartForUser, replaceCartForUser } from "@/lib/db/cart";
import { getProductById } from "@/lib/db/products";
import type { CartLine, ProductPublic } from "@/lib/types";

type CartPayload = { lines: CartLine[] };

function sanitizeLine(line: CartLine): CartLine | null {
  if (!line.productId || typeof line.productId !== "string") return null;
  if (!line.name || typeof line.name !== "string") return null;
  if (typeof line.price !== "number" || line.price < 0) return null;
  if (!line.image || typeof line.image !== "string") return null;
  if (typeof line.maxStock !== "number" || line.maxStock < 1) return null;
  if (!Number.isInteger(line.quantity) || line.quantity < 1) return null;
  return {
    productId: line.productId,
    name: line.name,
    price: line.price,
    image: line.image,
    maxStock: line.maxStock,
    quantity: Math.min(line.quantity, line.maxStock),
  };
}

function dedupeLines(lines: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const line of lines) {
    const safe = sanitizeLine(line);
    if (!safe) continue;
    const existing = map.get(safe.productId);
    if (!existing) {
      map.set(safe.productId, safe);
      continue;
    }
    map.set(safe.productId, {
      ...safe,
      quantity: Math.min(existing.quantity + safe.quantity, safe.maxStock),
    });
  }
  return Array.from(map.values());
}

async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

async function hydrateFromProductOrFallback(
  product: ProductPublic
): Promise<CartLine | null> {
  if (product.stock < 1) return null;
  if (ObjectId.isValid(product.id)) {
    const dbProduct = await getProductById(product.id);
    if (!dbProduct || !dbProduct.active || dbProduct.stock < 1) return null;
    return {
      productId: dbProduct._id.toString(),
      name: dbProduct.name,
      price: dbProduct.price,
      image: dbProduct.image,
      maxStock: dbProduct.stock,
      quantity: 1,
    };
  }
  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    maxStock: product.stock,
    quantity: 1,
  };
}

export async function getMyCartAction(): Promise<CartPayload> {
  const userId = await requireUserId();
  const cart = await getCartForUser(userId);
  return { lines: dedupeLines(cart?.lines ?? []) };
}

export async function mergeMyCartAction(lines: CartLine[]): Promise<CartPayload> {
  const userId = await requireUserId();
  const cart = await getCartForUser(userId);
  const merged = dedupeLines([...(cart?.lines ?? []), ...lines]);
  const nextLines = await replaceCartForUser(userId, merged);
  return { lines: nextLines };
}

export async function addMyCartItemAction(
  product: ProductPublic,
  quantity: number
): Promise<CartPayload> {
  const userId = await requireUserId();
  const base = await hydrateFromProductOrFallback(product);
  if (!base) return getMyCartAction();
  const qty = Number.isInteger(quantity) ? quantity : 1;
  const addQty = Math.max(1, qty);
  const cart = await getCartForUser(userId);
  const existing = cart?.lines ?? [];
  const next = dedupeLines([
    ...existing,
    {
      ...base,
      quantity: Math.min(addQty, base.maxStock),
    },
  ]);
  const nextLines = await replaceCartForUser(userId, next);
  return { lines: nextLines };
}

export async function setMyCartQuantityAction(
  productId: string,
  quantity: number
): Promise<CartPayload> {
  const userId = await requireUserId();
  const cart = await getCartForUser(userId);
  const existing = cart?.lines ?? [];
  if (!existing.some((line) => line.productId === productId)) {
    return { lines: existing };
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    const next = existing.filter((line) => line.productId !== productId);
    const nextLines = await replaceCartForUser(userId, next);
    return { lines: nextLines };
  }
  const next = existing.map((line) =>
    line.productId === productId
      ? { ...line, quantity: Math.min(quantity, line.maxStock) }
      : line
  );
  const nextLines = await replaceCartForUser(userId, next);
  return { lines: nextLines };
}

export async function removeMyCartLineAction(
  productId: string
): Promise<CartPayload> {
  const userId = await requireUserId();
  const cart = await getCartForUser(userId);
  const next = (cart?.lines ?? []).filter((line) => line.productId !== productId);
  const nextLines = await replaceCartForUser(userId, next);
  return { lines: nextLines };
}

export async function clearMyCartAction(): Promise<void> {
  const userId = await requireUserId();
  await clearCartForUser(userId);
}
