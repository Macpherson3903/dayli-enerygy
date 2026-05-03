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

export type ContactChannel = {
  label: string;
  value: string;
  href?: string;
  hint?: string;
};

export const contactChannels: ContactChannel[] = [
  {
    label: "Email",
    value: "support@daylienergy.com",
    href: "mailto:support@daylienergy.com",
    hint: "We typically respond within one business day.",
  },
  {
    label: "Phone",
    value: "+234 707 811 6598",
    href: "tel:+2347078116598",
    hint: "Weekdays, 9:00–17:00 WAT.",
  },
];

export const contactHours =
  "Monday–Friday, 9:00–17:00 WAT. Messages sent outside business hours are queued for the next working day.";
