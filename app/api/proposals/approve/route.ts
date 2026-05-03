import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimitCheck } from "@/lib/rate-limit";
import { proposalApproveRequestSchema } from "@/lib/validators";
import { approveProposalByToken } from "@/lib/db/installation-bookings";

const APPROVE_MAX_PER_WINDOW = 15;
const FUNCTION_NAME = "approveProposal";

export async function POST(request: Request) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const lim = rateLimitCheck(ip, "proposal_approve", {
      maxPerWindow: APPROVE_MAX_PER_WINDOW,
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

    const body = (await request.json()) as unknown;
    const parsed = proposalApproveRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          functionRan: FUNCTION_NAME,
          message: "Invalid request.",
        },
        { status: 400 }
      );
    }

    const signerIp = ip === "local" ? null : ip;
    const result = await approveProposalByToken(
      parsed.data.token,
      parsed.data.signerName,
      signerIp
    );

    if (result.ok) {
      return NextResponse.json({
        success: true,
        functionRan: FUNCTION_NAME,
        message: "Proposal approved. Thank you.",
      });
    }

    const statusByReason = {
      not_found: 404,
      not_sent: 400,
      expired: 410,
      already_approved: 409,
    } as const;

    const messageByReason = {
      not_found: "This proposal link is not valid.",
      not_sent: "This proposal is not available for approval.",
      expired: "This link has expired. Please contact us for a new link.",
      already_approved: "This proposal was already approved.",
    } as const;

    return NextResponse.json(
      {
        success: false,
        functionRan: FUNCTION_NAME,
        message: messageByReason[result.reason],
      },
      { status: statusByReason[result.reason] }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        functionRan: FUNCTION_NAME,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
