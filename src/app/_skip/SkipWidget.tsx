"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { C, F } from "../theme";
import { SkipMascot } from "./SkipMascot";
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

  const panelBase: CSSProperties = {
    position: "fixed",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
    background: C.paper,
    border: `1px solid ${C.stoneLine}`,
    boxShadow: "0 24px 64px rgba(44,44,42,0.22)",
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
        <div style={panelStyle} role="dialog" aria-label="Ask Skip — Dryvway help">
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderBottom: `1px solid ${C.stoneLineSoft}`,
              background: C.warmSoftest,
            }}
          >
            <div style={{ width: 44, flexShrink: 0 }}>
              <SkipMascot
                pose={sending ? "loading" : "idle"}
                variant="inline"
                showLabel={false}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: C.slate }}>
                Ask Skip
              </div>
              <div style={{ fontSize: 12, color: C.stone }}>
                Dryvway’s help assistant
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Ask Skip"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 20,
                lineHeight: 1,
                color: C.stone,
                padding: 6,
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", padding: 16 }}
          >
            <Bubble role="assistant">{GREETING}</Bubble>
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.content}
              </Bubble>
            ))}
            {sending && <Bubble role="assistant">Skip is thinking…</Bubble>}
            {chips.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {chips.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => send(f.question)}
                    style={{
                      border: `1px solid ${C.stoneLine}`,
                      background: C.paper,
                      color: C.slate,
                      borderRadius: 999,
                      padding: "7px 12px",
                      fontSize: 13,
                      fontFamily: F.display,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {f.question}
                  </button>
                ))}
              </div>
            )}
            {suggestHuman && (
              <a
                href={MAILTO_HREF}
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  background: C.amber,
                  color: C.slate,
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 999,
                  padding: "9px 16px",
                  textDecoration: "none",
                }}
              >
                Email {SUPPORT_EMAIL}
              </a>
            )}
            {error && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: C.amberDeep,
                  background: C.amberSoft,
                  borderRadius: 10,
                  padding: "8px 12px",
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
              gap: 8,
              padding: 12,
              borderTop: `1px solid ${C.stoneLineSoft}`,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Dryvway…"
              disabled={sending}
              aria-label="Message Skip"
              style={{
                flex: 1,
                border: `1px solid ${C.stoneLine}`,
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 14,
                fontFamily: F.display,
                color: C.slate,
                outline: "none",
                background: C.paper,
              }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              style={{
                border: "none",
                borderRadius: 12,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: F.display,
                background: sending || !input.trim() ? C.warmDeep : C.amber,
                color: C.slate,
                cursor: sending || !input.trim() ? "default" : "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Launcher — always visible, bottom-left */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Ask Skip — Dryvway help"
        aria-expanded={open}
        style={{
          position: "fixed",
          left: 20,
          bottom: 20,
          zIndex: 1000,
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: `2px solid ${C.amber}`,
          background: C.paper,
          boxShadow: "0 10px 30px rgba(44,44,42,0.18)",
          cursor: "pointer",
          padding: 6,
        }}
      >
        <SkipMascot pose="idle" variant="inline" showLabel={false} />
      </button>
    </>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
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
        style={{
          maxWidth: "85%",
          borderRadius: 14,
          padding: "9px 13px",
          fontSize: 14,
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
          color: C.slate,
          background: isUser ? C.amberSoft : C.warmSoftest,
          border: isUser ? "none" : `1px solid ${C.stoneLineSoft}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
