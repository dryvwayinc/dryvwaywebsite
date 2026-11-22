import { API_BASE, CAREERS_EMAIL } from "./config";
import type { PublicRole } from "./types";

const TIMEOUT_MS = 10000;

export async function fetchOpenRoles(): Promise<PublicRole[] | null> {
  try {
    const res = await fetch(`${API_BASE}/careers/roles`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status !== 200) return null;
    const body = await res.json();
    return (body?.data?.roles as PublicRole[]) ?? null;
  } catch {
    return null;
  }
}

export type OpenRoleResult =
  | { status: "ok"; role: PublicRole }
  | { status: "not_found" }
  | { status: "error" };

export async function fetchOpenRole(id: string): Promise<OpenRoleResult> {
  try {
    const res = await fetch(`${API_BASE}/careers/roles/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 404) return { status: "not_found" };
    if (res.status !== 200) return { status: "error" };
    const body = await res.json();
    const role = body?.data?.role as PublicRole | undefined;
    return role ? { status: "ok", role } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: "rate_limited" | "invalid" | "error"; message: string };

const GENERIC_ERROR = `Something went wrong. Try again, or email ${CAREERS_EMAIL}.`;

export async function submitApplication(form: FormData): Promise<SubmitResult> {
  try {
    const res = await fetch(`${API_BASE}/careers/applications`, {
      method: "POST",
      body: form,
    });
    if (res.status === 201) return { ok: true };
    if (res.status === 429) {
      return {
        ok: false,
        kind: "rate_limited",
        message: "Too many applications from this connection. Try again in an hour.",
      };
    }
    if (res.status === 400) {
      const body = await res.json().catch(() => null);
      const detail = typeof body?.detail === "string" ? body.detail : null;
      if (detail) return { ok: false, kind: "invalid", message: detail };
    }
    return { ok: false, kind: "error", message: GENERIC_ERROR };
  } catch {
    return { ok: false, kind: "error", message: GENERIC_ERROR };
  }
}
