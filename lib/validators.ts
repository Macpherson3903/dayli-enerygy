import { z } from "zod";

export const lineItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
});

export const createOrderSchema = z.object({
  lineItems: z.array(lineItemSchema).min(1),
  contact: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(5),
    address: z.string().min(3),
    notes: z.string().max(2000).optional(),
    preferredTime: z.string().max(200).optional(),
  }),
  consent: z
    .boolean()
    .refine((v) => v === true, { message: "You must accept to continue" }),
  /** Clerk user id — required so orders are tied to an account for tracking. */
  userId: z.string().min(1),
});

export const productInputSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().trim().min(1),
  brand: z.string().trim().max(120).optional(),
  price: z.number().nonnegative(),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  image: z
    .string()
    .min(1)
    .refine(
      (s) => s.startsWith("/") || s.startsWith("https://"),
      "Must be a local path or https URL"
    ),
  features: z.array(z.string()).default([]),
  stock: z.number().int().nonnegative(),
  active: z.boolean().default(true),
});

export const packageInputSchema = z.object({
  name: z.string().min(1),
  category: z
    .string()
    .trim()
    .min(1)
    .transform((s) => s.toLowerCase()),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .transform((s) => s.trim().toLowerCase()),
  price: z.number().nonnegative(),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  image: z
    .string()
    .min(1)
    .refine(
      (s) => s.startsWith("/") || s.startsWith("https://"),
      "Must be a local path or https URL"
    ),
  features: z.array(z.string()).default([]),
  typicalAppliances: z.array(z.string().min(1)).min(1),
  stock: z.number().int().nonnegative(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(
    [
      "new",
      "contacted",
      "scheduled",
      "fulfilled",
      "cancelled",
    ] as const
  ),
  internalNotes: z.string().max(5000),
});

export const installationBookingStatusUpdateSchema = z.object({
  status: z.enum(
    [
      "new",
      "contacted",
      "site_visit_scheduled",
      "quoted",
      "confirmed",
      "installed",
      "cancelled",
    ] as const
  ),
  internalNotes: z.string().max(5000),
});

/** Public fields only; honeypot field is checked in the API / server action (see `CONTACT_HONEYPOT_FIELD`). */
export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z
    .string()
    .trim()
    .max(50)
    .transform((s) => (s === "" ? undefined : s))
    .refine((s) => s === undefined || s.length >= 5, {
      message: "Phone must be at least 5 characters if provided",
    }),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(10).max(5000),
});

const optionalPhoneField = z
  .string()
  .trim()
  .max(50)
  .transform((s) => (s === "" ? undefined : s))
  .refine((s) => s === undefined || s.length >= 5, {
    message: "Phone must be at least 5 characters if provided",
  });

/** “Talk to an agent” from product detail — email goes to CONTACT_NOTIFY_EMAIL (or contact fallbacks). */
export const productAgentInquirySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: optionalPhoneField,
  message: z.string().trim().min(10).max(5000),
  productId: z.string().trim().min(1).max(64),
  productName: z.string().trim().min(1).max(300),
  productSlug: z.string().trim().min(1).max(200),
});

const proposalApplianceRowSchema = z.object({
  name: z.string().trim().max(200),
  quantity: z.number().int().min(0).max(1_000_000),
  watts: z.number().nonnegative().max(1e9),
  peakLoad: z.number().nonnegative().max(1e9),
  hoursPerDay: z.number().nonnegative().max(24),
  dailyEnergyWh: z.number().nonnegative().max(1e12),
});

