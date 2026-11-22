import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOpenRole, fetchOpenRoles, submitApplication } from "./api";

const role = {
  id: "r1", title: "Ops", employment_type: "full_time", location: "SF",
  pay: null, description: "d", updated_at: "2026-11-21T00:00:00Z",
};

function stub(impl: () => Promise<unknown>) {
  const f = vi.fn(impl);
  vi.stubGlobal("fetch", f);
  return f;
}
const res = (status: number, body: unknown = {}) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

afterEach(() => vi.unstubAllGlobals());

describe("fetchOpenRoles", () => {
  it("returns roles on 200", async () => {
    const f = stub(() => res(200, { success: true, data: { roles: [role] } }));
    expect(await fetchOpenRoles()).toEqual([role]);
    const [url, init] = f.mock.calls[0] as unknown as [string, { next: { revalidate: number } }];
    expect(url).toMatch(/\/careers\/roles$/);
    expect(init.next.revalidate).toBe(300);
  });
  it("returns null when fetch rejects", async () => {
    stub(() => Promise.reject(new Error("timeout")));
    expect(await fetchOpenRoles()).toBeNull();
  });
  it("returns null on 503", async () => {
    stub(() => res(503));
    expect(await fetchOpenRoles()).toBeNull();
  });
});

describe("fetchOpenRole", () => {
  it("maps 200, 404 and errors", async () => {
    stub(() => res(200, { data: { role } }));
    expect(await fetchOpenRole("r1")).toEqual({ status: "ok", role });
    stub(() => res(404));
    expect(await fetchOpenRole("r1")).toEqual({ status: "not_found" });
    stub(() => res(500));
    expect(await fetchOpenRole("r1")).toEqual({ status: "error" });
    stub(() => Promise.reject(new Error("x")));
    expect(await fetchOpenRole("r1")).toEqual({ status: "error" });
  });
});

describe("submitApplication", () => {
  it("maps 201", async () => {
    stub(() => res(201, { data: { application_id: "a" } }));
    expect(await submitApplication(new FormData())).toEqual({ ok: true });
  });
  it("maps 429", async () => {
    stub(() => res(429));
    expect(await submitApplication(new FormData())).toEqual({
      ok: false, kind: "rate_limited",
      message: "Too many applications from this connection. Try again in an hour.",
    });
  });
  it("keeps the 400 detail sentence", async () => {
    stub(() => res(400, { detail: "This role is no longer open." }));
    expect(await submitApplication(new FormData())).toEqual({
      ok: false, kind: "invalid", message: "This role is no longer open.",
    });
  });
  it("maps 500 and network failure", async () => {
    const message = "Something went wrong. Try again, or email founders@dryvwayinc.com.";
    stub(() => res(500));
    expect(await submitApplication(new FormData())).toEqual({ ok: false, kind: "error", message });
    stub(() => Promise.reject(new Error("x")));
    expect(await submitApplication(new FormData())).toEqual({ ok: false, kind: "error", message });
  });
});
