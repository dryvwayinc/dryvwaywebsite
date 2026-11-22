"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { C, F } from "../../../theme";
import { MinimalHeader } from "../../../legal/_components";
import { AdminApiError, createAdminApi } from "../_lib/adminApi";
import { getAdminAuth, signInWithGoogle, signOutAdmin } from "../_lib/firebaseClient";
import { ApplicationsTab } from "./ApplicationsTab";
import { RolesTab } from "./RolesTab";
import { errorText, mutedText, primaryBtn, secondaryBtn } from "./ui";

type State =
  | { kind: "loading" }
  | { kind: "signed_out" }
  | { kind: "not_admin"; email: string }
  | { kind: "admin"; email: string }
  | { kind: "error" };

const api = createAdminApi(async () => {
  const user = getAdminAuth().currentUser;
  if (!user) throw new AdminApiError(401, "Sign in again.");
  return user.getIdToken();
});

export function AdminApp() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tab, setTab] = useState<"applications" | "roles">("applications");
  const [signInError, setSignInError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(getAdminAuth(), async (user) => {
      if (!user) {
        if (!cancelled) setState({ kind: "signed_out" });
        return;
      }
      if (!cancelled) setState({ kind: "loading" });
      try {
        const email = await api.me();
        if (!cancelled) setState({ kind: "admin", email });
      } catch (e) {
        if (cancelled) return;
        if (e instanceof AdminApiError && (e.status === 403 || e.status === 401)) {
          setState({ kind: "not_admin", email: user.email ?? "This account" });
        } else {
          setState({ kind: "error" });
        }
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [attempt]);

  const signIn = useCallback(async () => {
    setSignInError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setSignInError("We couldn't sign you in. Try again.");
      }
    }
  }, []);


  const center: React.CSSProperties = { maxWidth: 420, margin: "0 auto", padding: "96px 20px", textAlign: "center" };
  const title: React.CSSProperties = { fontFamily: F.display, fontWeight: 600, fontSize: 32, margin: "0 0 20px" };

  let body: React.ReactNode;
  if (state.kind === "loading") {
    body = (
      <div style={center} role="status" aria-live="polite">
        <p style={mutedText}>Loading</p>
      </div>
    );
  } else if (state.kind === "signed_out") {
    body = (
      <div style={center}>
        <h1 style={title}>Careers admin</h1>
        <button type="button" style={primaryBtn} onClick={signIn}>Sign in with Google</button>
        {signInError && <p role="alert" style={errorText}>{signInError}</p>}
      </div>
    );
  } else if (state.kind === "not_admin") {
    body = (
      <div style={center}>
        <h1 style={{ ...title, fontSize: 22, lineHeight: 1.4, overflowWrap: "anywhere" }}>
          {state.email} isn&apos;t on the admin list. Ask Aariz to add it.
        </h1>
        <button type="button" style={secondaryBtn} onClick={() => signOutAdmin()}>Sign out</button>
      </div>
    );
  } else if (state.kind === "error") {
    body = (
      <div style={center}>
        <p role="alert" style={{ ...errorText, fontSize: 16, margin: "0 0 16px" }}>
          We couldn&apos;t reach the server. Try again.
        </p>
        <button type="button" style={primaryBtn} onClick={() => setAttempt((n) => n + 1)}>Try again</button>
      </div>
    );
  } else {
    body = (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px clamp(16px, 5vw, 32px) 96px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <h1 style={{ ...title, fontSize: 28, margin: 0 }}>Careers admin</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ ...mutedText, overflowWrap: "anywhere" }}>{state.email}</span>
            <button type="button" style={secondaryBtn} onClick={() => signOutAdmin()}>Sign out</button>
          </div>
        </div>
        <div role="tablist" aria-label="Careers admin" style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["applications", "roles"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              onClick={() => setTab(t)}
              style={{
                ...secondaryBtn,
                background: tab === t ? C.slate : "transparent",
                color: tab === t ? C.warm : C.slate,
              }}
            >
              {t === "applications" ? "Applications" : "Roles"}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "applications" ? <ApplicationsTab api={api} /> : <RolesTab api={api} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.warm, minHeight: "100vh", color: C.slate }}>
      <MinimalHeader />
      {body}
    </div>
  );
}
