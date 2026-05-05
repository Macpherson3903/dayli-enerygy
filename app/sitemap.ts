import type { MetadataRoute } from "next";

const BASE_URL = "https://daylienergy.com";

const indexedRoutes = [
  "",
  "/about",
  "/contact",
  "/order",
  "/installation-booking",
  "/quotation",
  "/privacy-policy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return indexedRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
