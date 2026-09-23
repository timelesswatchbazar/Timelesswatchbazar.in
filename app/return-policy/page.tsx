import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Return & Exchange Policy",
  description:
    "Timeless Watch Bazar follows a strict no return and no exchange policy on all watch purchases.",
  alternates: { canonical: "/return-policy" },
};

export default function ReturnPolicyPage() {
  return (
    <PolicyPage title="Return & Exchange Policy">
      <p>
        <strong>All sales are final.</strong> Timeless Watch Bazar follows a strict{" "}
        <strong>no return and no exchange</strong> policy on every product sold through
        our website, WhatsApp, or any other sales channel.
      </p>
      <p>
        Once an order is confirmed and payment is completed, we do not accept returns,
        exchanges, replacements, or cancellations for change of mind, wrong size preference,
        color preference, or any similar reason.
      </p>
      <p>
        Please review product images, description, price, and options carefully before you
        place an order. If you need help choosing a watch, contact us on WhatsApp or email
        before confirming your purchase.
      </p>
      <p>
        This policy applies to all customers across India. By placing an order with
        Timeless Watch Bazar, you acknowledge and agree to this no return / no exchange
        policy.
      </p>
    </PolicyPage>
  );
}
