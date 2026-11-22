import type { ApplicationStatus, ApplicationSummary } from "../../_lib/types";

export const GENERAL_ROLE = "general";

export function filterApplications(
  apps: ApplicationSummary[],
  role: string,
  status: ApplicationStatus | "all",
): ApplicationSummary[] {
  return apps.filter((a) => {
    if (role === GENERAL_ROLE) {
      if (a.role_id !== null) return false;
    } else if (role !== "all" && a.role_id !== role) {
      return false;
    }
    return status === "all" || a.status === status;
  });
}

export function isSafeLink(link: string | null): link is string {
  return !!link && link.startsWith("https://");
}
