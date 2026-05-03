"use client";

import { useActionState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { submitOrderRequest } from "@/app/actions/orders";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

type State = { error?: string } | undefined;

const initial: State = undefined;

export function CheckoutForm() {
  const { user } = useUser();
  const { lines, subtotal, itemCount, ready } = useCart();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    submitOrderRequest,
    initial
  );

  useEffect(() => {
    if (!user) return;
    const emailEl = document.querySelector<HTMLInputElement>('input[name="email"]');
    const nameEl = document.querySelector<HTMLInputElement>('input[name="name"]');
    const phoneEl = document.querySelector<HTMLInputElement>('input[name="phone"]');
    if (emailEl && !emailEl.value && user.primaryEmailAddress?.emailAddress) {
      emailEl.value = user.primaryEmailAddress.emailAddress;
    }
    if (nameEl && !nameEl.value) {
      const full =
        user.fullName?.trim() ||
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
      if (full) nameEl.value = full;
    }
    if (phoneEl && !phoneEl.value && user.primaryPhoneNumber?.phoneNumber) {
      phoneEl.value = user.primaryPhoneNumber.phoneNumber;
    }
  }, [user]);

  if (!ready) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }
  if (itemCount === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Checkout"
          description="Add products to your cart before submitting a request."
        />
        <EmptyState
          title="Cart is empty"
          message="You have no items to request."
          action={{ label: "Browse products", href: "/order" }}
        />
      </div>
    );
  }

  const lineItemsJson = JSON.stringify(
    lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      price: l.price,
      quantity: l.quantity,
      image: l.image,
    }))
  );

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
      <div>
        <PageHeader
          title="Complete your order request"
          description="You’re signed in — this order will be saved to your account. No online payment. Our team will contact you to confirm details. A confirmation email is sent to the address below when SMTP is configured."
        />
        {state?.error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="lineItems" value={lineItemsJson} readOnly />
          <Input
            name="name"
            label="Full name"
            required
            autoComplete="name"
          />
          <Input
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
          />
          <Input
            name="phone"
            label="Phone"
            type="tel"
            required
            autoComplete="tel"
          />
          <Textarea
            name="address"
            label="Service / delivery address"
            required
            rows={3}
            autoComplete="street-address"
          />
          <Input
            name="preferredTime"
            label="Preferred contact time (optional)"
            placeholder="e.g. Weekday mornings"
          />
          <Textarea
            name="notes"
            label="Notes (optional)"
            rows={3}
            placeholder="Extra details about your installation or site"
          />
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="consent"
              value="true"
              required
              className="mt-1 rounded border-gray-300"
            />
            <span>
              I understand this is an order <strong>request</strong>, not a
              completed purchase. A team member will follow up by email or
              phone.
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={pending} className="min-w-[200px]">
              {pending ? "Submitting…" : "Submit order request"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/cart")}
            >
              Back to cart
            </Button>
          </div>
        </form>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Order summary</h2>
        <Card className="space-y-3">
          {lines.map((l) => (
            <div
              key={l.productId}
              className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0"
            >
              <span>
                {l.name} × {l.quantity}
              </span>
              <span>₦{(l.price * l.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-2">
            <span>Subtotal</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>
        </Card>
        <p className="text-xs text-gray-500 mt-4">
          Track this order anytime under{" "}
          <Link href="/account/orders" className="text-brand-700 hover:underline">
            My orders
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
