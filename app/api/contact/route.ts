import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  sendContactConfirmationToCustomer,
  sendContactInquiryEmail,
} from "@/lib/email";
import { CONTACT_HONEYPOT_FIELD } from "@/lib/contact-honeypot";
import {
  createContactMessage,
  markContactMessageEmailFlags,
} from "@/lib/db/contact-messages";
import { rateLimitCheck } from "@/lib/rate-limit";
import { contactMessageSchema } from "@/lib/validators";

/** Mongo + nodemailer require Node; cap raised for cold start + SMTP on Vercel Pro+. */
export const runtime = "nodejs";
export const maxDuration = 60;

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

const CONTACT_MAX_PER_WINDOW = 5;
const FUNCTION_NAME = "submitContactMessage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const honeypot = String(formData.get(CONTACT_HONEYPOT_FIELD) ?? "").trim();
    if (honeypot !== "") {
      return NextResponse.json(
        {
          success: false,
          functionRan: FUNCTION_NAME,
          message:
            "We could not submit this form automatically. If you are human, try again with extensions or autofill disabled for this page.",
        },
        { status: 400 }
      );
    }

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const lim = rateLimitCheck(ip, "contact", {
      maxPerWindow: CONTACT_MAX_PER_WINDOW,
    });

    if (!lim.ok) {
      return NextResponse.json(
        {
          success: false,
          functionRan: FUNCTION_NAME,
          message: `Too many requests. Please wait ${lim.retryAfter ?? 60} seconds.`,
        },
        { status: 429 }
      );
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

      return NextResponse.json(
        {
          success: false,
          functionRan: FUNCTION_NAME,
          message: "Please check the form and try again.",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    let created;
    try {
      created = await createContactMessage(parsed.data, { sourceIp: ip });
    } catch (e) {
      console.error("[contact] Failed to save message to database", e);
      return NextResponse.json(
        {
          success: false,
          functionRan: FUNCTION_NAME,
          message:
            "We could not save your message. Please check your connection and try again, or email us directly.",
        },
        { status: 503 }
      );
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
      console.error(
        "[contact] Saved to DB but staff notification email failed",
        messageNumber
      );
      return NextResponse.json(
        {
          success: false,
          functionRan: FUNCTION_NAME,
          message:
            "Your message was saved, but we could not notify our team by email. Please try again shortly or contact us by phone or email.",
          reference: messageNumber,
        },
        { status: 502 }
      );
    }

    if (!customerSent) {
      console.warn(
        "[contact] Staff notified but customer confirmation email failed",
        messageNumber
      );
    }

    return NextResponse.json({
      success: true,
      functionRan: FUNCTION_NAME,
      reference: messageNumber,
      message: customerSent
        ? "Thank you. A confirmation email has been sent to your inbox. Our team will reply soon."
        : "Thank you. Your message has been received. Our team will reply soon.",
    });
  } catch (e) {
    console.error("[contact] Unexpected error", e);
    return NextResponse.json(
      {
        success: false,
        functionRan: FUNCTION_NAME,
        message: "Unexpected error while submitting your message.",
      },
      { status: 500 }
    );
  }
}
