"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ProductPublic } from "@/lib/types";

const STORAGE = "dayli-energy-cart";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxStock: number;
};

type CartState = { lines: CartLine[] };

export type CartContextValue = {
  ready: boolean;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (p: ProductPublic, qty: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function load(): CartState {
  if (typeof window === "undefined") return { lines: [] };
  try {
    const r = localStorage.getItem(STORAGE);
    if (!r) return { lines: [] };
    const p = JSON.parse(r) as CartState;
    if (!p?.lines || !Array.isArray(p.lines)) return { lines: [] };
    return p;
  } catch {
    return { lines: [] };
  }
}

function saveToStorage(s: CartState) {
  localStorage.setItem(STORAGE, JSON.stringify(s));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Client-only: hydrate from localStorage once (cannot read window on server).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration
    setLines(load().lines);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveToStorage({ lines });
  }, [lines, ready]);

  const addItem = useCallback((p: ProductPublic, qty: number) => {
    if (p.stock < 1) return;
    setLines((prev) => {
      const q = Math.min(qty, p.stock);
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        const nq = Math.min(existing.quantity + q, p.stock);
        return prev.map((l) =>
          l.productId === p.id
            ? {
                ...l,
                quantity: nq,
                maxStock: p.stock,
                image: p.image,
                price: p.price,
                name: p.name,
              }
            : l
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          price: p.price,
          quantity: q,
          image: p.image,
          maxStock: p.stock,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      const line = prev.find((l) => l.productId === productId);
      if (!line) return prev;
      if (quantity < 1) {
        return prev.filter((l) => l.productId !== productId);
      }
      const nq = Math.min(quantity, line.maxStock);
      return prev.map((l) =>
        l.productId === productId ? { ...l, quantity: nq } : l
      );
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((a, b) => a + b.quantity, 0),
    [lines]
  );
  const subtotal = useMemo(
    () => lines.reduce((a, b) => a + b.price * b.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({
      ready,
      lines,
      itemCount,
      subtotal,
      addItem,
      setQuantity,
      removeLine,
      clear,
    }),
    [ready, lines, itemCount, subtotal, addItem, setQuantity, removeLine, clear]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

/** Returns null if no provider; prefer `useCart` in cart/checkout flows. */
export function useCartOptional(): CartContextValue | null {
  return useContext(CartContext);
}

export function useCart(): CartContextValue {
  const v = useContext(CartContext);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}
