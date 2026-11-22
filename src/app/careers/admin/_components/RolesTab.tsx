"use client";

import { useEffect, useState } from "react";
import { C, F } from "../../../theme";
import { employmentTypeLabel } from "../../_lib/format";
import type { AdminRole } from "../../_lib/types";
import type { AdminApi } from "../_lib/adminApi";
import { RoleEditor } from "./RoleEditor";
import { errorText, mutedText, primaryBtn, secondaryBtn } from "./ui";

export function RolesTab({ api }: { api: AdminApi }) {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminRole | "new" | null>(null);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .listRoles()
      .then((list) => {
        if (cancelled) return;
        setRoles(list);
        setError(null);
        setLoaded(true);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [api, attempt]);

  if (editing) {
    return (
      <RoleEditor
        api={api}
        role={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={(saved) => {
          setRoles((list) =>
            list.some((r) => r.id === saved.id)
              ? list.map((r) => (r.id === saved.id ? { ...r, ...saved } : r))
              : [saved, ...list],
          );
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button type="button" style={primaryBtn} onClick={() => setEditing("new")}>+ New role</button>
      </div>
      {!loaded && <p style={mutedText}>Loading</p>}
      {loaded && error && (
        <div>
          <p role="alert" style={errorText}>{error}</p>
          <button type="button" style={{ ...secondaryBtn, marginTop: 10 }} onClick={() => setAttempt((n) => n + 1)}>Try again</button>
        </div>
      )}
      {loaded && !error && roles.length === 0 && (
        <p style={mutedText}>No roles yet. Create one to show it on the Careers page.</p>
      )}
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {roles.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => setEditing(r)}
              style={{
                width: "100%",
                textAlign: "left",
                background: C.paper,
                border: `1px solid ${C.stoneLine}`,
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) auto",
                gap: "2px 12px",
                fontFamily: F.display,
                color: C.slate,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 16, overflowWrap: "anywhere" }}>{r.title}</span>
              <span style={{ fontSize: 13, color: C.stone }}>{r.application_count} applied</span>
              <span style={{ fontSize: 14, color: C.stone }}>{employmentTypeLabel(r.employment_type)}</span>
              <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{r.status}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
