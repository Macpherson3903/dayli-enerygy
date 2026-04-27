"use server";

import { headers } from "next/headers";
import { sendContactInquiryEmail } from "@/lib/email";
import { rateLimitCheck } from "@/lib/rate-limit";
import { contactMessageSchema } from "@/lib/validators";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

const CONTACT_MAX_PER_WINDOW = 5;

export type ContactFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};

export async function submitContactMessage(
  _prev: ContactFormState | undefined,
  formData: FormData
): Promise<ContactFormState> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot !== "") {
    return { success: true };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const lim = rateLimitCheck(ip, "contact", {
    maxPerWindow: CONTACT_MAX_PER_WINDOW,
  });
  if (!lim.ok) {
    return {
      error: `Too many requests. Please wait ${lim.retryAfter ?? 60} seconds.`,
    };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactMessageSchema.safeParse(raw);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string> = {};
    for (const [k, v] of Object.entries(fe)) {
      if (Array.isArray(v) && v[0]) fieldErrors[k] = v[0];
    }
    return {
      error: "Please check the form and try again.",
      fieldErrors,
    };
  }

  const sent = await sendContactInquiryEmail({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
    appUrl: getAppUrl(),
  });

  if (!sent) {
    return {
      error:
        "We could not send your message right now. Please try again in a few minutes or use the email address on this page.",
    };
  }

  return { success: true };
}
