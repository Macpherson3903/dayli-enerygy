"use client";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/content/business";

/**
 * Fixed WhatsApp chat launcher — viewport bottom-right, outside centered max-width layouts.
 */
export function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp (${WHATSAPP_DISPLAY})`}
      className="fixed z-40 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/30 transition hover:bg-[#20bd5a] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 bottom-4 right-4 h-11 w-11 sm:bottom-5 sm:right-5 sm:h-12 sm:w-12 md:bottom-6 md:right-6 md:h-14 md:w-14 lg:bottom-8 lg:right-8 lg:h-16 lg:w-16"
    >
      <WhatsAppIcon className="h-[55%] w-[55%]" />
    </a>
  );
}
