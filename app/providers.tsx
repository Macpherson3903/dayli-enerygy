"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/context/CartContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
        {children}
      </ClerkProvider>
    </CartProvider>
  );
}
