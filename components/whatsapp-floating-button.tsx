"use client";

import { WhatsAppIcon } from "@/components/icons";
import { SITE_PHONE_DISPLAY } from "@/lib/site";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloatingButton() {
  const href = generalWhatsAppUrl();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp ${SITE_PHONE_DISPLAY}`}
      title="Chat on WhatsApp"
      className="fixed bottom-24 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
