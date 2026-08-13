"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { C, F } from "../theme";
import { SkipMascot } from "./SkipMascot";
import styles from "./SkipWidget.module.css";
import {
  MAILTO_HREF,
  SUPPORT_EMAIL,
  SkipApiError,
  fetchFaqs,
  loadThread,
  saveThread,
  sendChat,
  type ChatTurn,
  type SupportFaq,
} from "./skipApi";

const GREETING =
  "Hi, I'm Skip — the Dryvway helper. Ask me anything about parking with Dryvway or listing your driveway.";

// Theme colors handed to the CSS module — hover/focus/entrance states live
// there, and CSS can't import from theme.ts.
const VARS = {
  "--dv-amber": C.amber,
  "--dv-amber-deep": C.amberDeep,
  "--dv-amber-soft": C.amberSoft,
  "--dv-paper": C.paper,
  "--dv-slate": C.slate,
  "--dv-warm-deep": C.warmDeep,
  "--dv-line": C.stoneLine,
} as CSSProperties;

// The site's decorative serif-italic accent (same recipe as the landing page).
const serifAccent: CSSProperties = {
  fontFamily: F.body,
  fontStyle: "italic",
  fontWeight: 400,
};

export function SkipWidget() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [suggestHuman, setSuggestHuman] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<SupportFaq[] | null>(null);
  const [faqsFailed, setFaqsFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore the thread once on mount (client only — avoids hydration drift).
  useEffect(() => {
    const t = loadThread();
    setMessages(t.messages);
    setSuggestHuman(t.suggestHuman);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // FAQ chips: fetched once, on first open.
  useEffect(() => {
    if (!open || faqs !== null || faqsFailed) return;
    let cancelled = false;
    fetchFaqs()
      .then((list) => {
        if (!cancelled) setFaqs(list);
      })
      .catch(() => {
        if (!cancelled) setFaqsFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, faqs, faqsFailed]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending, open]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || sending) return;
    const next: ChatTurn[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setError(null);
    setSending(true);
    try {
      const reply = await sendChat(next);
      const done: ChatTurn[] = [
        ...next,
        { role: "assistant", content: reply.reply },
      ];
      const human = reply.suggest_human || reply.conversation_capped;
      setMessages(done);
      setSuggestHuman(human);
      saveThread(done, human);
    } catch (e) {
      // Roll back the optimistic turn; hand the text back for retry.
      setMessages(messages);
      setInput(text);
      setError(
        e instanceof SkipApiError && e.status === 429
          ? "Skip needs a breather — try again in a minute."
          : "Skip couldn't be reached — try again shortly."
      );
    } finally {
      setSending(false);
    }
  }

  // Greet (wave + speech bubble) on hover/focus — never while the panel is
  // open. Initial value is false on server and client alike, so the first
  // paint stays hydration-safe.
  const greetActive = (hovered || focused) && !open;

  const panelBase: CSSProperties = {
    ...VARS,
    position: "fixed",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
    background: C.paper,
    border: `1px solid ${C.stoneLine}`,
    boxShadow:
      "0 24px 64px -12px rgba(44,44,42,0.26), 0 6px 20px rgba(44,44,42,0.08)",
    overflow: "hidden",
    fontFamily: F.display,
  };
  const panelStyle: CSSProperties = isMobile
    ? {
        ...panelBase,
        left: 0,
        right: 0,
        bottom: 0,
        height: "min(560px, 85dvh)",
        borderRadius: "20px 20px 0 0",
      }
    : {
        ...panelBase,
        left: 20,
        bottom: 96,
        width: 380,
        height: "min(560px, calc(100dvh - 120px))",
        borderRadius: 20,
      };

  // Computed as a list (not a boolean) so TypeScript narrows `faqs` away
  // from null before the .map below.
  const chips = messages.length === 0 && faqs ? faqs.slice(0, 6) : [];

  return (
    <>
      {open && (
        <div
          className={styles.panel}
          style={panelStyle}
          role="dialog"
          aria-label="Ask Skip — Dryvway help"
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px 12px",
              borderBottom: `1px solid ${C.stoneLineSoft}`,
              background: C.warmSoftest,
            }}
          >
            <div className={styles.mascot} style={{ width: 48, flexShrink: 0 }}>
              <SkipMascot
                pose={sending ? "loading" : "idle"}
                variant="inline"
                showLabel={false}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 17,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                  color: C.slate,
                }}
              >
                Ask <span style={serifAccent}>Skip</span>
              </div>
              <div style={{ fontSize: 12, color: C.stone, marginTop: 2 }}>
                Dryvway’s help assistant
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Ask Skip"
              className={styles.iconBtn}
              style={{
                width: 30,
                height: 30,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                border: "none",
                borderRadius: "50%",
                background: "transparent",
                cursor: "pointer",
                fontSize: 20,
                lineHeight: 1,
                color: C.stone,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              overscrollBehavior: "contain",
              padding: "18px 18px 8px",
            }}
          >
            <Bubble role="assistant">{GREETING}</Bubble>
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.content}
              </Bubble>
            ))}
            {sending && (
              <Bubble role="assistant" thinking>
                Skip is thinking…
              </Bubble>
            )}
            {chips.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: C.stone,
                    marginBottom: 8,
                  }}
                >
                  Popular questions
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {chips.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => send(f.question)}
                      className={styles.chip}
                      style={{
                        border: `1px solid ${C.stoneLine}`,
                        background: C.paper,
                        color: C.slate,
                        borderRadius: 999,
                        padding: "8px 14px",
                        fontSize: 13,
                        lineHeight: 1.4,
                        fontFamily: F.display,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {f.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {suggestHuman && (
              <a
                href={MAILTO_HREF}
                className={styles.mailto}
                style={{
                  display: "inline-block",
                  marginTop: 14,
                  background: C.amber,
                  color: C.slate,
                  fontWeight: 600,
                  fontSize: 13,
                  fontFamily: F.display,
                  borderRadius: 999,
                  padding: "10px 18px",
                  textDecoration: "none",
                }}
              >
                Email {SUPPORT_EMAIL}
              </a>
            )}
            {error && (
              <div
                role="status"
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: C.slate,
                  background: C.amberSoft,
                  border: "1px solid rgba(201,130,35,0.3)",
                  borderRadius: 12,
                  padding: "10px 14px",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            style={{
              display: "flex",
              gap: 10,
              padding: "12px 14px 14px",
              borderTop: `1px solid ${C.stoneLineSoft}`,
              background: C.warmSoftest,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Dryvway…"
              disabled={sending}
              aria-label="Message Skip"
              className={styles.input}
              style={{
                flex: 1,
                minWidth: 0,
                border: `1px solid ${C.stoneLine}`,
                borderRadius: 999,
                padding: "11px 16px",
                fontSize: 14,
                fontFamily: F.display,
                color: C.slate,
                background: C.paper,
              }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className={styles.send}
              style={{
                flexShrink: 0,
                border: "none",
                borderRadius: 999,
                padding: "11px 18px",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: F.display,
                background: sending || !input.trim() ? C.warmDeep : C.amber,
                color: sending || !input.trim() ? C.stone : C.slate,
                cursor: sending || !input.trim() ? "default" : "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Launcher — always visible, bottom-left. Skip IS the button: no
          circle chrome, he stands on his own rendered ground shadow. */}
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Ask Skip — Dryvway help"
        aria-expanded={open}
        className={styles.launcher}
        style={VARS}
      >
        <div
          aria-hidden="true"
          className={
            greetActive ? `${styles.greet} ${styles.greetOn}` : styles.greet
          }
          style={{ fontFamily: F.display }}
        >
          <em style={serifAccent}>Hi!</em> Ask me anything about Dryvway
        </div>
        <div className={`${styles.grow} ${styles.mascot}`}>
          <SkipMascot
            pose={greetActive ? "waving" : "idle"}
            variant="inline"
            showLabel={false}
          />
        </div>
      </button>
    </>
  );
}

function Bubble({
  role,
  thinking = false,
  children,
}: {
  role: "user" | "assistant";
  thinking?: boolean;
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      <div
        className={thinking ? styles.thinkingBubble : undefined}
        style={{
          maxWidth: "85%",
          borderRadius: isUser ? "16px 16px 5px 16px" : "16px 16px 16px 5px",
          padding: "10px 14px",
          fontSize: 14,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          color: thinking ? C.stone : C.slate,
          background: isUser ? C.amberSoft : C.warm,
          border: isUser ? "1px solid rgba(232,160,64,0.3)" : "none",
          fontFamily: thinking ? F.body : undefined,
          fontStyle: thinking ? "italic" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
