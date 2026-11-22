"use client";

import { useState } from "react";
import { C, F } from "../../../theme";
import { LIMITS } from "../../_lib/config";
import { employmentTypeLabel } from "../../_lib/format";
import type { AdminRole, EmploymentType, RoleInput, RoleStatus } from "../../_lib/types";
import type { AdminApi } from "../_lib/adminApi";
import { Description } from "../../_components/Description";
import { errorText, fieldStyle, labelStyle, mutedText, primaryBtn, secondaryBtn } from "./ui";

const TYPES: EmploymentType[] = ["full_time", "part_time", "internship", "contract"];

export function RoleEditor({
  api,
  role,
  onSaved,
  onCancel,
}: {
  api: AdminApi;
  role: AdminRole | null;
  onSaved: (r: AdminRole) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(role?.title ?? "");
  const [type, setType] = useState<EmploymentType>(role?.employment_type ?? "full_time");
  const [location, setLocation] = useState(role?.location ?? "");
  const [pay, setPay] = useState(role?.pay ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(status?: RoleStatus) {
    if (!title.trim() || !location.trim() || !description.trim()) {
      setError("Title, location, and description are required.");
      return;
    }
    const fields = {
      title: title.trim(),
      employment_type: type,
      location: location.trim(),
      pay: pay.trim() ? pay.trim() : null,
      description: description.trim(),
    };
    setBusy(true);
    setError(null);
    try {
      const saved = role
        ? await api.updateRole(role.id, status ? { ...fields, status } : fields)
        : await api.createRole({ ...fields, status: status ?? "draft" } as RoleInput);
      onSaved(saved);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const row: React.CSSProperties = { marginBottom: 16 };

  return (
    <div>
      <h2 style={{ fontFamily: F.display, fontWeight: 600, fontSize: 24, margin: "0 0 20px" }}>
        {role ? "Edit role" : "New role"}
      </h2>
      <div style={row}>
        <label htmlFor="role-title" style={labelStyle}>Title</label>
        <input id="role-title" style={fieldStyle} maxLength={LIMITS.title} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...row, flex: "1 1 200px" }}>
          <label htmlFor="role-type" style={labelStyle}>Type</label>
          <select id="role-type" style={fieldStyle} value={type} onChange={(e) => setType(e.target.value as EmploymentType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{employmentTypeLabel(t)}</option>
            ))}
          </select>
        </div>
        <div style={{ ...row, flex: "1 1 200px" }}>
          <label htmlFor="role-location" style={labelStyle}>Location</label>
          <input id="role-location" style={fieldStyle} maxLength={LIMITS.location} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div style={{ ...row, flex: "1 1 200px" }}>
          <label htmlFor="role-pay" style={labelStyle}>Pay (optional)</label>
          <input id="role-pay" style={fieldStyle} maxLength={LIMITS.pay} value={pay} onChange={(e) => setPay(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ ...row, flex: "1 1 320px", minWidth: 0 }}>
          <label htmlFor="role-description" style={labelStyle}>Description</label>
          <textarea
            id="role-description"
            style={{ ...fieldStyle, minHeight: 280, resize: "vertical" }}
            maxLength={LIMITS.description}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p style={{ ...mutedText, marginTop: 6 }}>Blank line starts a new paragraph. Lines starting with &quot;- &quot; become a list.</p>
        </div>
        <div style={{ ...row, flex: "1 1 320px", minWidth: 0 }}>
          <div style={labelStyle}>Preview</div>
          <div style={{ background: C.paper, border: `1px solid ${C.stoneLine}`, borderRadius: 10, padding: 16, minHeight: 120 }}>
            <Description text={description} />
          </div>
        </div>
      </div>

      {error && <p role="alert" style={errorText}>{error}</p>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        {(!role || role.status === "draft") && (
          <>
            <button type="button" style={secondaryBtn} disabled={busy} onClick={() => save("draft")}>Save draft</button>
            <button type="button" style={primaryBtn} disabled={busy} onClick={() => save("open")}>Publish</button>
          </>
        )}
        {role && role.status !== "draft" && (
          <>
            <button type="button" style={primaryBtn} disabled={busy} onClick={() => save()}>Save changes</button>
            {role.status === "open" ? (
              <button type="button" style={secondaryBtn} disabled={busy} onClick={() => save("closed")}>Close</button>
            ) : (
              <button type="button" style={secondaryBtn} disabled={busy} onClick={() => save("open")}>Reopen</button>
            )}
          </>
        )}
        <button type="button" style={secondaryBtn} disabled={busy} onClick={onCancel}>Cancel</button>
      </div>
      <p style={{ ...mutedText, marginTop: 10 }}>New roles show on the Careers page within 5 minutes.</p>
    </div>
  );
}
