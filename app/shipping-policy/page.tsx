import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Shipping and delivery timelines for Timeless Watch Bazar orders across India.",
  alternates: { canonical: "/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping Policy">
      <p>
        We process orders quickly and ship across India. Local/nearby delivery typically
        takes 1–3 business days. Pan-India delivery usually takes 3–7 business days
        depending on your location and product availability.
      </p>
      <p>
        Shipping fees, if any, are shown at checkout. You will receive updates once your
        order is dispatched. For special delivery requests, please contact support.
      </p>
    </PolicyPage>
  );
}
