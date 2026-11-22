import { describe, expect, it } from "vitest";
import { validateApplication, type ApplicationFields } from "./validate";

const ok: ApplicationFields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "",
  link: "",
  why: "I like driveways.",
};
const pdf = { name: "cv.pdf", size: 1000, type: "application/pdf" };

describe("validateApplication", () => {
  it("accepts valid input", () => {
    expect(validateApplication(ok, pdf)).toEqual({});
    expect(validateApplication({ ...ok, phone: "555", link: "https://x.com/a" }, pdf)).toEqual({});
  });
  it("rejects bad name", () => {
    const m = "Enter your name (up to 100 characters).";
    expect(validateApplication({ ...ok, name: "  " }, pdf).name).toBe(m);
    expect(validateApplication({ ...ok, name: "a".repeat(101) }, pdf).name).toBe(m);
  });
  it("rejects bad email", () => {
    expect(validateApplication({ ...ok, email: "nope" }, pdf).email).toBe("Enter a valid email.");
  });
  it("rejects long phone", () => {
    expect(validateApplication({ ...ok, phone: "1".repeat(31) }, pdf).phone).toBe(
      "Keep your phone number under 30 characters.",
    );
  });
  it("rejects bad link", () => {
    const m = "Use a full link that starts with https://.";
    expect(validateApplication({ ...ok, link: "http://x.com" }, pdf).link).toBe(m);
    expect(validateApplication({ ...ok, link: "https://" + "a".repeat(300) }, pdf).link).toBe(m);
  });
  it("rejects bad why", () => {
    const m = "Write a short answer (up to 2,000 characters).";
    expect(validateApplication({ ...ok, why: "" }, pdf).why).toBe(m);
    expect(validateApplication({ ...ok, why: "a".repeat(2001) }, pdf).why).toBe(m);
  });
  it("rejects bad resumes", () => {
    expect(validateApplication(ok, null).resume).toBe("Attach your résumé as a PDF.");
    expect(
      validateApplication(ok, { name: "cv.docx", type: "application/vnd.openxmlformats", size: 10 }).resume,
    ).toBe("Your résumé needs to be a PDF.");
    expect(validateApplication(ok, { ...pdf, size: 5 * 1024 * 1024 + 1 }).resume).toBe(
      "Your résumé needs to be under 5 MB.",
    );
    expect(validateApplication(ok, { ...pdf, size: 5 * 1024 * 1024 }).resume).toBeUndefined();
  });
});
