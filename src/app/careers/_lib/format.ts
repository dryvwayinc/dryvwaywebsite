import type { ApplicationStatus, EmploymentType } from "./types";

export type DescriptionBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export function parseDescription(text: string): DescriptionBlock[] {
  return text
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    )
    .filter((lines) => lines.length > 0)
    .map((lines): DescriptionBlock => {
      if (lines.every((l) => l.startsWith("- "))) {
        return { kind: "ul", items: lines.map((l) => l.slice(2).trim()) };
      }
      return { kind: "p", text: lines.join(" ") };
    });
}

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  internship: "Internship",
  contract: "Contract",
};

export function employmentTypeLabel(t: EmploymentType): string {
  return EMPLOYMENT_LABELS[t];
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/Los_Angeles",
  });
}
