import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions">
      <p>
        By using Timeless Watch Bazar, you agree to shop in good faith, provide accurate
        order information, and comply with UAE consumer laws where applicable.
      </p>
      <p>
        Product availability and pricing may change without notice. Images are for
        illustration; minor variations can occur. Orders are confirmed after successful
        payment or COD acceptance.
      </p>
      <p>
        Misuse of the website, fraudulent activity, or abuse of promotions may result in
        order cancellation or account restriction.
      </p>
    </PolicyPage>
  );
}
