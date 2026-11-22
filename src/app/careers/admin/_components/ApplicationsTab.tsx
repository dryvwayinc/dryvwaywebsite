"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { C, F } from "../../../theme";
import { STATUS_LABELS, formatShortDate } from "../../_lib/format";
import type {
  AdminRole,
  ApplicationDetail as Detail,
  ApplicationStatus,
  ApplicationSummary,
} from "../../_lib/types";
import type { AdminApi } from "../_lib/adminApi";
import { GENERAL_ROLE, filterApplications } from "../_lib/filter";
import { ApplicationDetail } from "./ApplicationDetail";
import { errorText, fieldStyle, labelStyle, mutedText, secondaryBtn } from "./ui";

function setUrlApplication(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("application", id);
  else url.searchParams.delete("application");
  window.history.replaceState(null, "", url.toString());
}

export function ApplicationsTab({ api }: { api: AdminApi }) {
  const [apps, setApps] = useState<ApplicationSummary[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("application"),
  );
  const lastTrigger = useRef<HTMLElement | null>(null);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([api.listApplications(), api.listRoles()]).then(([a, r]) => {
      if (cancelled) return;
      if (a.status === "fulfilled") {
        setApps(a.value);
        setError(null);
      } else {
        setError(a.reason?.message ?? "We couldn't load applications. Try again.");
      }
      if (r.status === "fulfilled") setRoles(r.value);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [api, attempt]);

  const close = useCallback(() => {
    setOpenId(null);
    setUrlApplication(null);
    lastTrigger.current?.focus();
  }, []);

  function open(id: string, el: HTMLElement) {
    lastTrigger.current = el;
    setOpenId(id);
    setUrlApplication(id);
  }

  function onChanged(d: Detail) {
    setApps((list) =>
      list.map((a) =>
        a.id === d.id ? { ...a, status: d.status, name: d.name, role_title: d.role_title } : a,
      ),
    );
  }

  function onDeleted(id: string) {
    setApps((list) => list.filter((a) => a.id !== id));
    close();
  }

  const shown = filterApplications(apps, roleFilter, statusFilter);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ flex: "1 1 200px" }}>
          <label htmlFor="filter-role" style={labelStyle}>Role</label>
          <select id="filter-role" style={fieldStyle} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
            <option value={GENERAL_ROLE}>General interest</option>
          </select>
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <label htmlFor="filter-status" style={labelStyle}>Status</label>
          <select
            id="filter-status"
            style={fieldStyle}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
          >
            <option value="all">All</option>
            {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {!loaded && <p style={mutedText}>Loading</p>}
      {loaded && error && (
        <div>
          <p role="alert" style={errorText}>{error}</p>
          <button type="button" style={{ ...secondaryBtn, marginTop: 10 }} onClick={() => setAttempt((n) => n + 1)}>Try again</button>
        </div>
      )}
      {loaded && !error && apps.length === 0 && <p style={mutedText}>No applications yet.</p>}
      {loaded && !error && apps.length > 0 && shown.length === 0 && (
        <p style={mutedText}>No applications match these filters.</p>
      )}

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {shown.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={(e) => open(a.id, e.currentTarget)}
              style={{
                width: "100%",
                textAlign: "left",
                background: a.id === openId ? C.amberSoft : C.paper,
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
              <span style={{ fontWeight: 600, fontSize: 16, overflowWrap: "anywhere" }}>{a.name}</span>
              <span style={{ fontSize: 13, color: C.stone }}>{formatShortDate(a.created_at)}</span>
              <span style={{ fontSize: 14, color: C.stone, overflowWrap: "anywhere" }}>{a.role_title}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{STATUS_LABELS[a.status]}</span>
            </button>
          </li>
        ))}
      </ul>

      {openId && (
        <ApplicationDetail api={api} id={openId} onClose={close} onChanged={onChanged} onDeleted={onDeleted} />
      )}
    </div>
  );
}
