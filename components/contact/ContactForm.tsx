"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useStatusMessage } from "@/context/StatusMessageContext";
import { CONTACT_HONEYPOT_FIELD } from "@/lib/contact-honeypot";

type ContactFormState = {
  error?: string;
  success?: boolean;
  /** Server message after successful submit (e.g. confirmation email notice) */
  successMessage?: string;
  /** Inquiry id when the server saved the row but returned an error (e.g. email 502) */
  reference?: string;
  fieldErrors?: Record<string, string>;
};

export function ContactForm() {
  const { user } = useUser();
  const { showStatusMessage } = useStatusMessage();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<ContactFormState>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      const el = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="email"]'
      );
      if (el && !el.value) {
        el.value = user.primaryEmailAddress.emailAddress;
      }
    }
  }, [user]);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        functionRan?: string;
        reference?: string;
        fieldErrors?: Record<string, string>;
      };

      /** Real saves always return a DEC-… reference; never treat success without it. */
      const verifiedSuccess =
        response.ok &&
        data.success === true &&
        typeof data.reference === "string" &&
        data.reference.length > 0;

      const toastText =
        data.message && data.reference && !verifiedSuccess
          ? `${data.message} Reference: ${data.reference}.`
          : data.message;

      if (toastText) {
        showStatusMessage(toastText, verifiedSuccess ? "success" : "error");
      }

      setState({
        success: verifiedSuccess,
        error: verifiedSuccess
          ? undefined
          : (data.message ?? "Request failed."),
        successMessage: verifiedSuccess ? data.message : undefined,
        reference: data.reference,
        fieldErrors: data.fieldErrors ?? {},
      });
    } catch {
      showStatusMessage(
        "Network error. Please try again.",
        "error"
      );
      setState({
        success: false,
        error: "Network error. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  const fe = state?.fieldErrors ?? {};

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900">Send a message</h2>
      <p className="mt-1 mb-6 text-sm text-gray-600">
        Fields marked with an asterisk are required.
      </p>

      {state?.success && state.successMessage && (
        <div
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
          role="status"
          aria-live="polite"
        >
          {state.successMessage}
        </div>
      )}

      {state?.error && !state.success && (
        <div className="mb-4 space-y-1" role="alert">
          <p className="text-sm text-red-600">{state.error}</p>
          {state.reference ? (
            <p className="text-sm text-gray-700">
              Your reference:{" "}
              <span className="font-mono font-medium">{state.reference}</span>
            </p>
          ) : null}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative flex flex-col gap-4"
      >
        <div
          className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
          aria-hidden="true"
        >
          <input
            type="text"
            name={CONTACT_HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        <Input
          label="Name"
          name="name"
          required
          autoComplete="name"
          error={fe.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={fe.email}
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          hint="Optional. Include country code if outside Nigeria."
          error={fe.phone}
        />
        <Input
          label="Subject"
          name="subject"
          required
          error={fe.subject}
        />
        <Textarea
          label="Message"
          name="message"
          required
          rows={6}
          error={fe.message}
        />

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending…" : "Send message"}
        </Button>
      </form>
    </Card>
  );
}
