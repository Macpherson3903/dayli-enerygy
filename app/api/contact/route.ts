import { NextResponse } from "next/server";
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
const FUNCTION_NAME = "submitContactMessage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const honeypot = String(formData.get("website") ?? "").trim();
    if (honeypot !== "") {
      return NextResponse.json({
        success: true,
        functionRan: FUNCTION_NAME,
        message: "Request accepted.",
      });
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

    const sent = await sendContactInquiryEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject: parsed.data.subject,
      message: parsed.data.message,
      appUrl: getAppUrl(),
    });

    if (!sent) {
      return NextResponse.json(
        {
          success: false,
          functionRan: FUNCTION_NAME,
          message:
            "We could not send your message right now. Please try again in a few minutes or use the email address on this page.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      functionRan: FUNCTION_NAME,
      message: "Thank you. Your message has been sent. We will reply soon.",
    });
  } catch {
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
