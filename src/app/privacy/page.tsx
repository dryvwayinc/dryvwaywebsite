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
  title: "Privacy Policy — Dryvway",
  description:
    "How Dryvway collects, uses, shares, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" effectiveDate="Effective May 29, 2026">
      <LegalSection num="01" title="Information we collect">
        <P>We collect information that you provide directly to us, including:</P>
        <BulletList
          items={[
            "Account information (name, email, phone number)",
            "Location data when you use our services",
            "Payment information for transactions",
            "Parking spot listings and booking information",
            "Communications with other users through our platform",
          ]}
        />
      </LegalSection>

      <LegalSection num="02" title="How we use your information">
        <P>We use the information we collect to:</P>
        <BulletList
          items={[
            "Provide, maintain, and improve our services",
            "Process transactions and send related information",
            "Send you technical notices and support messages",
            "Respond to your comments and questions",
            "Detect, prevent, and address fraud and security issues",
          ]}
        />
      </LegalSection>

      <LegalSection num="03" title="Information sharing">
        <P>We do not sell your personal information. We may share your information:</P>
        <BulletList
          items={[
            "With other users as necessary to provide our services (e.g., sharing your contact info with spot owners when you book)",
            "With service providers who assist our operations",
            "When required by law, or to protect the rights and safety of our users",
            "In connection with a merger, sale, or acquisition",
          ]}
        />
      </LegalSection>

      <LegalSection num="04" title="Data security">
        <P>
          We implement appropriate technical and organizational measures to protect your
          personal information against unauthorized access, alteration, disclosure, or
          destruction. However, no internet transmission is completely secure, and we
          cannot guarantee absolute security.
        </P>
      </LegalSection>

      <LegalSection num="05" title="Your rights">
        <P>You have the right to:</P>
        <BulletList
          items={[
            "Access and update your personal information",
            "Delete your account and associated data",
            "Opt out of marketing communications",
            "Request a copy of your data",
            "Restrict processing of your information",
          ]}
        />
      </LegalSection>

      <LegalSection num="06" title="Location data">
        <P>
          Our app uses location services to help you find nearby parking spots and to
          enable location-based features. You can control location permissions through your
          device settings. Disabling location services may limit functionality.
        </P>
      </LegalSection>

      <LegalSection num="07" title="Third-party services">
        <P>We use third-party services including:</P>
        <BulletList
          items={[
            "Firebase (Google) for authentication and data storage",
            "Stripe for payment processing",
            "MapKit / Google Maps for location services",
          ]}
        />
        <P>
          These services have their own privacy policies governing their use of
          information.
        </P>
      </LegalSection>

      <LegalSection num="08" title="Children's privacy">
        <P>
          Our service is not intended for users under 18 years of age. We do not knowingly
          collect information from children under 18.
        </P>
      </LegalSection>

      <LegalSection num="09" title="Changes to this policy">
        <P>
          We may update this privacy policy from time to time. We will notify you of any
          changes by posting the new policy on this page and updating the effective date.
        </P>
      </LegalSection>

      <LegalSection num="10" title="Contact us">
        <P>If you have questions about this privacy policy, please contact us at:</P>
        <Contact>
          <BulletList
            items={[
              <>Email: <MailLink email="support@dryvwayinc.com" /></>,
              <>Website: www.dryvwayinc.com</>,
            ]}
          />
        </Contact>
        <P>Dryvway — All Rights Reserved © 2026</P>
      </LegalSection>
    </LegalShell>
  );
}
