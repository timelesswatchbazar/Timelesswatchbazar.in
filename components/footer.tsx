import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="border-t border-[var(--navy)] bg-[var(--midnight)] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-5 lg:px-8">
        <div>
          <Link className="brand-text inline-flex flex-col" href="/">
            <span className="text-xl font-extrabold tracking-tight">Timeless</span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
              Watch Bazar
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-[var(--silver)]">
            Timeless Watch Bazar is your trusted destination for men&apos;s, women&apos;s,
            luxury, smart, and sports watches. We bring quality timepieces, great value,
            and a seamless shopping experience to customers worldwide.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--gold)]">
            Explore
          </h2>
          <nav className="mt-4 flex flex-col gap-3">
            <Link className="w-fit text-sm text-[var(--silver)] transition hover:text-white" href="/">
              Home
            </Link>
            <Link
              className="w-fit text-sm text-[var(--silver)] transition hover:text-white"
              href="/categories"
            >
              Categories
            </Link>
            <Link
              className="w-fit text-sm text-[var(--silver)] transition hover:text-white"
              href="/track-order"
            >
              Track Order
            </Link>
            <Link
              className="w-fit text-sm text-[var(--silver)] transition hover:text-white"
              href="/about"
            >
              About Us
            </Link>
            <Link
              className="w-fit text-sm text-[var(--silver)] transition hover:text-white"
              href="/contact"
            >
              Contact Us
            </Link>
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--gold)]">
            Policies
          </h2>
          <nav className="mt-4 flex flex-col gap-3">
            <Link
              className="w-fit text-sm text-[var(--silver)] transition hover:text-white"
              href="/privacy-policy"
            >
              Privacy Policy
            </Link>
            <Link
              className="w-fit text-sm text-[var(--silver)] transition hover:text-white"
              href="/terms-and-conditions"
            >
              Terms & Conditions
            </Link>
            <Link
              className="w-fit text-sm text-[var(--silver)] transition hover:text-white"
              href="/return-policy"
            >
              Return Policy
            </Link>
            <Link
              className="w-fit text-sm text-[var(--silver)] transition hover:text-white"
              href="/faq"
            >
              FAQ
            </Link>
            <Link
              className="w-fit text-sm text-[var(--silver)] transition hover:text-white"
              href="/shipping-policy"
            >
              Shipping Policy
            </Link>
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--gold)]">
            Contact
          </h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--silver)]">
            <p>info@timelesswatchbazar.com</p>
            <a
              href="tel:+971500000000"
              className="block w-fit transition hover:text-white"
            >
              +971 50 000 0000
            </a>
            <p>Mon to Sat, 10:00 AM - 7:00 PM</p>
            <p>United Arab Emirates</p>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--gold)]">
            Follow us
          </h2>
          <nav className="mt-4 flex flex-col gap-3">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 text-sm text-[var(--silver)] transition hover:text-white"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--gold)]/50">
                <InstagramIcon />
              </span>
              Instagram
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 text-sm text-[var(--silver)] transition hover:text-white"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--gold)]/50">
                <FacebookIcon />
              </span>
              Facebook
            </a>
          </nav>
        </div>
      </div>
      <div className="border-t border-[var(--navy)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-[var(--silver)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Timeless Watch Bazar. All rights reserved.</p>
          <p>Crafted for watch lovers in the UAE & beyond.</p>
        </div>
      </div>
    </footer>
  );
}