export const installationBookingSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().min(5).max(50),
  }),
  site: z.object({
    address: z.string().trim().min(3).max(400),
    city: z.string().trim().min(2).max(120),
    state: z.string().trim().min(2).max(120),
    propertyType: z.enum(["residential", "commercial"] as const),
    roofType: z.enum(["pitched", "flat", "mixed", "unknown"] as const),
  }),
  schedule: z.object({
    preferredDate: z.string().trim().min(4).max(40),
    preferredTime: z.enum(["morning", "afternoon", "evening", "flexible"] as const),
  }),
  details: z.object({
    /** No longer collected on the form; stored as `unknown` for new bookings. */
    electricityBillRange: z.preprocess(
      (v) => {
        const s = typeof v === "string" ? v.trim() : "";
        const allowed = ["lt50k", "50k-100k", "100k-250k", "gt250k", "unknown"] as const;
        if ((allowed as readonly string[]).includes(s)) return s;
        return "unknown";
      },
      z.enum(["lt50k", "50k-100k", "100k-250k", "gt250k", "unknown"] as const)
    ),
    message: z
      .string()
      .trim()
      .max(5000)
      .transform((s) => (s === "" ? undefined : s))
      .optional(),
    quotationSummary: z
      .string()
      .trim()
      .max(12000)
      .transform((s) => (s === "" ? undefined : s))
      .optional(),
    quotationAppliances: z.array(proposalApplianceRowSchema).max(150).optional(),
  }),
  consent: z
    .boolean()
    .refine((v) => v === true, { message: "You must consent to continue" }),
  userId: z.string().nullable().optional(),
});

const proposalSystemSummaryRowSchema = z.object({
  parameter: z.string().trim().max(200),
  value: z.string().trim().max(200),
  units: z.string().trim().max(80),
});

const proposalCostLineSchema = z.object({
  qty: z.string().trim().max(40),
  item: z.string().trim().max(300),
  amount: z.string().trim().max(80),
  totalAmount: z.string().trim().max(80),
});

export const proposalPayloadSchema = z.object({
  clientDetails: z.object({
    name: z.string().trim().max(200),
    location: z.string().trim().max(400),
    phone: z.string().trim().max(50),
    email: z
      .string()
      .trim()
      .max(320)
      .refine(
        (s) => s === "" || z.string().email().safeParse(s).success,
        "Invalid email"
      ),
    date: z.string().trim().max(40),
  }),
  systemOverview: z.object({
    systemSizeKw: z.string().trim().max(80),
    batteryKwh: z.string().trim().max(80),
    batteryAh: z.string().trim().max(80),
    inverterKva: z.string().trim().max(80),
    backupHours: z.string().trim().max(80),
  }),
  appliances: z.array(proposalApplianceRowSchema).max(150),
  systemSummary: z.array(proposalSystemSummaryRowSchema).max(80),
  costLines: z.array(proposalCostLineSchema).max(80),
  warranty: z.string().trim().max(8000),
  timeline: z.object({
    delivery: z.string().trim().max(200),
    installation: z.string().trim().max(200),
    testing: z.string().trim().max(200),
    total: z.string().trim().max(200),
  }),
  terms: z.string().trim().max(12000),
  paymentTerms: z.string().trim().max(4000),
});

export const proposalApproveRequestSchema = z.object({
  token: z.string().trim().min(16).max(128),
  signerName: z.string().trim().min(1).max(200),
  consent: z.literal(true),
});

/** Parse hidden `quotationAppliancesJson` from installation booking form (calculator rows). */
export function parseQuotationAppliancesJson(
  raw: string
): z.infer<typeof proposalApplianceRowSchema>[] | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(t) as unknown;
  } catch {
    return undefined;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return undefined;
  const r = z.array(proposalApplianceRowSchema).max(150).safeParse(parsed);
  return r.success ? r.data : undefined;
}

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type ProductAgentInquiryInput = z.infer<typeof productAgentInquirySchema>;

export const productAgentInquiryUpdateSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved"]),
  internalNotes: z.string().max(8000),
});
export type InstallationBookingInput = z.infer<typeof installationBookingSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type PackageInput = z.infer<typeof packageInputSchema>;
export type ProposalPayloadInput = z.infer<typeof proposalPayloadSchema>;
