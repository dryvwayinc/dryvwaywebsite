import { describe, expect, it } from "vitest";
import { employmentTypeLabel, formatShortDate, parseDescription, STATUS_LABELS } from "./format";

describe("parseDescription", () => {
  it("splits paragraphs and bullet lists", () => {
    expect(parseDescription("Intro line\nsame para\n\n- one\n- two\n\nOutro")).toEqual([
      { kind: "p", text: "Intro line same para" },
      { kind: "ul", items: ["one", "two"] },
      { kind: "p", text: "Outro" },
    ]);
  });
  it("returns [] for empty text", () => {
    expect(parseDescription("")).toEqual([]);
  });
  it("treats mixed blocks as a paragraph", () => {
    expect(parseDescription("- a\nb")).toEqual([{ kind: "p", text: "- a b" }]);
  });
});

describe("labels", () => {
  it("labels employment types", () => {
    expect(employmentTypeLabel("full_time")).toBe("Full-time");
    expect(employmentTypeLabel("part_time")).toBe("Part-time");
    expect(employmentTypeLabel("internship")).toBe("Internship");
    expect(employmentTypeLabel("contract")).toBe("Contract");
  });
  it("labels statuses", () => {
    expect(STATUS_LABELS).toEqual({
      new: "New",
      reviewing: "Reviewing",
      interview: "Interview",
      offer: "Offer",
      rejected: "Rejected",
    });
  });
});

describe("formatShortDate", () => {
  it("uses Pacific time", () => {
    expect(formatShortDate("2026-11-22T06:00:00+00:00")).toBe("Nov 21");
  });
});
