import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { rateLimitCheck } from "@/lib/rate-limit";
import { installationBookingSchema } from "@/lib/validators";
import { createInstallationBooking } from "@/lib/db/installation-bookings";
import {
  sendInstallationBookingConfirmationToCustomer,
  sendInstallationBookingEmailToOps,
} from "@/lib/email";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

const BOOKING_MAX_PER_WINDOW = 3;
const FUNCTION_NAME = "submitInstallationBooking";

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
    const lim = rateLimitCheck(ip, "installation_booking", {
      maxPerWindow: BOOKING_MAX_PER_WINDOW,
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
    const raw = {
      customer: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
      },
      site: {
        address: String(formData.get("address") ?? ""),
        city: String(formData.get("city") ?? ""),
        state: String(formData.get("state") ?? ""),
        propertyType: String(formData.get("propertyType") ?? ""),
        roofType: String(formData.get("roofType") ?? ""),
      },
      schedule: {
        preferredDate: String(formData.get("preferredDate") ?? ""),
        preferredTime: String(formData.get("preferredTime") ?? ""),
      },
      details: {
        electricityBillRange: String(formData.get("electricityBillRange") ?? ""),
        message: String(formData.get("message") ?? ""),
      },
      consent: formData.get("consent") === "on" || formData.get("consent") === "true",
      userId: userId ?? null,
    };

    const parsed = installationBookingSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
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

    const saved = await createInstallationBooking(parsed.data);
    const appUrl = getAppUrl();

    await sendInstallationBookingEmailToOps({
      bookingNumber: saved.bookingNumber,
      name: parsed.data.customer.name,
      email: parsed.data.customer.email,
      phone: parsed.data.customer.phone,
      address: parsed.data.site.address,
      city: parsed.data.site.city,
      state: parsed.data.site.state,
      propertyType: parsed.data.site.propertyType,
      roofType: parsed.data.site.roofType,
      preferredDate: parsed.data.schedule.preferredDate,
      preferredTime: parsed.data.schedule.preferredTime,
      electricityBillRange: parsed.data.details.electricityBillRange,
      message: parsed.data.details.message,
      appUrl,
    });

    await sendInstallationBookingConfirmationToCustomer({
      to: parsed.data.customer.email,
      bookingNumber: saved.bookingNumber,
      appUrl,
    });

    return NextResponse.json({
      success: true,
      functionRan: FUNCTION_NAME,
      message: `Thank you. Your booking request (${saved.bookingNumber}) has been submitted.`,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        functionRan: FUNCTION_NAME,
        message: "Unexpected error while submitting your booking.",
      },
      { status: 500 }
    );
  }
}
