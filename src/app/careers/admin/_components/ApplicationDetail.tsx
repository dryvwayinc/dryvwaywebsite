"use client";

import { useEffect, useRef, useState } from "react";
import { C, F } from "../../../theme";
import { STATUS_LABELS, formatShortDate } from "../../_lib/format";
import { LIMITS } from "../../_lib/config";
import type { ApplicationDetail as Detail, ApplicationStatus } from "../../_lib/types";
import type { AdminApi } from "../_lib/adminApi";
import { isSafeLink } from "../_lib/filter";
import { ConfirmButton } from "./ConfirmButton";
import { errorText, fieldStyle, labelStyle, mutedText, primaryBtn, secondaryBtn } from "./ui";

const STATUSES = Object.keys(STATUS_LABELS) as ApplicationStatus[];

function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontFamily: F.display, fontSize: 16, lineHeight: 1.6, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
        {children}
      </div>
    </div>
  );
}

export function ApplicationDetail({
  api,
  id,
  onClose,
  onChanged,
  onDeleted,
}: {
  api: AdminApi;
  id: string;
  onClose: () => void;
  onChanged: (d: Detail) => void;
  onDeleted: (id: string) => void;
}) {
  const wide = useWide();
  const [app, setApp] = useState<Detail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let cancelled = false;
    setApp(null);
    setLoadError(null);
    api
      .getApplication(id)
      .then((d) => {
        if (!cancelled) setApp(d);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [api, id]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function run(fn: () => Promise<Detail | void>) {
    setBusy(true);
    setActionError(null);
    try {
      const d = await fn();
      if (d) {
        setApp(d);
        onChanged(d);
      }
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const panel: React.CSSProperties = wide
    ? { position: "fixed", top: 0, right: 0, bottom: 0, width: 480, borderLeft: `1px solid ${C.stoneLine}`, boxShadow: "-8px 0 30px rgba(44,44,42,0.08)" }
    : { position: "fixed", inset: 0 };

  return (
    <aside
      role="dialog"
      aria-modal={!wide}
      aria-labelledby="app-detail-title"
      style={{ ...panel, background: C.warm, zIndex: 50, overflowY: "auto", padding: "20px clamp(16px, 4vw, 24px) 48px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <h2
          id="app-detail-title"
          ref={headingRef}
          tabIndex={-1}
          style={{ fontFamily: F.display, fontWeight: 600, fontSize: 24, margin: 0, outline: "none", overflowWrap: "anywhere" }}
        >
          {app ? app.name : "Application"}
        </h2>
        <button type="button" style={secondaryBtn} onClick={onClose}>
          Close
        </button>
      </div>

      {loadError && <p role="alert" style={errorText}>{loadError}</p>}
      {!app && !loadError && <p style={{ ...mutedText, marginTop: 16 }}>Loading</p>}

      {app && (
        <div style={{ marginTop: 20 }}>
          <Field label="Role">{app.role_title}</Field>
          <Field label="Email">{app.email}</Field>
          {app.phone && <Field label="Phone">{app.phone}</Field>}
          {app.link && (
            <Field label="Link">
              {isSafeLink(app.link) ? (
                <a href={app.link} target="_blank" rel="noopener noreferrer" style={{ color: C.amberDeep }}>
                  {app.link}
                </a>
              ) : (
                app.link
              )}
            </Field>
          )}
          <Field label="Why Dryvway">{app.why}</Field>
          <Field label="Applied">{formatShortDate(app.created_at)}</Field>

          <div style={{ marginBottom: 18 }}>
            <button type="button" style={primaryBtn} disabled={busy} onClick={() => run(() => api.openResume(app.id))}>
              Open résumé
            </button>
            <div style={{ ...mutedText, marginTop: 6, overflowWrap: "anywhere" }}>{app.resume_filename}</div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="app-status" style={labelStyle}>Status</label>
            <select
              id="app-status"
              style={fieldStyle}
              value={app.status}
              disabled={busy}
              onChange={(e) => run(() => api.setStatus(app.id, e.target.value as ApplicationStatus))}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <section aria-label="Notes" style={{ marginBottom: 24 }}>
            <h3 style={{ ...labelStyle, marginBottom: 10 }}>Notes</h3>
            {app.notes.map((n, i) => (
              <div key={i} style={{ background: C.paper, border: `1px solid ${C.stoneLine}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <div style={{ ...mutedText, fontSize: 13, overflowWrap: "anywhere" }}>
                  {n.author_email} · {formatShortDate(n.created_at)}
                </div>
                <div style={{ fontFamily: F.display, fontSize: 15, marginTop: 4, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {n.text}
                </div>
              </div>
            ))}
            <label htmlFor="app-note" style={labelStyle}>New note</label>
            <textarea
              id="app-note"
              style={{ ...fieldStyle, minHeight: 80, resize: "vertical" }}
              maxLength={LIMITS.note}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                style={secondaryBtn}
                disabled={busy || !note.trim()}
                onClick={() =>
                  run(async () => {
                    const d = await api.addNote(app.id, note.trim());
                    setNote("");
                    return d;
                  })
                }
              >
                Add note
              </button>
            </div>
          </section>

          {app.history.length > 0 && (
            <section aria-label="Status history" style={{ marginBottom: 24 }}>
              <h3 style={{ ...labelStyle, marginBottom: 10 }}>History</h3>
              {app.history.map((h, i) => (
                <div key={i} style={{ ...mutedText, overflowWrap: "anywhere" }}>
                  {STATUS_LABELS[h.from]} to {STATUS_LABELS[h.to]} by {h.by}, {formatShortDate(h.at)}
                </div>
              ))}
            </section>
          )}

          {actionError && <p role="alert" style={errorText}>{actionError}</p>}

          <div style={{ marginTop: 16 }}>
            <ConfirmButton
              label="Delete application"
              prompt="Delete for good? This removes the résumé too."
              confirmLabel="Delete"
              busy={busy}
              onConfirm={() =>
                run(async () => {
                  await api.deleteApplication(app.id);
                  onDeleted(app.id);
                })
              }
            />
          </div>
        </div>
      )}
    </aside>
  );
}
