import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = { title: "Return Policy" };

export default function ReturnPolicyPage() {
  return (
    <PolicyPage title="Return Policy">
      <p>
        We want you to love your watch. Eligible unused items may be returned within 7
        days of delivery in original packaging with all accessories and tags.
      </p>
      <p>
        Personalized items, used products, and items with signs of wear may not be
        eligible for return. Please contact us before sending anything back so we can
        guide you through the process.
      </p>
      <p>
        Approved returns are refunded to the original payment method after inspection.
      </p>
    </PolicyPage>
  );
}
