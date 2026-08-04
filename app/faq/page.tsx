import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Timeless Watch Bazar orders, delivery in India, authenticity, payments, and returns.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "Do you sell authentic watches?",
    a: "Yes. Every watch is quality-checked before listing and shipping.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We support common online payment methods and cash on delivery where available.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders in Ujjain and nearby areas arrive within 1–3 business days. Pan-India delivery typically takes 3–7 business days after processing.",
  },
  {
    q: "Can I return a watch?",
    a: "Unused items in original packaging may be returned within 7 days. See our Return Policy.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <PolicyPage title="FAQ">
      <JsonLd data={faqJsonLd} />
      <div className="space-y-6">
        {faqs.map((item) => (
          <div key={item.q}>
            <h2 className="text-lg font-bold text-zinc-950">{item.q}</h2>
            <p className="mt-2">{item.a}</p>
          </div>
        ))}
      </div>
    </PolicyPage>
  );
}
