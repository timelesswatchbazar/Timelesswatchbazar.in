import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review items in your Timeless Watch Bazar cart and place a COD order.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cart" },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
