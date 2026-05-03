"use server";

import { headers } from "next/headers";
import {
  sendContactConfirmationToCustomer,
  sendContactInquiryEmail,
} from "@/lib/email";
import {
  createContactMessage,
  markContactMessageEmailFlags,
} from "@/lib/db/contact-messages";
import { CONTACT_HONEYPOT_FIELD } from "@/lib/contact-honeypot";
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
  /** Present when the message was saved but email delivery had issues */
  reference?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitContactMessage(
  _prev: ContactFormState | undefined,
  formData: FormData
): Promise<ContactFormState> {
  const honeypot = String(formData.get(CONTACT_HONEYPOT_FIELD) ?? "").trim();
  if (honeypot !== "") {
    return {
      error:
        "We could not submit this form automatically. Try again with autofill disabled for this page.",
    };
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

  let created;
  try {
    created = await createContactMessage(parsed.data, { sourceIp: ip });
  } catch (e) {
    console.error("[contact] Failed to save message to database", e);
    return {
      error:
        "We could not save your message. Please check your connection and try again, or email us directly.",
    };
  }

  const { _id, messageNumber } = created;

  const appUrl = getAppUrl();
  const [staffSent, customerSent] = await Promise.all([
    sendContactInquiryEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject: parsed.data.subject,
      message: parsed.data.message,
      appUrl,
      reference: messageNumber,
    }),
    sendContactConfirmationToCustomer({
      to: parsed.data.email,
      name: parsed.data.name,
      subject: parsed.data.subject,
      message: parsed.data.message,
      phone: parsed.data.phone,
      appUrl,
      reference: messageNumber,
    }),
  ]);

  try {
    await markContactMessageEmailFlags(_id, {
      staffEmailSent: staffSent,
      customerEmailSent: customerSent,
    });
  } catch (e) {
    console.error("[contact] Failed to update email flags after send", e);
  }

  if (!staffSent) {
    return {
      error:
        "Your message was saved, but we could not notify our team by email. Please try again shortly or contact us by phone or email.",
      reference: messageNumber,
    };
  }

  if (!customerSent) {
    console.warn(
      "[contact] Staff notified but customer confirmation failed",
      messageNumber
    );
  }

  return { success: true };
}
