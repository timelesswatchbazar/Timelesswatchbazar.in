"use client";

import { FormEvent, useState } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const fieldClass =
    "w-full rounded-md border border-[var(--silver)] px-3 py-2.5 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--gold)_30%,transparent)]";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <ScrollReveal>
        <p className="section-eyebrow">Contact us</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
          Send us a message
        </h1>
      </ScrollReveal>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-10">
        <ScrollReveal delay={1}>
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-md border border-[var(--silver)] bg-white p-4 shadow-sm sm:p-6"
          >
            {submitted ? (
              <p className="rounded-md bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--navy)]">
                Thanks! Your message has been received. We&apos;ll get back to you soon.
              </p>
            ) : null}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--midnight)]" htmlFor="name">
                Name
              </label>
              <input id="name" name="name" required className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--midnight)]" htmlFor="email">
                Email address
              </label>
              <input id="email" name="email" type="email" required className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--midnight)]" htmlFor="phone">
                Contact number
              </label>
              <input id="phone" name="phone" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--midnight)]" htmlFor="message">
                Message
              </label>
              <textarea id="message" name="message" required rows={5} className={fieldClass} />
            </div>
            <button type="submit" className="checkout-submit">
              Submit
            </button>
          </form>
        </ScrollReveal>

        <ScrollReveal delay={2}>
          <p className="section-eyebrow">Contact details</p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--midnight)]">We are here to help</h2>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">Phone / WhatsApp</p>
              <a
                href="tel:+919876543210"
                className="mt-1 block text-lg font-bold text-[var(--gold)] hover:text-[var(--gold-hover)]"
              >
                +91 98765 43210
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">Email</p>
              <p className="mt-1 text-lg font-semibold text-[var(--midnight)]">
                info@timelesswatchbazar.com
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">Working hours</p>
              <p className="mt-1 text-[var(--navy)]">Mon to Sat, 10:00 AM - 7:00 PM</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">Location</p>
              <p className="mt-1 text-[var(--navy)]">Ujjain, Madhya Pradesh, India</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
