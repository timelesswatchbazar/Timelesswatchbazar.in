"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Contact us
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
        Send us a message
      </h1>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-10">
        <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-zinc-200 bg-white p-4 sm:p-6">
          {submitted ? (
            <p className="rounded-md bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-800">
              Thanks! Your message has been received. We&apos;ll get back to you soon.
            </p>
          ) : null}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-800" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-800" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-800" htmlFor="phone">
              Contact number
            </label>
            <input
              id="phone"
              name="phone"
              className="w-full rounded-md border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-800" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full rounded-md border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/20"
            />
          </div>
          <button type="submit" className="checkout-submit">
            Submit
          </button>
        </form>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Contact details
          </p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-950">We are here to help</h2>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm font-semibold text-zinc-500">Phone / WhatsApp</p>
              <a
                href="tel:+971500000000"
                className="mt-1 block text-lg font-bold text-zinc-950 hover:text-zinc-600"
              >
                +971 50 000 0000
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500">Email</p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">
                info@timelesswatchbazar.com
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500">Working hours</p>
              <p className="mt-1 text-zinc-700">Mon to Sat, 10:00 AM - 7:00 PM</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500">Location</p>
              <p className="mt-1 text-zinc-700">Dubai, United Arab Emirates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
