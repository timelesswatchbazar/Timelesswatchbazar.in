import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { CartProvider } from "@/components/cart-context";
import { GoogleAnalytics } from "@/components/google-analytics";
import { JsonLd } from "@/components/json-ld";
import { StoreShell } from "@/components/store-shell";
import { fetchCategories } from "@/lib/catalog";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Watches in Ujjain, India`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "watches Ujjain",
    "buy watches India",
    "men's watches",
    "women's watches",
    "smart watches",
    "luxury watches",
    "watch store Madhya Pradesh",
    "Timeless Watch Bazar",
    "COD watches India",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Watches in Ujjain, India`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Watches in Ujjain, India`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  category: "shopping",
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

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/icon.svg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ujjain",
      addressRegion: "Madhya Pradesh",
      addressCountry: "IN",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    priceRange: "₹₹",
    openingHours: "Mo-Sa 10:00-19:00",
    email: "info@timelesswatchbazar.com",
    telephone: "+919876543210",
  };

  return (
    <html lang="en-IN" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <GoogleAnalytics />
        <JsonLd data={orgJsonLd} />
        <CartProvider>
          <StoreShell categories={categories}>{children}</StoreShell>
        </CartProvider>
      </body>
    </html>
  );
}
