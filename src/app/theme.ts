// ------------------------------------------------------------------
// Design tokens — shared across the landing page and the legal pages.
// Plain value-only objects (no React/DOM deps), safe to import into
// both server and client components.
// ------------------------------------------------------------------
export const C = {
  slate: "#2C2C2A",
  slateSoft: "#3a3a37",
  amber: "#E8A040",
  amberDeep: "#c98223",
  amberSoft: "rgba(232,160,64,0.12)",
  warm: "#F5F0EB",
  warmDeep: "#ebe4db",
  warmSoftest: "#fbf8f4",
  stone: "#888780",
  stoneSoft: "#b8b6ad",
  stoneLine: "rgba(44,44,42,0.10)",
  stoneLineSoft: "rgba(44,44,42,0.06)",
  paper: "#ffffff",
} as const;

export const F = {
  // The one sans (Inter) used everywhere — UI, headings, body, labels.
  display: "var(--font-display-stack)",
  // Serif (Source Serif) — reserved exclusively for the italic accents.
  body: "var(--font-body-stack)",
} as const;
