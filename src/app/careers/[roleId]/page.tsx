import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { C, F } from "../../theme";
import { MailLink } from "../../legal/_components";
import { CAREERS_EMAIL } from "../_lib/config";
import { fetchOpenRole } from "../_lib/api";
import { employmentTypeLabel } from "../_lib/format";
import { CareersShell, bodyText } from "../_components/CareersShell";
import { Description } from "../_components/Description";
import { ApplicationForm } from "../_components/ApplicationForm";

export const revalidate = 300;

type Params = Promise<{ roleId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { roleId } = await params;
  const result = await fetchOpenRole(roleId);
  if (result.status !== "ok") return { title: "Careers | Dryvway" };
  return {
    title: `${result.role.title} | Careers | Dryvway`,
    alternates: { canonical: `/careers/${roleId}` },
  };
}

export default async function RolePage({ params }: { params: Params }) {
  const { roleId } = await params;
  const result = await fetchOpenRole(roleId);
  if (result.status === "not_found") notFound();

  if (result.status === "error") {
    return (
      <CareersShell eyebrow="Careers" title="Careers">
        <p style={bodyText}>
          We couldn&apos;t load open roles. Email <MailLink email={CAREERS_EMAIL} />.
        </p>
      </CareersShell>
    );
  }

  const { role } = result;
  const meta = [employmentTypeLabel(role.employment_type), role.location, role.pay]
    .filter(Boolean)
    .join(" · ");
  return (
    <CareersShell eyebrow="Careers" title={role.title}>
      <p style={{ fontFamily: F.display, fontSize: 15, color: C.stone, margin: "0 0 32px" }}>
        {meta}
      </p>
      <Description text={role.description} />
      <h2
        style={{
          fontFamily: F.display,
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: -0.4,
          margin: "56px 0 24px",
        }}
      >
        Apply
      </h2>
      <ApplicationForm roleId={role.id} roleTitle={role.title} />
    </CareersShell>
  );
}
