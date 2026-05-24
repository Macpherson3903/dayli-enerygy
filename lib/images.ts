/** Fallback when catalog image URL is missing or invalid. */
export const CATALOG_IMAGE_FALLBACK = "/solarRoof.png";

/** Normalize product/package image URLs for display and storage. */
export function normalizeCatalogImageSrc(
  src: string | undefined | null
): string {
  const trimmed = src?.trim() ?? "";
  if (!trimmed) return CATALOG_IMAGE_FALLBACK;
  if (trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  if (trimmed.startsWith("http://")) {
    return `https://${trimmed.slice("http://".length)}`;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
}

/** Local `public/` assets — skip the optimizer to avoid production edge cases. */
export function isLocalPublicImage(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}
