"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function ConfirmationInner() {
  const search = useSearchParams();
  const orderNumber = search.get("orderNumber");
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready) {
      clear();
    }
  }, [ready, clear]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900">
        Thank you — we received your request
      </h1>
      <p className="text-gray-600 mt-2">
        {orderNumber
          ? `Order reference: ${orderNumber} — our team will contact you shortly.`
          : "Our team will contact you shortly with next steps."}
      </p>
      <p className="text-sm text-gray-500 mt-4">
        Check your email for a confirmation if outgoing mail is configured.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
        <Link
          href="/account"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          View my account
        </Link>
        <Link
          href="/order"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Continue shopping
        </Link>
        <span className="text-sm text-gray-600 self-center">
          View order status anytime in your account.
        </span>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<p className="text-center py-20">Loading…</p>}>
        <ConfirmationInner />
      </Suspense>
      <Footer />
    </>
  );
}
