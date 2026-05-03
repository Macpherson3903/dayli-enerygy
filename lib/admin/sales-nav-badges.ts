import { countOrdersByStatus } from "@/lib/db/orders";
import { countInstallationBookingsByStatus } from "@/lib/db/installation-bookings";
import { countProductAgentInquiriesByStatus } from "@/lib/db/product-agent-inquiries";

/** Counts for sidebar badges (unattended / needs attention). */
export type SalesNavBadgeCounts = {
  /** Order pipeline: not yet contacted. */
  newOrders: number;
  /** Installation booking pipeline: not yet contacted. */
  newBookings: number;
  /** Product “Talk to an agent” inquiries not yet picked up. */
  newProductInquiries: number;
};

export async function getSalesNavBadgeCounts(): Promise<SalesNavBadgeCounts> {
  const [newOrders, newBookings, newProductInquiries] = await Promise.all([
    countOrdersByStatus("new"),
    countInstallationBookingsByStatus("new"),
    countProductAgentInquiriesByStatus("new"),
  ]);
  return { newOrders, newBookings, newProductInquiries };
}
