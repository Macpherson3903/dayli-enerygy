import type { InstallationBookingStatus, OrderStatus } from "@/lib/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "fulfilled",
  "cancelled",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Install scheduled",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export const INSTALLATION_BOOKING_STATUSES: InstallationBookingStatus[] = [
  "new",
  "contacted",
  "site_visit_scheduled",
  "quoted",
  "confirmed",
  "installed",
  "cancelled",
];

export const INSTALLATION_BOOKING_STATUS_LABEL: Record<
  InstallationBookingStatus,
  string
> = {
  new: "New",
  contacted: "Contacted",
  site_visit_scheduled: "Site visit scheduled",
  quoted: "Quoted",
  confirmed: "Confirmed",
  installed: "Installed",
  cancelled: "Cancelled",
};

export const CATEGORIES = ["all", "solar", "inverter", "battery"] as const;
