import { WHATSAPP_DISPLAY, WHATSAPP_E164, WHATSAPP_URL } from "@/lib/content/whatsapp";

export { WHATSAPP_DISPLAY, WHATSAPP_E164, WHATSAPP_URL };

/** Physical showroom — Port Harcourt, Rivers State. */
export const BUSINESS_ADDRESS_DISPLAY =
  "No 286a, Suite 3 Ground Floor, Aba Express Way, Rumuokwurushi Junction, Opp. Access Bank, Port Harcourt, Rivers State, Nigeria";

/** Used for Google Maps search / embed queries. */
export const BUSINESS_ADDRESS_MAPS_QUERY =
  "No 286a Suite 3 Ground Floor Aba Express Way Rumuokwurushi Junction Opp Access Bank Port Harcourt Rivers State Nigeria";

export function businessMapsEmbedUrl(): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS_ADDRESS_MAPS_QUERY)}&hl=en&z=16&output=embed`;
}

export function businessMapsLinkUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_ADDRESS_MAPS_QUERY)}`;
}
