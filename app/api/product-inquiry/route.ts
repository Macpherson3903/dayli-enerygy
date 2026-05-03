import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import {
  sendProductAgentInquiryConfirmationToCustomer,
  sendProductAgentInquiryEmail,
} from "@/lib/email";
import { rateLimitCheck } from "@/lib/rate-limit";
import { productAgentInquirySchema } from "@/lib/validators";
import { createProductAgentInquiry } from "@/lib/db/product-agent-inquiries";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

const MAX_PER_WINDOW = 5;
const FUNCTION_NAME = "submitProductAgentInquiry";

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
    const lim = rateLimitCheck(ip, "product-inquiry", {
      maxPerWindow: MAX_PER_WINDOW,
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

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          functionRan: FUNCTION_NAME,
          message: "Please sign in to contact an agent.",
        },
        { status: 401 }
      );
    }

    const raw = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
      productId: String(formData.get("productId") ?? ""),
      productName: String(formData.get("productName") ?? ""),
      productSlug: String(formData.get("productSlug") ?? ""),
    };

    const parsed = productAgentInquirySchema.safeParse(raw);
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

    let inquiryNumber: string;
    try {
      const created = await createProductAgentInquiry(parsed.data);
      inquiryNumber = created.inquiryNumber;
      revalidatePath("/admin/sales");
      revalidatePath("/admin/sales/product-inquiries");
    } catch (e) {
      console.error("[product-inquiry] DB insert failed", e);
      return NextResponse.json(
        {
          success: false,
          functionRan: FUNCTION_NAME,
          message: "We could not save your request. Please try again shortly.",
        },
        { status: 500 }
      );
    }

    const appUrl = getAppUrl();
    const staffPayload = {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      productName: parsed.data.productName,
      productId: parsed.data.productId,
      productSlug: parsed.data.productSlug,
      appUrl,
    };

    const staffSent = await sendProductAgentInquiryEmail(staffPayload);
    const customerSent = await sendProductAgentInquiryConfirmationToCustomer({
      to: parsed.data.email,
      inquiryNumber,
      productName: parsed.data.productName,
      appUrl,
    });

    if (!staffSent) {
      return NextResponse.json({
        success: true,
        functionRan: FUNCTION_NAME,
        inquiryNumber,
        message: customerSent
          ? `Thank you. Reference ${inquiryNumber} — check your email for confirmation. Our team was not emailed automatically; they will still see your request in Sales → Product inquiries. Confirm CONTACT_NOTIFY_EMAIL if staff alerts are missing.`
          : `Thank you. Reference ${inquiryNumber}. Your request is saved for our team (Sales → Product inquiries). We could not send email to staff or a confirmation to you — please verify SMTP_* in the server environment.`,
      });
    }

    let message =
      "Thank you. Your message was sent — our team will follow up with you shortly.";
    if (customerSent) {
      message += ` Reference: ${inquiryNumber}. Check your inbox for a confirmation email.`;
    } else {
      message += ` Reference: ${inquiryNumber}. We could not send a confirmation email; our team will still contact you.`;
    }

    return NextResponse.json({
      success: true,
      functionRan: FUNCTION_NAME,
      inquiryNumber,
      message,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        functionRan: FUNCTION_NAME,
        message: "Unexpected error while sending your message.",
      },
      { status: 500 }
    );
  }
}
