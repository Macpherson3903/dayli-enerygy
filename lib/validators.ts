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
  userId: z.string().nullable().optional(),
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

/** Public fields only; honeypot `website` is validated in the server action. */
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
    electricityBillRange: z.enum(
      ["lt50k", "50k-100k", "100k-250k", "gt250k", "unknown"] as const
    ),
    message: z
      .string()
      .trim()
      .max(5000)
      .transform((s) => (s === "" ? undefined : s))
      .optional(),
  }),
  consent: z
    .boolean()
    .refine((v) => v === true, { message: "You must consent to continue" }),
  userId: z.string().nullable().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type InstallationBookingInput = z.infer<typeof installationBookingSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
