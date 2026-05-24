/** Fallback when catalog image URL is missing or invalid. */
export const CATALOG_IMAGE_FALLBACK = "/solarRoof.png";

/** Normalize product/package image URLs for display and storage. */
export function normalizeCatalogImageSrc(
  src: string | undefined | null
): string {
  let trimmed = src?.trim() ?? "";
  if (!trimmed) return CATALOG_IMAGE_FALLBACK;
  if (trimmed.startsWith("//")) {
    trimmed = `https:${trimmed}`;
  } else if (trimmed.startsWith("http://")) {
    trimmed = `https://${trimmed.slice("http://".length)}`;
  } else if (
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("/")
  ) {
    trimmed = `/${trimmed.replace(/^\/+/, "")}`;
  }
  return trimmed;
}

/** Local `public/` assets. */
export function isLocalPublicImage(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}

/** Remote catalog images (Cloudinary, etc.) — load directly, not via `/_next/image`. */
export function isRemoteCatalogImage(src: string): boolean {
  return src.startsWith("https://");
}
