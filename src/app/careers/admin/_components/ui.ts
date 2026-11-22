import type { CSSProperties } from "react";
import { C, F } from "../../../theme";

export const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: F.display,
  fontWeight: 500,
  fontSize: 12,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: C.stone,
  marginBottom: 6,
};

export const fieldStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: F.display,
  fontSize: 16,
  color: C.slate,
  background: C.paper,
  border: `1px solid ${C.stoneSoft}`,
  borderRadius: 10,
  padding: "10px 12px",
};

export const primaryBtn: CSSProperties = {
  fontFamily: F.display,
  fontWeight: 600,
  fontSize: 15,
  color: C.slate,
  background: C.amber,
  border: "none",
  borderRadius: 999,
  padding: "11px 20px",
  cursor: "pointer",
  minHeight: 44,
};

export const secondaryBtn: CSSProperties = {
  ...primaryBtn,
  background: "transparent",
  border: `1px solid ${C.stoneSoft}`,
  fontWeight: 500,
};

export const dangerBtn: CSSProperties = {
  ...secondaryBtn,
  color: "#9b2c1d",
  border: "1px solid #9b2c1d",
};

export const errorText: CSSProperties = {
  fontFamily: F.display,
  fontSize: 14,
  color: "#9b2c1d",
  margin: "8px 0 0",
};

export const mutedText: CSSProperties = {
  fontFamily: F.display,
  fontSize: 14,
  color: C.stone,
  margin: 0,
};
