import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Sign in to manage your Timeless Watch Bazar account, address, and orders.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/profile" },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
