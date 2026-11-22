"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { C, F } from "../../theme";
import { LIMITS } from "../_lib/config";
import { submitApplication } from "../_lib/api";
import { validateApplication, type FieldErrors } from "../_lib/validate";

const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: F.display,
  fontWeight: 500,
  fontSize: 14,
  color: C.slate,
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: F.display,
  fontSize: 16,
  color: C.slate,
  background: C.paper,
  border: `1px solid ${C.stoneSoft}`,
  borderRadius: 10,
  padding: "12px 14px",
};

const errorStyle: CSSProperties = {
  fontFamily: F.display,
  fontSize: 14,
  color: "#b3261e",
  margin: "6px 0 0",
};

const hidden: CSSProperties = {
  position: "absolute",
  left: -10000,
  top: "auto",
  width: 1,
  height: 1,
  overflow: "hidden",
};

export function ApplicationForm({
  roleId,
  roleTitle,
}: {
  roleId: string | null;
  roleTitle: string | null;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ first: string; email: string } | null>(null);
  const [whyLen, setWhyLen] = useState(0);

  const doneRef = useRef<HTMLDivElement>(null);
  const submitErrorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (submitError) submitErrorRef.current?.focus();
  }, [submitError]);

  const whyLabel = roleId ? "Why Dryvway?" : "What would you like to work on?";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const str = (k: string) => String(data.get(k) ?? "");
    const fields = {
      name: str("name"),
      email: str("email"),
      phone: str("phone"),
      link: str("link"),
      why: str("why"),
    };
    const entry = data.get("resume");
    const file = entry instanceof File && entry.size > 0 ? entry : null;
    const found = validateApplication(
      fields,
      file ? { name: file.name, size: file.size, type: file.type } : null,
    );
    setErrors(found);
    setSubmitError(null);
    if (Object.keys(found).length > 0) {
      const order = ["name", "email", "phone", "link", "why", "resume"] as const;
      const firstInvalid = order.find((k) => found[k]);
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return;
    }

    const body = new FormData();
    body.set("role_id", roleId ?? "");
    body.set("name", fields.name.trim());
    body.set("email", fields.email.trim());
    body.set("phone", fields.phone.trim());
    body.set("link", fields.link.trim());
    body.set("why", fields.why.trim());
    body.set("hp_field", str("hp_field"));
    if (file) body.set("resume", file);

    setSubmitting(true);
    const result = await submitApplication(body);
    setSubmitting(false);
    if (result.ok) {
      setDone({ first: fields.name.trim().split(/\s+/)[0], email: fields.email.trim() });
    } else {
      setSubmitError(result.message);
    }
  }

  if (done) {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        style={{
          fontFamily: F.display,
          fontSize: 18,
          lineHeight: 1.6,
          color: C.slate,
          padding: "20px 24px",
          borderRadius: 16,
          background: C.warmSoftest,
          border: `1px solid ${C.stoneLine}`,
          overflowWrap: "anywhere",
        }}
      >
        Thanks, {done.first}. We got your application. If it&apos;s a fit, we&apos;ll reach out by email.
      </div>
    );
  }

  const field = (
    id: keyof FieldErrors & string,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        style={inputStyle}
        aria-invalid={errors[id] ? true : undefined}
        aria-describedby={errors[id] ? `${id}-error` : undefined}
        {...props}
      />
      {errors[id] && (
        <p id={`${id}-error`} style={errorStyle}>
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}
      aria-label={roleTitle ? `Apply for ${roleTitle}` : "General interest application"}
    >
      {field("name", "Name", { type: "text", autoComplete: "name" })}
      {field("email", "Email", { type: "email", autoComplete: "email" })}
      {field("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}
      {field("link", "LinkedIn, portfolio, or GitHub (optional)", {
        type: "url",
        autoComplete: "url",
        placeholder: "https://",
      })}

      <div>
        <label htmlFor="why" style={labelStyle}>
          {whyLabel}
        </label>
        <textarea
          id="why"
          name="why"
          rows={6}
          style={{ ...inputStyle, resize: "vertical" }}
          onChange={(e) => setWhyLen(e.target.value.length)}
          aria-invalid={errors.why ? true : undefined}
          aria-describedby={errors.why ? "why-count why-error" : "why-count"}
        />
        <p
          id="why-count"
          style={{
            fontFamily: F.display,
            fontSize: 13,
            color: whyLen > LIMITS.why ? "#b3261e" : C.stone,
            margin: "6px 0 0",
            textAlign: "right",
          }}
        >
          {whyLen.toLocaleString("en-US")} / {LIMITS.why.toLocaleString("en-US")}
        </p>
        {errors.why && (
          <p id="why-error" style={errorStyle}>
            {errors.why}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="resume" style={labelStyle}>
          Résumé (PDF, up to 5 MB)
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept="application/pdf,.pdf"
          style={{ ...inputStyle, padding: 10 }}
          aria-invalid={errors.resume ? true : undefined}
          aria-describedby={errors.resume ? "resume-error" : undefined}
        />
        {errors.resume && (
          <p id="resume-error" style={errorStyle}>
            {errors.resume}
          </p>
        )}
      </div>

      <div style={hidden} aria-hidden="true">
        <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {submitError && (
        <p ref={submitErrorRef} tabIndex={-1} role="alert" style={{ ...errorStyle, fontSize: 15, margin: 0 }}>
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          fontFamily: F.display,
          fontWeight: 600,
          fontSize: 16,
          color: C.slate,
          background: C.amber,
          border: "none",
          borderRadius: 999,
          padding: "14px 28px",
          minHeight: 48,
          cursor: submitting ? "default" : "pointer",
          opacity: submitting ? 0.6 : 1,
          alignSelf: "flex-start",
        }}
      >
        {submitting ? "Sending..." : "Send application"}
      </button>
    </form>
  );
}
