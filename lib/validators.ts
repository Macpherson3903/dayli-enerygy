import { z, type ZodError } from "zod";
import { HEAR_ABOUT_US_VALUES } from "@/lib/constants";

/** First human-readable message from a Zod error (form-level or field-level). */
export function firstZodErrorMessage(
  error: ZodError,
  fallback = "Check all fields"
): string {
  const flat = error.flatten();
  const fieldMsg = Object.values(flat.fieldErrors)
    .flat()
    .find((m): m is string => typeof m === "string" && m.length > 0);
  return flat.formErrors[0] ?? fieldMsg ?? fallback;
}

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

const productPriceRangeRefine = {
  check: (d: { priceMin: number; priceMax: number }) => d.priceMin <= d.priceMax,
  message: "Maximum price must be greater than or equal to minimum price",
  path: ["priceMax"],
};

const productInputFieldsSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().trim().min(1),
  brand: z.string().trim().max(120).optional(),
  priceMin: z.number().nonnegative(),
  priceMax: z.number().nonnegative(),
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

export const productInputSchema = productInputFieldsSchema.refine(
  productPriceRangeRefine.check,
  {
    message: productPriceRangeRefine.message,
    path: productPriceRangeRefine.path,
  }
);

/** Product edit form — slug is unchanged in DB, so it is omitted from validation. */
export const productUpdateInputSchema = productInputFieldsSchema
  .omit({ slug: true })
  .refine(productPriceRangeRefine.check, {
    message: productPriceRangeRefine.message,
    path: productPriceRangeRefine.path,
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
  priceMin: z.number().nonnegative(),
  priceMax: z.number().nonnegative(),
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
}).refine((d) => d.priceMin <= d.priceMax, {
  message: "Maximum price must be greater than or equal to minimum price",
  path: ["priceMax"],
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
  quantity: z.number().nonnegative().max(1_000_000),
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
    referredBy: z
      .string()
      .trim()
      .max(200)
      .transform((s) => (s === "" ? undefined : s))
      .optional(),
    hearAboutUs: z.enum(HEAR_ABOUT_US_VALUES),
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

export const sizingCalculationInputSchema = z.object({
  customerName: z.string().trim().max(200),
  appliances: z
    .array(
      z.object({
        name: z.string().trim().max(200),
        quantity: z.number().nonnegative().max(1_000_000),
        watts: z.number().nonnegative().max(1e9),
        peakLoad: z.number().nonnegative().max(1e9),
        hoursPerDay: z.number().nonnegative().max(24),
        dailyEnergyWh: z.number().nonnegative().max(1e12),
      })
    )
    .min(1)
    .max(150),
  params: z.object({
    systemVoltage: z.union([z.literal(12), z.literal(24), z.literal(48)]),
    peakSunHours: z.number().min(0.5).max(8),
    systemEfficiency: z.number().min(0.4).max(1),
    inverterOversize: z.number().min(1).max(2),
    daysOfAutonomy: z.number().min(0.25).max(5),
    depthOfDischarge: z.number().min(0.3).max(1),
  }),
  totals: z.object({
    peakLoadW: z.number().nonnegative().max(1e12),
    dailyEnergyWh: z.number().nonnegative().max(1e15),
  }),
  result: z.object({
    inverterW: z.number().nonnegative().max(1e12),
    inverterKva: z.number().nonnegative().max(1e9),
    arrayW: z.number().nonnegative().max(1e12),
    batteryWh: z.number().nonnegative().max(1e15),
    batteryAh: z.number().nonnegative().max(1e12),
    systemVoltage: z.union([z.literal(12), z.literal(24), z.literal(48)]),
  }),
  recommendations: z
    .array(
      z.object({
        role: z.enum(["panels", "inverter", "batteries"]),
        source: z.enum(["catalog", "manual"]).optional(),
        productId: z.string().trim().min(1).max(80),
        productName: z.string().trim().min(1).max(300),
        productSlug: z.string().trim().max(200),
        quantity: z.number().int().positive().max(10_000),
        unitLabel: z.string().trim().max(120),
        coverageLabel: z.string().trim().max(400),
        priceRange: z.string().trim().max(120),
        note: z.string().trim().max(400).optional(),
      })
    )
    .max(40),
});
export type SizingCalculationInput = z.infer<typeof sizingCalculationInputSchema>;

export const quotationApplianceSheetInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  watts: z.number().positive().max(1e6),
  defaultHoursPerDay: z.number().min(0).max(24),
  sortOrder: z.number().int().min(0).max(100_000).optional(),
});

export const quotationApplianceSheetUpdateSchema =
  quotationApplianceSheetInputSchema.extend({
    id: z.string().trim().min(1).max(40),
  });

export type QuotationApplianceSheetInput = z.infer<
  typeof quotationApplianceSheetInputSchema
>;

export const productAgentInquiryUpdateSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved"]),
  internalNotes: z.string().max(8000),
});
export const invoiceLineItemInputSchema = z.object({
  catalogItemId: z.string().trim().max(80).nullable().optional(),
  catalogKind: z.enum(["product", "package"]).nullable().optional(),
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive().max(100_000),
  unitCost: z.number().nonnegative().max(1e12),
});

export const createInvoiceSchema = z.object({
  issuedAt: z.string().trim().min(1).max(40),
  customer: z.object({
    name: z.string().trim().min(1).max(200),
    phone: z.string().trim().min(5).max(40),
    email: z.string().trim().email().max(200),
    address: z.string().trim().min(3).max(500),
    city: z.string().trim().min(1).max(120),
  }),
  lineItems: z.array(invoiceLineItemInputSchema).min(1).max(80),
  labour: z.number().nonnegative().max(1e12),
  transportation: z.number().nonnegative().max(1e12),
  discount: z.number().nonnegative().max(1e12),
  vatPercent: z.number().min(0).max(100),
  paymentTerms: z.string().trim().max(500),
  warranty: z.string().trim().max(2000),
  validity: z.string().trim().max(500),
  accountNumber: z.string().trim().max(80),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type InstallationBookingInput = z.infer<typeof installationBookingSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateInputSchema>;
export type PackageInput = z.infer<typeof packageInputSchema>;
export type ProposalPayloadInput = z.infer<typeof proposalPayloadSchema>;
