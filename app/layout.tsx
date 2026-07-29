import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { CartProvider } from "@/components/cart-context";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Timeless Watch Bazar",
    template: "%s | Timeless Watch Bazar",
  },
  description:
    "Shop men's, women's, luxury, smart, and sports watches at Timeless Watch Bazar. Quality timepieces at amazing prices.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A2540",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
