import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your Timeless Watch Bazar order status using your order details.",
  alternates: { canonical: "/track-order" },
  robots: { index: false, follow: true },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
