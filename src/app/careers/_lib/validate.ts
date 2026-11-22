import { LIMITS, RESUME_MAX_BYTES } from "./config";

export interface ApplicationFields {
  name: string;
  email: string;
  phone: string;
  link: string;
  why: string;
}

export type FieldErrors = Partial<Record<keyof ApplicationFields | "resume", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateApplication(
  fields: ApplicationFields,
  file: { name: string; size: number; type: string } | null,
): FieldErrors {
  const errors: FieldErrors = {};
  const name = fields.name.trim();
  if (!name || name.length > LIMITS.name) {
    errors.name = "Enter your name (up to 100 characters).";
  }
  if (!EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Enter a valid email.";
  }
  if (fields.phone.trim().length > LIMITS.phone) {
    errors.phone = "Keep your phone number under 30 characters.";
  }
  const link = fields.link.trim();
  if (link && (!link.startsWith("https://") || link.length > LIMITS.link)) {
    errors.link = "Use a full link that starts with https://.";
  }
  const why = fields.why.trim();
  if (!why || why.length > LIMITS.why) {
    errors.why = "Write a short answer (up to 2,000 characters).";
  }
  if (!file) {
    errors.resume = "Attach your résumé as a PDF.";
  } else if (file.size > RESUME_MAX_BYTES) {
    errors.resume = "Your résumé needs to be under 5 MB.";
  } else if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    errors.resume = "Your résumé needs to be a PDF.";
  }
  return errors;
}
