import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping Policy">
      <p>
        We process orders quickly and ship across the UAE. Delivery timelines typically
        range from 1–5 business days depending on your location and product availability.
      </p>
      <p>
        Shipping fees, if any, are shown at checkout. You will receive updates once your
        order is dispatched. For international shipping requests, please contact support.
      </p>
    </PolicyPage>
  );
}
