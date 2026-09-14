import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order on WhatsApp",
  description:
    "Inquire and order watches from Timeless Watch Bazar directly on WhatsApp.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cart" },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
