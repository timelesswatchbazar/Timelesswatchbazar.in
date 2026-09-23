import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for shopping at Timeless Watch Bazar in India.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions">
      <p>
        By using Timeless Watch Bazar, you agree to shop in good faith, provide accurate
        order information, and comply with applicable Indian consumer laws.
      </p>
      <p>
        Product availability and pricing may change without notice. Images are for
        illustration; minor variations can occur. Orders are confirmed after successful
        payment as shared during WhatsApp ordering.
      </p>
      <p>
        All purchases are subject to our{" "}
        <a href="/return-policy" className="font-semibold text-zinc-950 underline">
          no return and no exchange policy
        </a>
        . Sales are final once an order is confirmed.
      </p>
      <p>
        Misuse of the website, fraudulent activity, or abuse of promotions may result in
        order cancellation or account restriction.
      </p>
    </PolicyPage>
  );
}
