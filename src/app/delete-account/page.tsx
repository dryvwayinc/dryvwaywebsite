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
  title: "Delete Your Account — Dryvway",
  description:
    "How to request deletion of your Dryvway account and associated data, what gets deleted, and what we retain.",
  alternates: { canonical: "/delete-account" },
};

// Public account-deletion page. Google Play requires a URL on the store
// listing that names the app, gives the steps to request deletion, and
// states what data is deleted vs. retained — viewable without signing in.
export default function DeleteAccountPage() {
  return (
    <LegalShell title="Delete Your Account" effectiveDate="Updated July 15, 2026">
      <P>
        This page explains how to request deletion of your <strong>Dryvway</strong> account
        and associated data. It applies to accounts created in the Dryvway mobile apps
        (published on Google Play and the App Store by Dryvway, Inc.) and on the Dryvway
        web app.
      </P>

      <LegalSection num="01" title="How to request deletion">
        <P>To permanently delete your account and associated data:</P>
        <BulletList
          items={[
            <>
              Send an email to <MailLink email="support@dryvwayinc.com" /> with the
              subject line <strong>“Account deletion request”</strong>.
            </>,
            "Send it from the email address associated with your Dryvway account, and include that email address in the message so we can verify it's you.",
            "If you have upcoming bookings or active listings, mention whether you want them cancelled immediately (otherwise we will cancel them as part of the deletion).",
          ]}
        />
        <P>
          You can also start this request from inside the app: go to{" "}
          <strong>Profile → Account Settings → Delete Account</strong>, which opens a
          pre-filled deletion request email for you.
        </P>
        <P>
          We will confirm your request by email and complete the deletion within{" "}
          <strong>30 days</strong>.
        </P>
      </LegalSection>

      <LegalSection num="02" title="What gets deleted">
        <P>When your deletion request is processed, we permanently delete:</P>
        <BulletList
          items={[
            "Your account and profile information (name, email address, phone number, profile photo)",
            "Your driveway listings, including photos and descriptions",
            "Your booking history and saved locations",
            "Your messages and communications with other users on the platform",
            "Your notification preferences and device push-notification tokens",
            "Your two-factor authentication enrollment",
          ]}
        />
      </LegalSection>

      <LegalSection num="03" title="What we keep, and for how long">
        <P>
          Some records are retained after account deletion, only for as long as we are
          required to keep them:
        </P>
        <BulletList
          items={[
            "Payment and payout transaction records (processed by Stripe) — retained for up to 7 years to comply with tax, accounting, and financial regulations",
            "Records reasonably needed to resolve open disputes, chargebacks, or refunds, and to prevent fraud — retained until the matter is closed",
            "A record of your deletion request itself, so we can show the request was honored",
            "Aggregated or anonymized data that can no longer be linked to you",
          ]}
        />
        <P>
          Retained records are removed once their retention period ends. Nothing we keep
          is used for marketing after your account is deleted.
        </P>
      </LegalSection>

      <LegalSection num="04" title="Questions">
        <Contact>
          <>
            If you have questions about deletion or want to delete specific data (for
            example, a single listing) without closing your account, contact us at{" "}
            <MailLink email="support@dryvwayinc.com" />.
          </>
        </Contact>
      </LegalSection>
    </LegalShell>
  );
}
