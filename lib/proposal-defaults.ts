import { parseQuotationSummaryTextToAppliances } from "@/lib/content/quotation";
import type {
  InstallationBookingDoc,
  ProposalApplianceRow,
  ProposalPayload,
} from "@/lib/types";

/** Structured load rows from the booking: JSON from calculator, else parsed from plain-text summary. */
export function getBookingApplianceRowsFromBooking(
  booking: InstallationBookingDoc
): ProposalApplianceRow[] {
  const structured = booking.details.quotationAppliances;
  if (structured && structured.length > 0) {
    return structured.map((r) => ({ ...r }));
  }
  const summary = booking.details.quotationSummary?.trim();
  if (summary) {
    return parseQuotationSummaryTextToAppliances(summary);
  }
  return [];
}

const DEFAULT_TERMS = `• System design is based on estimated load and site assessment.
• Upgrades or changes may adjust final pricing after site verification.
• Solar output varies with weather and shading.`;

const DEFAULT_PAYMENT = `90% deposit upon approval; 10% balance upon completion.`;

export function emptyProposalPayload(): ProposalPayload {
  return {
    clientDetails: {
      name: "",
      location: "",
      phone: "",
      email: "",
      date: "",
    },
    systemOverview: {
      systemSizeKw: "",
      batteryKwh: "",
      batteryAh: "",
      inverterKva: "",
      backupHours: "",
    },
    appliances: [],
    systemSummary: [],
    costLines: [],
    warranty: "",
    timeline: {
      delivery: "",
      installation: "",
      testing: "",
      total: "",
    },
    terms: DEFAULT_TERMS,
    paymentTerms: DEFAULT_PAYMENT,
  };
}

/** Prefill client block from an existing installation booking. */
export function defaultProposalPayloadFromBooking(
  booking: InstallationBookingDoc
): ProposalPayload {
  const base = emptyProposalPayload();
  const fromClient = getBookingApplianceRowsFromBooking(booking);
  return {
    ...base,
    clientDetails: {
      name: booking.customer.name,
      location: [booking.site.address, booking.site.city, booking.site.state]
        .filter(Boolean)
        .join(", "),
      phone: booking.customer.phone,
      email: booking.customer.email,
      date: new Date().toISOString().slice(0, 10),
    },
    appliances: fromClient.length > 0 ? fromClient : base.appliances,
  };
}

/**
 * Proposal editor initial state: use saved draft when present, but if the saved
 * appliances list is empty and the client submitted structured load rows on the
 * booking, prefill from the booking so admins see the client's estimate.
 */
export function getInitialProposalPayloadForEditor(
  booking: InstallationBookingDoc
): ProposalPayload {
  const defaults = defaultProposalPayloadFromBooking(booking);
  const saved = booking.proposal?.data;

  if (!saved) {
    return defaults;
  }

  const clientRows = getBookingApplianceRowsFromBooking(booking);
  const appliances =
    saved.appliances.length > 0
      ? saved.appliances
      : clientRows.length > 0
        ? clientRows.map((r) => ({ ...r }))
        : saved.appliances;

  return {
    ...saved,
    appliances,
  };
}
