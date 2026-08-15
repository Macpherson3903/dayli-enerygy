"use client";

import { useState } from "react";
import { QuotationCalculator } from "@/components/quotation/QuotationCalculator";
import { InstallationBookingForm } from "./InstallationBookingForm";
import type { QuotationAppliance } from "@/lib/content/quotation";
import type { ProposalApplianceRow } from "@/lib/types";

export function InstallationQuoteBookingFlow({
  appliances,
}: {
  appliances: QuotationAppliance[];
}) {
  const [quotationSummary, setQuotationSummary] = useState("");
  const [quotationAppliances, setQuotationAppliances] = useState<
    ProposalApplianceRow[]
  >([]);

  return (
    <div className="space-y-10">
      <section aria-labelledby="quote-heading" className="space-y-4">
        <div>
          <h2 id="quote-heading" className="text-xl font-bold text-gray-900">
            Load estimate
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Enter how many of each appliance you have and roughly how many hours per day you use
            them. Use the button at the bottom to copy a full load summary into your booking
            request.
          </p>
        </div>
        <QuotationCalculator
          appliances={appliances}
          onApplyEstimate={(p) => {
            setQuotationSummary(p.summaryText);
            setQuotationAppliances(p.appliances);
          }}
        />
      </section>

      <InstallationBookingForm
        showQuotationBlock
        quotationSummary={quotationSummary}
        quotationAppliances={quotationAppliances}
        onQuotationSummaryChange={setQuotationSummary}
        onBookingSuccess={() => {
          setQuotationSummary("");
          setQuotationAppliances([]);
        }}
      />
    </div>
  );
}
