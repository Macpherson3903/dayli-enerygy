"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useStatusMessage } from "@/context/StatusMessageContext";
import type { ProposalApplianceRow } from "@/lib/types";

type BookingFormState = {
  error?: string;
  success?: boolean;
  bookingNumber?: string;
  fieldErrors?: Record<string, string>;
};

function SelectField(props: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  options: { value: string; label: string }[];
}) {
  const { label, name, required, error, options } = props;
  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
        {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue=""
        className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-brand-500 focus:ring-brand-500"
        }`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-err` : undefined}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${name}-err`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export type InstallationBookingFormProps = {
  /** When true, shows the load-estimate field (paired with the quotation calculator above). */
  showQuotationBlock?: boolean;
  quotationSummary?: string;
  /** Structured rows from the calculator when the client clicked &quot;Add estimate&quot;. */
  quotationAppliances?: ProposalApplianceRow[];
  onQuotationSummaryChange?: (value: string) => void;
  onBookingSuccess?: () => void;
};

export function InstallationBookingForm({
  showQuotationBlock = false,
  quotationSummary = "",
  quotationAppliances = [],
  onQuotationSummaryChange,
  onBookingSuccess,
}: InstallationBookingFormProps = {}) {
  const { user } = useUser();
  const { showStatusMessage } = useStatusMessage();
  const formRef = useRef<HTMLFormElement>(null);
  const onBookingSuccessRef = useRef(onBookingSuccess);
  const [state, setState] = useState<BookingFormState>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    onBookingSuccessRef.current = onBookingSuccess;
  }, [onBookingSuccess]);

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    const el = formRef.current?.querySelector<HTMLInputElement>('input[name="email"]');
    if (el && !el.value) el.value = email;
  }, [user]);

  useEffect(() => {
    if (!state?.success) return;
    formRef.current?.reset();
    onBookingSuccessRef.current?.();
  }, [state?.success]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/installation-booking", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        success?: boolean;
        bookingNumber?: string;
        message?: string;
        functionRan?: string;
        fieldErrors?: Record<string, string>;
      };

      const ok =
        Boolean(data.success) &&
        typeof data.bookingNumber === "string" &&
        data.bookingNumber.length > 0;

      const toastText = data.message?.trim() || (ok ? "Booking submitted." : "Request failed.");
      showStatusMessage(toastText, ok ? "success" : "error");

      setState({
        success: ok,
        bookingNumber: ok ? data.bookingNumber : undefined,
        error: ok ? undefined : data.message ?? "Request failed.",
        fieldErrors: data.fieldErrors ?? {},
      });
    } catch {
      showStatusMessage(
        "submitInstallationBooking: Network error. Please try again.",
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

  const fe = state.fieldErrors ?? {};

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900">Installation booking</h2>
      <p className="mb-6 mt-1 text-sm text-gray-600">
        {showQuotationBlock
          ? "Add your load estimate if you used the calculator, then complete your details. Fields marked with an asterisk are required."
          : "Fields marked with an asterisk are required."}
      </p>

      {state?.success && state.bookingNumber ? (
        <div
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
          role="status"
          aria-live="polite"
        >
          Thank you. Your booking request{" "}
          <span className="font-semibold">{state.bookingNumber}</span> has been submitted. You
          should receive a confirmation email shortly.
        </div>
      ) : null}

      {state?.error && !state.success && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {state.error}
        </p>
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
          <label htmlFor="installation-hp">Leave blank</label>
          <input
            id="installation-hp"
            type="text"
            name="field_hp_check"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {showQuotationBlock ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-900">Your load estimate</h3>
            <p className="mt-1 text-sm text-gray-600">
              Use the calculator above, then click &quot;Add this estimate to my booking
              request&quot; to fill this box. You can edit the text before submitting.
            </p>
            <input type="hidden" name="quotationSummary" value={quotationSummary} readOnly />
            <input
              type="hidden"
              name="quotationAppliancesJson"
              value={JSON.stringify(quotationAppliances)}
              readOnly
            />
            <div className="mt-4">
              <Textarea
                label="Estimate summary (optional)"
                rows={8}
                value={quotationSummary}
                onChange={(e) => onQuotationSummaryChange?.(e.target.value)}
                error={fe["details.quotationSummary"]}
                placeholder="Your appliance totals will appear here, or describe your needs in your own words."
              />
            </div>
          </div>
        ) : null}

        <Input label="Full name" name="name" required autoComplete="name" error={fe["customer.name"]} />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={fe["customer.email"]}
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          error={fe["customer.phone"]}
        />
        <Input
          label="Installation address"
          name="address"
          required
          autoComplete="street-address"
          error={fe["site.address"]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="City" name="city" required error={fe["site.city"]} />
          <Input label="State" name="state" required error={fe["site.state"]} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Property type"
            name="propertyType"
            required
            error={fe["site.propertyType"]}
            options={[
              { value: "residential", label: "Residential" },
              { value: "commercial", label: "Commercial" },
            ]}
          />
          <SelectField
            label="Roof type"
            name="roofType"
            required
            error={fe["site.roofType"]}
            options={[
              { value: "pitched", label: "Pitched roof" },
              { value: "flat", label: "Flat roof" },
              { value: "mixed", label: "Mixed" },
              { value: "unknown", label: "Not sure yet" },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Preferred date"
            name="preferredDate"
            type="date"
            required
            error={fe["schedule.preferredDate"]}
          />
          <SelectField
            label="Preferred time"
            name="preferredTime"
            required
            error={fe["schedule.preferredTime"]}
            options={[
              { value: "morning", label: "Morning" },
              { value: "afternoon", label: "Afternoon" },
              { value: "evening", label: "Evening" },
              { value: "flexible", label: "Flexible" },
            ]}
          />
        </div>

        <Textarea
          label="Additional notes"
          name="message"
          rows={5}
          error={fe["details.message"]}
          placeholder="Tell us about your power needs, appliances, or anything important for the site visit."
        />

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
            aria-invalid={fe.consent ? "true" : undefined}
            aria-describedby={fe.consent ? "consent-err" : undefined}
          />
          <span>
            I consent to Dayli Energy contacting me about this installation request.
          </span>
        </label>
        {fe.consent && (
          <p id="consent-err" className="mt-[-8px] text-sm text-red-600" role="alert">
            {fe.consent}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Submitting..." : "Submit booking request"}
        </Button>
      </form>
    </Card>
  );
}
