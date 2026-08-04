import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Timeless Watch Bazar collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>
        Timeless Watch Bazar respects your privacy. We collect only the information
        needed to process orders, provide customer support, and improve your shopping
        experience.
      </p>
      <p>
        Personal data such as name, email, phone number, and shipping address is used
        solely for order fulfillment and communication. We do not sell your personal
        information to third parties.
      </p>
      <p>
        Payment details are processed through secure payment providers. For questions
        about this policy, contact info@timelesswatchbazar.com.
      </p>
    </PolicyPage>
  );
}
