"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAppRole } from "@/lib/auth/roles";
import {
  generateProposalApprovalToken,
  getInstallationBookingById,
  revertProposalToSnapshot,
  saveProposalDraft,
  setProposalSent,
  syncBookingLoadEstimateFromAppliances,
} from "@/lib/db/installation-bookings";
import { sendProposalReadyEmail } from "@/lib/email";
import { proposalPayloadSchema } from "@/lib/validators";
import type { InstallationBookingProposal, ProposalPayload } from "@/lib/types";

type ActionState = { error?: string; ok?: boolean; warning?: string } | undefined;

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

function parseProposalJson(raw: string): ProposalPayload | null {
  try {
    const data = JSON.parse(raw) as unknown;
    const parsed = proposalPayloadSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function revalidateBooking(bookingId: string) {
  revalidatePath("/admin/sales");
  revalidatePath("/admin/sales/bookings");
  revalidatePath(`/admin/sales/bookings/${bookingId}`);
  revalidatePath("/account");
  revalidatePath("/account/bookings");
  revalidatePath(`/account/bookings/${bookingId}`);
}

export async function saveProposalDraftAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) {
    return { error: "Missing booking" };
  }

  const role = await getAppRole();
  if (role !== "sales_admin") {
    return { error: "Not allowed" };
  }

  const raw = String(formData.get("proposalPayload") ?? "");
  const data = parseProposalJson(raw);
  if (!data) {
    return { error: "Invalid proposal data" };
  }

  try {
    await saveProposalDraft(bookingId, data);
    await syncBookingLoadEstimateFromAppliances(bookingId, data.appliances);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not save draft";
    return { error: msg };
  }

  revalidateBooking(bookingId);
  return { ok: true as const };
}

export async function sendProposalToClientAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) {
    return { error: "Missing booking" };
  }

  const role = await getAppRole();
  if (role !== "sales_admin") {
    return { error: "Not allowed" };
  }

  const booking = await getInstallationBookingById(bookingId);
  if (!booking) {
    return { error: "Booking not found" };
  }

  const raw = String(formData.get("proposalPayload") ?? "");
  const data = parseProposalJson(raw);
  if (!data) {
    return { error: "Invalid proposal data" };
  }

  const toEmail = (data.clientDetails.email.trim() || booking.customer.email.trim());
  if (!z.string().email().safeParse(toEmail).success) {
    return { error: "Add a valid client email before sending." };
  }

  const payload: ProposalPayload = {
    ...data,
    clientDetails: { ...data.clientDetails, email: toEmail },
  };

  const previousSnapshot: InstallationBookingProposal | null = booking.proposal ?? null;
  const token = generateProposalApprovalToken();
  const approveUrl = `${getAppUrl()}/proposal/${encodeURIComponent(token)}`;

  try {
    await setProposalSent(bookingId, payload, token);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not send proposal";
    return { error: msg };
  }

  const emailed = await sendProposalReadyEmail({
    to: toEmail,
    bookingNumber: booking.bookingNumber,
    approveUrl,
  });

  if (!emailed) {
    await revertProposalToSnapshot(bookingId, previousSnapshot);
    return {
      error:
        "Email could not be sent (check SMTP configuration). Proposal was not marked as sent.",
    };
  }

  try {
    await syncBookingLoadEstimateFromAppliances(bookingId, payload.appliances);
  } catch (e) {
    console.error("[proposals] sync booking load after send failed", e);
  }

  revalidateBooking(bookingId);
  return { ok: true as const };
}
