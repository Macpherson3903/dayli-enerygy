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
  category: z.enum(["solar", "inverter", "battery"]),
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

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
