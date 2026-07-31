import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { CartProvider } from "@/components/cart-context";
import { StoreShell } from "@/components/store-shell";
import { fetchCategories } from "@/lib/catalog";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Timeless Watch Bazar",
    template: "%s | Timeless Watch Bazar",
  },
  description:
    "Shop men's, women's, luxury, smart, and sports watches at Timeless Watch Bazar in Ujjain, India. Quality timepieces at amazing prices in INR.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A2540",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await fetchCategories();

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <CartProvider>
          <StoreShell categories={categories}>{children}</StoreShell>
        </CartProvider>
      </body>
    </html>
  );
}
