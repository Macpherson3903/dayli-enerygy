export const contactSeo = {
  title: "Contact",
  description:
    "Get in touch with Dayli Energy Solutions for product questions, quotes, and support. Send a message or reach us by phone or email.",
  keywords: [
    "contact Dayli Energy",
    "solar support Nigeria",
    "solar quote",
    "Dayli Energy phone",
    "renewable energy help",
  ],
  openGraphDescription:
    "Reach the Dayli Energy team for solar products, installation guidance, and customer support.",
};

export const contactHeader = {
  title: "Contact us",
  description:
    "Have a question about products, pricing, or installation? Send a message and our team will get back to you as soon as possible.",
};

import {
  BUSINESS_ADDRESS_DISPLAY,
  businessMapsLinkUrl,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/content/business";

export type ContactChannel = {
  label: string;
  value: string;
  href?: string;
  hint?: string;
  /** Open link in a new tab (e.g. Google Maps, WhatsApp). */
  external?: boolean;
};

export const contactChannels: ContactChannel[] = [
  {
    label: "Office",
    value: BUSINESS_ADDRESS_DISPLAY,
    href: businessMapsLinkUrl(),
    external: true,
    hint: "Port Harcourt showroom — tap to open in Google Maps.",
  },
  {
    label: "WhatsApp",
    value: WHATSAPP_DISPLAY,
    href: WHATSAPP_URL,
    external: true,
    hint: "Chat with us anytime — we typically reply within a few hours.",
  },
  {
    label: "Email",
    value: "support@daylienergy.com",
    href: "mailto:support@daylienergy.com",
    hint: "We typically respond within one business day.",
  },
];

export const contactHours =
  "Monday–Friday, 9:00–17:00 WAT. Messages sent outside business hours are queued for the next working day.";
