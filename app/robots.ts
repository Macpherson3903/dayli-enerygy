import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account/", "/sign-in/", "/sign-up/"],
      },
    ],
    sitemap: "https://daylienergy.com/sitemap.xml",
    host: "https://daylienergy.com",
  };
}
