// Client for the Ask Skip endpoints on the Render backend. The base URL is
// public (same one the app uses) — no secrets on the marketing site.
const SUPPORT_API = "https://dryvway-app.onrender.com/api/support";

export const SUPPORT_EMAIL = "support@dryvwayinc.com";
export const MAILTO_HREF = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Dryvway support"
)}`;

export interface SupportFaq {
  id: string;
  category: string;
  question: string;
  short_answer: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatReply {
  reply: string;
  suggest_human: boolean;
  truncated: boolean;
  conversation_capped: boolean;
}

export class SkipApiError extends Error {
  status: number;
  constructor(status: number) {
    super(`Skip API error ${status}`);
    this.status = status;
  }
}

export async function fetchFaqs(): Promise<SupportFaq[]> {
  const res = await fetch(`${SUPPORT_API}/faqs`);
  if (!res.ok) throw new SkipApiError(res.status);
  const body = await res.json();
  return body?.data?.faqs ?? [];
}

export async function sendChat(messages: ChatTurn[]): Promise<ChatReply> {
  const res = await fetch(`${SUPPORT_API}/public-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new SkipApiError(res.status);
  const body = await res.json();
  return body.data as ChatReply;
}

// --- sessionStorage persistence: the thread survives page navigation, not a
// closed tab. Wrapped in try/catch — storage can be unavailable (private
// mode) and the widget must degrade to in-memory state, never crash.
const STORAGE_KEY = "dryvway-skip-chat";

function isChatTurn(value: unknown): value is ChatTurn {
  if (typeof value !== "object" || value === null) return false;
  const { role, content } = value as { role?: unknown; content?: unknown };
  return (
    (role === "user" || role === "assistant") && typeof content === "string"
  );
}

export function loadThread(): { messages: ChatTurn[]; suggestHuman: boolean } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.messages)) {
        return {
          messages: parsed.messages.filter(isChatTurn),
          suggestHuman: Boolean(parsed.suggestHuman),
        };
      }
    }
  } catch {
    // fall through to empty thread
  }
  return { messages: [], suggestHuman: false };
}

export function saveThread(messages: ChatTurn[], suggestHuman: boolean): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ messages, suggestHuman })
    );
  } catch {
    // storage unavailable — in-memory only
  }
}
