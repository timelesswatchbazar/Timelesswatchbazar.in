import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Timeless Watch Bazar — your destination for quality watches at amazing prices.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:text-sm">
        Welcome to Timeless Watch Bazar
      </p>
      <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
        Discover Timeless Watches At Amazing Prices
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600 sm:mt-6 sm:text-lg sm:leading-8">
        Timeless Watch Bazar is your trusted destination for elegant, practical, and
        trending watches that elevate everyday style. From classic dress watches and
        luxury automatics to smart wearables and sports divers, we carefully select
        pieces that offer quality, value, and lasting craftsmanship.
      </p>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-zinc-950">Who We Are</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
          At Timeless Watch Bazar, we are passionate about helping customers discover
          watches that match their lifestyle. We continuously research market trends
          and customer needs to bring you timepieces that are stylish, reliable, and
          in demand.
        </p>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
          Our goal is to provide a reliable and enjoyable shopping experience, offering
          carefully selected watches backed by excellent customer service, secure
          shopping, and competitive prices.
        </p>
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-zinc-200 p-6">
          <h3 className="text-lg font-bold text-zinc-950">Our Mission</h3>
          <p className="mt-3 leading-7 text-zinc-600">
            To make online watch shopping simple, affordable, and enjoyable by providing
            quality timepieces, exceptional customer support, and a seamless shopping
            experience for every customer.
          </p>
        </div>
        <div className="rounded-md border border-zinc-200 p-6">
          <h3 className="text-lg font-bold text-zinc-950">Our Vision</h3>
          <p className="mt-3 leading-7 text-zinc-600">
            To become a trusted global destination for watches recognized for quality,
            style, customer satisfaction, and value-driven shopping.
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["100%", "Secure Shopping"],
          ["24/7", "Customer Support"],
          ["Fast", "Order Processing"],
          ["New", "Watches Added Regularly"],
        ].map(([stat, label]) => (
          <div
            key={label}
            className="rounded-md border border-zinc-200 bg-zinc-50 p-5 text-center"
          >
            <p className="text-2xl font-extrabold text-zinc-950">{stat}</p>
            <p className="mt-1 text-sm font-medium text-zinc-700">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-zinc-950">Why Shop With Us?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Trending Watches", "Discover the latest and most popular watches from around the world."],
            ["Best Value", "Competitive pricing with excellent value for every purchase."],
            ["Secure Shopping", "Safe and secure transactions for complete peace of mind."],
            ["Customer Support", "Dedicated support whenever you need assistance."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-md border border-zinc-200 p-5">
              <h3 className="font-bold text-zinc-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-md bg-zinc-950 px-6 py-10 text-white sm:px-10">
        <h2 className="text-2xl font-bold">Why Customers Trust Timeless Watch Bazar</h2>
        <p className="mt-4 max-w-2xl text-zinc-300">
          We are committed to providing quality watches, reliable service, and an
          exceptional shopping experience from order placement to doorstep delivery.
        </p>
        <ul className="mt-6 grid gap-2 text-sm text-zinc-200 sm:grid-cols-2">
          <li>✓ Quality Checked Products</li>
          <li>✓ Secure Payments</li>
          <li>✓ Fast Processing</li>
          <li>✓ Responsive Support</li>
          <li>✓ New Arrivals Weekly</li>
        </ul>
        <p className="mt-8 text-lg font-semibold text-white">
          Timeless Watch Bazar
        </p>
        <p className="mt-1 text-zinc-300">
          Smart Style. Better Watches. Everyday Value.
        </p>
      </section>
    </div>
  );
}
