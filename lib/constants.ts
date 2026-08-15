import type {
  InstallationBookingStatus,
  OrderStatus,
  ProductAgentInquiryStatus,
} from "@/lib/types";

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

export const PRODUCT_AGENT_INQUIRY_STATUSES: ProductAgentInquiryStatus[] = [
  "new",
  "in_progress",
  "resolved",
];

export const PRODUCT_AGENT_INQUIRY_STATUS_LABEL: Record<
  ProductAgentInquiryStatus,
  string
> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
};

export const CATEGORIES = ["all", "solar", "inverter", "battery"] as const;

export const HEAR_ABOUT_US_VALUES = [
  "google",
  "instagram",
  "facebook",
  "whatsapp",
  "friend",
  "walk_in",
  "radio_tv",
  "flyer",
  "other",
] as const;

export type HearAboutUs = (typeof HEAR_ABOUT_US_VALUES)[number];

export const HEAR_ABOUT_US_LABEL: Record<HearAboutUs, string> = {
  google: "Google search",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  friend: "Friend or family",
  walk_in: "Walk-in / office visit",
  radio_tv: "Radio or TV",
  flyer: "Flyer, billboard, or print",
  other: "Other",
};

export function hearAboutUsLabel(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if ((HEAR_ABOUT_US_VALUES as readonly string[]).includes(value)) {
    return HEAR_ABOUT_US_LABEL[value as HearAboutUs];
  }
  return value;
}

