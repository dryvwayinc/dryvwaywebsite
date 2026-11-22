import { API_BASE } from "../../_lib/config";
import type {
  AdminRole,
  ApplicationDetail,
  ApplicationStatus,
  ApplicationSummary,
  RoleInput,
} from "../../_lib/types";

export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

const BASE = `${API_BASE}/careers/admin`;
const TIMEOUT_MS = 20000;

export function createAdminApi(getToken: () => Promise<string>) {
  async function raw(path: string, init: RequestInit = {}): Promise<Response> {
    const token = await getToken();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    let res: Response;
    try {
      res = await fetch(`${BASE}${path}`, {
        ...init,
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new AdminApiError(0, "We couldn't reach the server. Try again.");
    }
    if (!res.ok) {
      let detail = "Something went wrong. Try again.";
      try {
        const body = await res.json();
        if (typeof body?.detail === "string") detail = body.detail;
      } catch {
        // keep generic message
      }
      throw new AdminApiError(res.status, detail);
    }
    return res;
  }

  async function json<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body) headers.set("Content-Type", "application/json");
    const res = await raw(path, { ...init, headers });
    const body = await res.json();
    return body.data as T;
  }

  const send = (method: string, body: unknown): RequestInit => ({
    method,
    body: JSON.stringify(body),
  });

  return {
    async me(): Promise<string> {
      return (await json<{ email: string }>("/me")).email;
    },
    async listRoles(): Promise<AdminRole[]> {
      return (await json<{ roles: AdminRole[] }>("/roles")).roles;
    },
    async createRole(input: RoleInput): Promise<AdminRole> {
      return (await json<{ role: AdminRole }>("/roles", send("POST", input))).role;
    },
    async updateRole(id: string, patch: Partial<RoleInput>): Promise<AdminRole> {
      return (
        await json<{ role: AdminRole }>(`/roles/${encodeURIComponent(id)}`, send("PATCH", patch))
      ).role;
    },
    async listApplications(): Promise<ApplicationSummary[]> {
      return (await json<{ applications: ApplicationSummary[] }>("/applications")).applications;
    },
    async getApplication(id: string): Promise<ApplicationDetail> {
      return (
        await json<{ application: ApplicationDetail }>(`/applications/${encodeURIComponent(id)}`)
      ).application;
    },
    async setStatus(id: string, status: ApplicationStatus): Promise<ApplicationDetail> {
      return (
        await json<{ application: ApplicationDetail }>(
          `/applications/${encodeURIComponent(id)}`,
          send("PATCH", { status }),
        )
      ).application;
    },
    async addNote(id: string, text: string): Promise<ApplicationDetail> {
      return (
        await json<{ application: ApplicationDetail }>(
          `/applications/${encodeURIComponent(id)}/notes`,
          send("POST", { text }),
        )
      ).application;
    },
    async openResume(id: string): Promise<void> {
      // Open the tab synchronously so popup blockers allow it.
      const win = window.open("", "_blank");
      try {
        const res = await raw(`/applications/${encodeURIComponent(id)}/resume`);
        const blob = await res.blob();
        const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        if (win) {
          win.location.href = url;
        } else {
          window.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } catch (e) {
        win?.close();
        throw e;
      }
    },
    async deleteApplication(id: string): Promise<void> {
      await json<{ deleted: boolean }>(`/applications/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  };
}

export type AdminApi = ReturnType<typeof createAdminApi>;
