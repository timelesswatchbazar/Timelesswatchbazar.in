import Link from "next/link";
import { SITE_PHONE_DISPLAY } from "@/lib/site";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export default function CartPage() {
  const whatsappHref = generalWhatsAppUrl();

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-3xl">
        Order on WhatsApp
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Online cart checkout is no longer used. Message us on WhatsApp with the product you
        like and we will confirm price, availability, and delivery.
      </p>
      <div className="mt-8 space-y-3 rounded-md border border-[var(--silver)] bg-white p-5 shadow-sm">
        <p className="text-sm text-[var(--navy)]">
          WhatsApp: <strong>{SITE_PHONE_DISPLAY}</strong>
        </p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="checkout-submit inline-flex w-full items-center justify-center"
        >
          Chat on WhatsApp
        </a>
        <Link href="/products" className="btn-soft inline-flex w-full items-center justify-center">
          Browse products
        </Link>
      </div>
    </div>
  );
}
