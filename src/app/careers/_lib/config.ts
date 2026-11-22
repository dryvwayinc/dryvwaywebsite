export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dryvway-app.onrender.com/api";

export const CAREERS_EMAIL = "founders@dryvwayinc.com";

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export const LIMITS = {
  title: 80,
  location: 80,
  pay: 80,
  description: 5000,
  name: 100,
  phone: 30,
  link: 300,
  why: 2000,
  note: 2000,
} as const;
