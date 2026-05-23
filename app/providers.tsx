"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/context/CartContext";
import { StatusMessageProvider } from "@/context/StatusMessageContext";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <StatusMessageProvider>
        <CartProvider>
          {children}
          <WhatsAppFloat />
        </CartProvider>
      </StatusMessageProvider>
    </ClerkProvider>
  );
}
