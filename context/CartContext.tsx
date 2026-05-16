"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";
import {
  addMyCartItemAction,
  clearMyCartAction,
  getMyCartAction,
  mergeMyCartAction,
  removeMyCartLineAction,
  setMyCartQuantityAction,
} from "@/app/actions/cart";
import { useStatusMessage } from "@/context/StatusMessageContext";
import type { CartLine, ProductPublic } from "@/lib/types";

const STORAGE = "dayli-energy-cart";

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

function clearStorage() {
  localStorage.removeItem(STORAGE);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn } = useUser();
  const { showStatusMessage } = useStatusMessage();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const hydratedRef = useRef(false);
  const signedInRef = useRef(false);

  useEffect(() => {
    if (!authLoaded || hydratedRef.current) return;
    hydratedRef.current = true;
    const localLines = load().lines;
    if (!isSignedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration
      setLines(localLines);
      setReady(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const remote = await getMyCartAction();
        if (cancelled) return;
        if (localLines.length > 0) {
          const merged = await mergeMyCartAction(localLines);
          if (cancelled) return;
          setLines(merged.lines);
          clearStorage();
          return;
        }
        setLines(remote.lines);
      } catch {
        // Fallback to local cart when remote sync fails.
        setLines(localLines);
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn]);

  useEffect(() => {
    if (!authLoaded || !ready || !hydratedRef.current) return;
    if (signedInRef.current === isSignedIn) return;
    signedInRef.current = isSignedIn;
    if (!isSignedIn) {
      const localLines = load().lines;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional auth transition hydration
      setLines(localLines);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const remote = await getMyCartAction();
        if (!cancelled) {
          setLines(remote.lines);
          clearStorage();
        }
      } catch {
        // Keep current in-memory cart if remote fetch fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn, ready]);

  useEffect(() => {
    if (!ready) return;
    if (isSignedIn) return;
    saveToStorage({ lines });
  }, [lines, ready, isSignedIn]);

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
                price: p.priceMin,
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
          price: p.priceMin,
          quantity: q,
          image: p.image,
          maxStock: p.stock,
        },
      ];
    });
    showStatusMessage(`${p.name} added to cart.`, "success");
    if (isSignedIn) {
      void addMyCartItemAction(p, qty)
        .then((next) => setLines(next.lines))
        .catch(() => {
          showStatusMessage(
            "Added to cart, but we could not sync with your account.",
            "error"
          );
        });
    }
  }, [isSignedIn, showStatusMessage]);

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
    if (isSignedIn) {
      void setMyCartQuantityAction(productId, quantity)
        .then((next) => setLines(next.lines))
        .catch(() => {
          // Keep optimistic local state on sync failure.
        });
    }
  }, [isSignedIn]);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
    if (isSignedIn) {
      void removeMyCartLineAction(productId)
        .then((next) => setLines(next.lines))
        .catch(() => {
          // Keep optimistic local state on sync failure.
        });
    }
  }, [isSignedIn]);

  const clear = useCallback(() => {
    setLines([]);
    if (isSignedIn) {
      void clearMyCartAction().catch(() => {
        // Keep UI cleared; remote cart can be refreshed later.
      });
    }
  }, [isSignedIn]);

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
