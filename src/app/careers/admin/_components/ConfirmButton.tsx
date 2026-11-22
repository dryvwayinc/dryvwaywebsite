"use client";

import { useState } from "react";
import { C, F } from "../../../theme";
import { dangerBtn, secondaryBtn } from "./ui";

export function ConfirmButton({
  label,
  prompt,
  confirmLabel,
  busy,
  onConfirm,
}: {
  label: string;
  prompt: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
}) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button type="button" style={dangerBtn} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <div
      role="group"
      aria-label={label}
      style={{ border: `1px solid ${C.stoneLine}`, borderRadius: 12, padding: 14, background: C.paper }}
    >
      <p style={{ fontFamily: F.display, fontSize: 15, margin: "0 0 12px", color: C.slate }}>{prompt}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          style={dangerBtn}
          disabled={busy}
          autoFocus
          onClick={() => {
            onConfirm();
            setAsking(false);
          }}
        >
          {confirmLabel}
        </button>
        <button type="button" style={secondaryBtn} onClick={() => setAsking(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
