export type AboutValue = {
  title: string;
  description: string;
  icon: "shield" | "leaf" | "users";
};

export type AboutMilestone = {
  year: string;
  title: string;
  description: string;
};

export const aboutSeo = {
  title: "About",
  description:
    "Learn about Dayli Energy Solutions, our mission, values, and commitment to delivering reliable solar systems across Nigeria.",
  keywords: [
    "about Dayli Energy",
    "solar company Nigeria",
    "renewable energy mission",
    "solar products and support",
    "Dayli Energy Solutions story",
  ],
  openGraphDescription:
    "Discover how Dayli Energy helps homes and businesses access dependable solar energy solutions.",
};

export const aboutHero = {
  title: "Building reliable energy for everyday life",
  subtitle:
    "Dayli Energy Solutions helps homes and businesses transition to dependable solar power with quality products, practical guidance, and long-term support.",
  primaryCta: {
    label: "Browse Products",
    href: "/order",
  },
  secondaryCta: {
    label: "Contact Our Team",
    href: "/contact",
  },
};

export const aboutMission = {
  heading: "Our mission",
  paragraphs: [
    "Our mission is to make reliable and cost-effective solar energy accessible to more people across Nigeria. We combine trusted product lines with practical recommendations tailored to each customer's energy needs.",
    "From first consultation to post-purchase guidance, we focus on clarity, responsiveness, and long-term performance so every customer can invest in power with confidence.",
  ],
};

export const aboutValues: AboutValue[] = [
  {
    title: "Quality you can trust",
    description:
      "We source proven solar panels, inverters, and batteries from credible manufacturers and prioritize durability in every recommendation.",
    icon: "shield",
  },
  {
    title: "Sustainability with impact",
    description:
      "We help customers reduce grid dependence and lower operating costs through energy systems designed for efficient daily use.",
    icon: "leaf",
  },
  {
    title: "Customer-first partnership",
    description:
      "Our team supports clients before and after purchase with straightforward communication, technical guidance, and dependable service.",
    icon: "users",
  },
];

export const aboutStory = {
  heading: "Our story",
  paragraphs: [
    "Dayli Energy Solutions was established to solve a common challenge: access to dependable power for homes and businesses. We saw the need for a provider that combines quality products with practical, local support.",
    "Over time, we have expanded our catalog and service coverage while staying focused on one goal: delivering energy systems that perform reliably in real-world conditions.",
  ],
};

export const aboutMilestones: AboutMilestone[] = [
  {
    year: "2021",
    title: "Operations launched",
    description:
      "Started delivering core solar components and advisory support for residential projects.",
  },
  {
    year: "2023",
    title: "Expanded catalog",
    description:
      "Broadened inventory to include more inverter and battery options for varied use cases.",
  },
  {
    year: "Today",
    title: "Serving nationwide",
    description:
      "Supporting customers across Nigeria with reliable product access and ongoing guidance.",
  },
];

export const aboutTrust = {
  title: "Why customers choose Dayli Energy",
  points: [
    "Nationwide delivery support",
    "Guidance for system sizing and product matching",
    "Manufacturer-backed warranty options",
    "Responsive customer communication",
  ],
};

export const aboutJsonLd = {
  organizationName: "Dayli Energy Solutions",
  url: "https://daylienergy.com/about",
  logo: "https://daylienergy.com/logo.png",
  contactEmail: "support@daylienergy.com",
};
