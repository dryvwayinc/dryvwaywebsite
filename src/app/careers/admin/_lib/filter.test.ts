import { describe, expect, it } from "vitest";
import type { ApplicationSummary } from "../../_lib/types";
import { filterApplications, isSafeLink } from "./filter";

const mk = (id: string, role_id: string | null, status: ApplicationSummary["status"]): ApplicationSummary => ({
  id,
  role_id,
  role_title: role_id ?? "General interest",
  name: id,
  email: `${id}@x.com`,
  status,
  created_at: "2026-11-01T00:00:00Z",
});

const apps = [mk("a", "r1", "new"), mk("b", "r1", "offer"), mk("c", null, "new"), mk("d", "r2", "new")];

describe("filterApplications", () => {
  it("returns everything for all/all", () => {
    expect(filterApplications(apps, "all", "all")).toHaveLength(4);
  });
  it("filters by role id", () => {
    expect(filterApplications(apps, "r1", "all").map((a) => a.id)).toEqual(["a", "b"]);
  });
  it("filters general interest", () => {
    expect(filterApplications(apps, "general", "all").map((a) => a.id)).toEqual(["c"]);
  });
  it("combines role and status", () => {
    expect(filterApplications(apps, "r1", "offer").map((a) => a.id)).toEqual(["b"]);
    expect(filterApplications(apps, "all", "new")).toHaveLength(3);
  });
});

describe("isSafeLink", () => {
  it("accepts only https", () => {
    expect(isSafeLink("https://a.com")).toBe(true);
    expect(isSafeLink("http://a.com")).toBe(false);
    expect(isSafeLink("javascript:alert(1)")).toBe(false);
    expect(isSafeLink(null)).toBe(false);
  });
});
