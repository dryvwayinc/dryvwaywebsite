import type { Metadata } from "next";
import { CareersShell } from "../_components/CareersShell";
import { ApplicationForm } from "../_components/ApplicationForm";

export const metadata: Metadata = {
  title: "General interest | Careers | Dryvway",
  alternates: { canonical: "/careers/general" },
};

export default function GeneralInterestPage() {
  return (
    <CareersShell eyebrow="Careers" title="General interest">
      <ApplicationForm roleId={null} roleTitle={null} />
    </CareersShell>
  );
}
