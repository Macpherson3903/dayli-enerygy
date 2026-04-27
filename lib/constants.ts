import type { OrderStatus } from "@/lib/types";

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

export const CATEGORIES = ["all", "solar", "inverter", "battery"] as const;
