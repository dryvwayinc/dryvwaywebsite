import type { Metadata } from "next";
import Link from "next/link";
import { C, F } from "../theme";
import { MailLink } from "../legal/_components";
import { CAREERS_EMAIL } from "./_lib/config";
import { fetchOpenRoles } from "./_lib/api";
import { CareersShell, bodyText } from "./_components/CareersShell";
import { RoleCard } from "./_components/RoleCard";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Careers | Dryvway",
  description: "Open roles at Dryvway.",
  alternates: { canonical: "/careers" },
};

export default async function CareersPage() {
  const roles = await fetchOpenRoles();
  return (
    <CareersShell eyebrow="Careers" title="Work on Dryvway">
      <p style={bodyText}>
        We&apos;re a small team building a better way to park in the Bay Area. Hosts earn from
        driveways they already have, and drivers stop circling. If that sounds like work you&apos;d
        enjoy, take a look below.
      </p>

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
        {roles === null ? (
          <p style={bodyText}>
            We couldn&apos;t load open roles. Email <MailLink email={CAREERS_EMAIL} />.
          </p>
        ) : roles.length === 0 ? (
          <p style={bodyText}>We&apos;re not hiring for a specific role right now.</p>
        ) : (
          roles.map((r) => <RoleCard key={r.id} role={r} />)
        )}
      </div>

      <div
        style={{
          marginTop: 48,
          padding: "20px 24px",
          borderRadius: 16,
          background: C.warmSoftest,
          border: `1px solid ${C.stoneLineSoft}`,
        }}
      >
        <h2
          style={{
            fontFamily: F.display,
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: -0.3,
            margin: "0 0 8px",
          }}
        >
          Don&apos;t see a fit?
        </h2>
        <p style={bodyText}>
          <Link
            href="/careers/general"
            style={{ color: C.amberDeep, textDecoration: "none", fontWeight: 500 }}
          >
            Tell us what you&apos;d like to work on.
          </Link>
        </p>
      </div>
    </CareersShell>
  );
}
