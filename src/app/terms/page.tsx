import type { Metadata } from "next";
import {
  LegalShell,
  LegalSection,
  BulletList,
  P,
  Contact,
  MailLink,
} from "../legal/_components";

export const metadata: Metadata = {
  title: "Terms of Service — Dryvway",
  description:
    "The terms governing your use of Dryvway, the marketplace connecting drivers with people who rent out parking spaces.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" effectiveDate="Effective May 29, 2026">
      <LegalSection num="01" title="Acceptance of terms">
        <P>
          By accessing and using Dryvway (“the App”), you accept and agree to be bound by
          these Terms of Service. If you do not agree to these terms, please do not use our
          service.
        </P>
      </LegalSection>

      <LegalSection num="02" title="Description of service">
        <P>
          Dryvway is a platform that connects people looking for parking spaces (“Finders”)
          with people who have parking spaces available to rent (“Renters”). We facilitate
          the transaction but are not a party to the parking agreement between users.
        </P>
      </LegalSection>

      <LegalSection num="03" title="User accounts">
        <P>To use our service, you must:</P>
        <BulletList
          items={[
            "Be at least 18 years old",
            "Provide accurate registration information",
            "Maintain the security of your account credentials",
            "Be responsible for all activity under your account",
            "Notify us immediately of any unauthorized access",
          ]}
        />
      </LegalSection>

      <LegalSection num="04" title="For Renters (listing parking spots)">
        <P>When listing a parking spot, you agree to:</P>
        <BulletList
          items={[
            "Own or have legal authority to rent the parking space",
            "Provide accurate information about the spot",
            "Honor confirmed bookings and provide the parking space in the described condition",
            "Comply with all applicable laws and regulations",
            "Not discriminate against users",
          ]}
        />
      </LegalSection>

      <LegalSection num="05" title="For Rentees (booking parking spots)">
        <P>When booking a parking spot, you agree to:</P>
        <BulletList
          items={[
            "Use the parking space only during the booked time",
            "Pay all applicable fees",
            "Follow any rules specified by the Renter",
            "Not sublet or transfer the parking space",
            "Leave the space in the same condition as found",
            "Report any issues promptly",
          ]}
        />
      </LegalSection>

      <LegalSection num="06" title="Payments and fees">
        <BulletList
          items={[
            "All payments are processed securely through Stripe",
            "Dryvway charges a service fee on each transaction",
            "Finders pay the full amount upfront",
            "Renters receive payment after booking completion",
            "Refunds are subject to our cancellation policy",
            "You are responsible for any applicable taxes",
          ]}
        />
      </LegalSection>

      <LegalSection num="07" title="Cancellation policy">
        <BulletList
          items={[
            "Finders may cancel bookings according to the timeline set by the Renter",
            "Late cancellations may result in reduced refunds",
            "Renters who cancel confirmed bookings may face penalties",
            "Repeated cancellations may result in account penalties",
          ]}
        />
      </LegalSection>

      <LegalSection num="08" title="Prohibited conduct">
        <P>You may not:</P>
        <BulletList
          items={[
            "Violate any laws or regulations",
            "Infringe on others’ intellectual property rights",
            "Transmit harmful code or viruses",
            "Harass, abuse, or harm other users",
            "Provide false or misleading information",
            "Attempt to circumvent our fee structure",
            "Use the service for illegal parking or activities",
          ]}
        />
      </LegalSection>

      <LegalSection num="09" title="Liability and disclaimers">
        <BulletList
          items={[
            "Dryvway is provided “as is” without warranties",
            "We do not guarantee the availability, quality, or safety of parking spots",
            "Users interact at their own risk",
            "We are not liable for disputes between users",
            "We are not responsible for property damage or theft",
            "Our liability is limited to the fees paid for the service",
          ]}
        />
      </LegalSection>

      <LegalSection num="10" title="Insurance and indemnification">
        <P>You agree to:</P>
        <BulletList
          items={[
            "Maintain appropriate insurance (auto, property, liability)",
            "Indemnify Dryvway from claims arising from your use",
            "Release Dryvway from liability for user-to-user issues",
          ]}
        />
      </LegalSection>

      <LegalSection num="11" title="Intellectual property">
        <BulletList
          items={[
            "All content, trademarks, and intellectual property belong to Dryvway. You may not copy, modify, or distribute our content without permission",
            "You grant us a license to use content you submit (photos, reviews, etc.)",
          ]}
        />
      </LegalSection>

      <LegalSection num="12" title="Privacy">
        <P>
          Your use of Dryvway is also governed by our Privacy Policy, which describes how we
          collect, use, store, and disclose your personal information. By using the service,
          you consent to the data practices described in the Privacy Policy. We implement
          reasonable safeguards to protect your information but cannot guarantee absolute
          security.
        </P>
      </LegalSection>

      <LegalSection num="13" title="Termination">
        <P>We may suspend or terminate your account if you:</P>
        <BulletList
          items={[
            "Violate these terms",
            "Engage in fraudulent activity",
            "Repeatedly cancel confirmed bookings",
            "Receive multiple complaints from other users",
          ]}
        />
        <P>
          You may close your account at any time. Provisions relating to liability,
          indemnification, intellectual property, and dispute resolution survive
          termination.
        </P>
      </LegalSection>

      <LegalSection num="14" title="Dispute resolution">
        <BulletList
          items={[
            "Any disputes will first be addressed through our support system",
            "If unresolved, disputes shall be settled by binding arbitration",
            "You waive the right to participate in class actions",
            "Arbitration will be conducted according to AAA rules",
          ]}
        />
      </LegalSection>

      <LegalSection num="15" title="Disclaimer of warranties">
        <P>
          To the fullest extent permitted by law, the service is provided without warranties
          of any kind, whether express or implied, including but not limited to implied
          warranties of merchantability, fitness for a particular purpose, and
          non-infringement. We do not warrant that the service will be uninterrupted,
          secure, or error-free.
        </P>
      </LegalSection>

      <LegalSection num="16" title="Limitation of liability">
        <P>
          To the maximum extent permitted by law, in no event shall Dryvway, its affiliates,
          officers, employees, or agents be liable for any indirect, incidental, special,
          consequential, or punitive damages arising out of or related to your use of the
          service. Our total aggregate liability shall not exceed the amount of fees you
          paid to us in the twelve months preceding the claim.
        </P>
      </LegalSection>

      <LegalSection num="17" title="Modifications to terms">
        <P>
          We reserve the right to modify these terms at any time. Continued use of the
          service after changes constitutes acceptance of new terms. Where required by law,
          we will provide notice of material changes.
        </P>
      </LegalSection>

      <LegalSection num="18" title="Severability">
        <P>
          If any provision of these terms is found to be invalid, illegal, or
          unenforceable, the remaining provisions shall continue in full force and effect,
          and the invalid provision shall be modified to the minimum extent necessary to
          make it enforceable.
        </P>
      </LegalSection>

      <LegalSection num="19" title="Entire agreement">
        <P>
          These terms, together with our Privacy Policy and any other policies referenced
          herein, constitute the entire agreement between you and Dryvway regarding the use
          of the service and supersede any prior agreements.
        </P>
      </LegalSection>

      <LegalSection num="20" title="Governing law">
        <P>
          These terms are governed by the laws of the United States and the state in which
          Dryvway is registered, without regard to conflict of law principles.
        </P>
      </LegalSection>

      <LegalSection num="21" title="Contact information">
        <P>For questions about these terms, contact us at:</P>
        <Contact>
          <BulletList
            items={[
              <>Email: <MailLink email="legal@dryvwayinc.com" /></>,
              <>Support: <MailLink email="support@dryvwayinc.com" /></>,
              <>Website: www.dryvwayinc.com</>,
            ]}
          />
        </Contact>
        <P>Dryvway — All Rights Reserved © 2026</P>
      </LegalSection>
    </LegalShell>
  );
}
