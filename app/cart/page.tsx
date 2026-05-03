"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";

const requestOrderBtnCls =
  "inline-flex w-full items-center justify-center rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-900 sm:w-auto";

export default function CartPage() {
  const { lines, subtotal, setQuantity, removeLine, itemCount, ready } =
    useCart();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  return (
    <>
      <Navbar />
      <div className="px-4 md:px-8 max-w-4xl mx-auto py-10 min-h-[50vh]">
        <PageHeader
          title="Your cart"
          description="Request a quote — sign in or create an account to continue to checkout so we can link your order to your profile. No online payment on this site."
        />
        {!ready ? (
          <p className="text-sm text-gray-500">Loading cart…</p>
        ) : itemCount === 0 ? (
          <EmptyState
            title="Your cart is empty"
            message="Browse products to add solar panels, inverters, and batteries to your cart."
            action={{ label: "Go to Order", href: "/order" }}
          />
        ) : (
          <div className="space-y-4">
            {lines.map((line) => (
              <Card
                key={line.productId}
                className="flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="relative w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900">{line.name}</h2>
                  <p className="text-sm text-green-700 font-bold mt-1">
                    ₦{line.price.toLocaleString()} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease"
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    onClick={() =>
                      setQuantity(line.productId, line.quantity - 1)
                    }
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase"
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    onClick={() =>
                      setQuantity(line.productId, line.quantity + 1)
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={() => removeLine(line.productId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
              <p className="text-lg">
                <span className="text-gray-600">Subtotal: </span>
                <span className="font-bold">₦{subtotal.toLocaleString()}</span>
              </p>
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                {!authLoaded ? (
                  <button
                    type="button"
                    disabled
                    className={`${requestOrderBtnCls} cursor-wait opacity-70`}
                  >
                    Loading…
                  </button>
                ) : isSignedIn ? (
                  <Link href="/checkout" className={requestOrderBtnCls}>
                    Request order
                  </Link>
                ) : (
                  <>
                    <SignUpButton mode="modal" forceRedirectUrl="/checkout">
                      <button type="button" className={requestOrderBtnCls}>
                        Request order
                      </button>
                    </SignUpButton>
                    <p className="text-center text-xs text-gray-600 sm:text-right">
                      <SignInButton mode="modal" forceRedirectUrl="/checkout">
                        <button
                          type="button"
                          className="font-medium text-brand-700 hover:underline"
                        >
                          Sign in
                        </button>
                      </SignInButton>
                      {" · "}
                      New here? Use Request order to create an account, then you’ll go to checkout.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
