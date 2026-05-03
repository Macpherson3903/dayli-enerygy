"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { X } from "lucide-react";
import type { ProductPublic } from "@/lib/types";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useStatusMessage } from "@/context/StatusMessageContext";

export function ProductAgentModal({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductPublic;
}) {
  const titleId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { showStatusMessage } = useStatusMessage();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    formRef.current?.reset();
    setError(null);
    setFieldErrors({});
  }, []);

  useEffect(() => {
    if (!open) return;
    resetForm();
    const t = requestAnimationFrame(() => {
      const nameEl = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="name"]'
      );
      if (user?.fullName?.trim()) {
        if (nameEl) nameEl.value = user.fullName.trim();
      } else if (user?.firstName || user?.lastName) {
        const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
        if (nameEl && full) nameEl.value = full;
      }
      const emailEl = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="email"]'
      );
      if (emailEl && user?.primaryEmailAddress?.emailAddress) {
        emailEl.value = user.primaryEmailAddress.emailAddress;
      }
      const phoneEl = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="phone"]'
      );
      if (phoneEl && user?.primaryPhoneNumber?.phoneNumber) {
        phoneEl.value = user.primaryPhoneNumber.phoneNumber;
      }
    });
    return () => cancelAnimationFrame(t);
  }, [open, user, resetForm]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!authLoaded || !isSignedIn) {
      const msg = "Please sign in to send this message.";
      setError(msg);
      showStatusMessage(msg, "error");
      return;
    }
    setPending(true);
    setError(null);
    setFieldErrors({});
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("productId", product.id);
    formData.set("productName", product.name);
    formData.set("productSlug", product.slug);

    try {
      const res = await fetch("/api/product-inquiry", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        fieldErrors?: Record<string, string>;
      };
      if (data.success) {
        showStatusMessage(
          data.message ?? "Message sent. We will reply soon.",
          "success"
        );
        resetForm();
        onClose();
      } else {
        setFieldErrors(data.fieldErrors ?? {});
        const msg =
          data.message ?? "Could not send your message. Please try again.";
        setError(msg);
        showStatusMessage(msg, "error");
      }
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      showStatusMessage(msg, "error");
    } finally {
      setPending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            Talk to an agent
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Tell us what you need about{" "}
          <span className="font-medium text-gray-800">{product.name}</span>. We
          will email you back at the address you provide.
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-4"
        >
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="sr-only"
            aria-hidden
          />
          <input type="hidden" name="productId" value={product.id} readOnly />
          <input type="hidden" name="productName" value={product.name} readOnly />
          <input type="hidden" name="productSlug" value={product.slug} readOnly />

          <Input
            name="name"
            label="Your name"
            required
            autoComplete="name"
            error={fieldErrors.name}
          />
          <Input
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            error={fieldErrors.email}
          />
          <Input
            name="phone"
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            error={fieldErrors.phone}
          />
          <Textarea
            name="message"
            label="How can we help?"
            required
            rows={5}
            minLength={10}
            placeholder="Questions, sizing, delivery, installation — share what you need."
            error={fieldErrors.message}
          />

          {error && !Object.keys(fieldErrors).length ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="submit" disabled={pending} className="min-w-[140px]">
              {pending ? "Sending…" : "Send message"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
