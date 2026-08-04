import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Timeless Watch Bazar in Ujjain, Madhya Pradesh. Call, WhatsApp, or send a message for watch orders and support.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
