"use client";

import { useActionState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  submitContactMessage,
  type ContactFormState,
} from "@/app/actions/contact";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initial: ContactFormState = {};

export function ContactForm() {
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    initial
  );

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

  const fe = state?.fieldErrors ?? {};

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900">Send a message</h2>
      <p className="mt-1 mb-6 text-sm text-gray-600">
        Fields marked with an asterisk are required.
      </p>

      {state?.success && (
        <div
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
          role="status"
          aria-live="polite"
        >
          Thank you. Your message has been sent. We will reply soon.
        </div>
      )}

      {state?.error && !state.success && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <form
        ref={formRef}
        action={formAction}
        className="relative flex flex-col gap-4"
      >
        <div
          className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
          aria-hidden="true"
        >
          <label htmlFor="contact-website">Company website</label>
          <input
            id="contact-website"
            type="text"
            name="website"
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
