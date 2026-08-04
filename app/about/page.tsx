import type { Metadata } from "next";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Timeless Watch Bazar in Ujjain, Madhya Pradesh — quality men's, women's, smart, and luxury watches at competitive INR prices.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <ScrollReveal>
        <p className="section-eyebrow">Welcome to Timeless Watch Bazar</p>
        <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-5xl">
          Discover Timeless Watches At Amazing Prices
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)] sm:mt-6 sm:text-lg sm:leading-8">
          Based in Ujjain, Madhya Pradesh, Timeless Watch Bazar is your trusted
          destination for elegant, practical, and trending watches that elevate everyday
          style. From classic dress watches and luxury automatics to smart wearables and
          sports divers, we carefully select pieces that offer quality, value, and lasting
          craftsmanship.
        </p>
      </ScrollReveal>

      <ScrollReveal className="mt-14" delay={1}>
        <h2 className="text-2xl font-bold text-[var(--midnight)]">Who We Are</h2>
        <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
          At Timeless Watch Bazar, we are passionate about helping customers discover
          watches that match their lifestyle. We continuously research market trends
          and customer needs to bring you timepieces that are stylish, reliable, and
          in demand.
        </p>
        <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
          Our goal is to provide a reliable and enjoyable shopping experience, offering
          carefully selected watches backed by excellent customer service, secure
          shopping, and competitive prices.
        </p>
      </ScrollReveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <ScrollReveal delay={1}>
          <div className="rounded-md border border-[var(--silver)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--midnight)]">Our Mission</h3>
            <p className="mt-3 leading-7 text-[var(--muted)]">
              To make online watch shopping simple, affordable, and enjoyable by providing
              quality timepieces, exceptional customer support, and a seamless shopping
              experience for every customer.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <div className="rounded-md border border-[var(--silver)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--midnight)]">Our Vision</h3>
            <p className="mt-3 leading-7 text-[var(--muted)]">
              To become a trusted global destination for watches recognized for quality,
              style, customer satisfaction, and value-driven shopping.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4" delay={1}>
        {[
          ["100%", "Secure Shopping"],
          ["24/7", "Customer Support"],
          ["Fast", "Order Processing"],
          ["New", "Watches Added Regularly"],
        ].map(([stat, label]) => (
          <div
            key={label}
            className="rounded-md border border-[var(--silver)] bg-[var(--surface)] p-5 text-center"
          >
            <p className="text-2xl font-extrabold text-[var(--gold)]">{stat}</p>
            <p className="mt-1 text-sm font-medium text-[var(--navy)]">{label}</p>
          </div>
        ))}
      </ScrollReveal>

      <ScrollReveal className="mt-14" delay={1}>
        <h2 className="text-2xl font-bold text-[var(--midnight)]">Why Shop With Us?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Trending Watches", "Discover the latest and most popular watches from around the world."],
            ["Best Value", "Competitive pricing with excellent value for every purchase."],
            ["Secure Shopping", "Safe and secure transactions for complete peace of mind."],
            ["Customer Support", "Dedicated support whenever you need assistance."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-md border border-[var(--silver)] p-5 transition hover:border-[var(--gold)] hover:shadow-md"
            >
              <h3 className="font-bold text-[var(--midnight)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal className="mt-14" delay={1}>
        <section className="rounded-md bg-[var(--midnight)] px-6 py-10 text-white sm:px-10">
          <h2 className="text-2xl font-bold">Why Customers Trust Timeless Watch Bazar</h2>
          <p className="mt-4 max-w-2xl text-[var(--silver)]">
            We are committed to providing quality watches, reliable service, and an
            exceptional shopping experience from order placement to doorstep delivery.
          </p>
          <ul className="mt-6 grid gap-2 text-sm text-[var(--silver)] sm:grid-cols-2">
            <li>✓ Quality Checked Products</li>
            <li>✓ Secure Payments</li>
            <li>✓ Fast Processing</li>
            <li>✓ Responsive Support</li>
            <li>✓ New Arrivals Weekly</li>
          </ul>
          <p className="mt-8 text-lg font-semibold text-[var(--gold)]">
            Timeless Watch Bazar
          </p>
          <p className="mt-1 text-[var(--silver)]">
            Smart Style. Better Watches. Everyday Value.
          </p>
        </section>
      </ScrollReveal>
    </div>
  );
}
