# Ask Skip Marketing-Site Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the existing "Ask Skip" AI support chatbot on www.dryvwayinc.com as a bottom-left corner widget, backed by a new anonymous endpoint on the Render backend.

**Architecture:** A new no-auth `POST /api/support/public-chat` endpoint on the FastAPI backend (per-IP rate-limited, reusing the existing `SupportBotService` brain and guardrails) is called directly from the browser. The marketing site gets a self-contained client component tree under `src/app/_skip/` — the animated Skip mascot ported from parking-web-app plus a launcher/panel widget — mounted once in the root layout.

**Tech Stack:** FastAPI + slowapi + pytest (backend); Next.js 16 App Router, React 19, TypeScript, inline styles + one CSS module (marketing site).

**Spec:** `docs/superpowers/specs/2026-08-12-ask-skip-marketing-widget-design.md` (approved).

## Global Constraints

- Two repos: marketing site = `/Users/aariziqbal/Desktop/Coding/dryvwaywebsite` (this repo, deploys to www.dryvwayinc.com via `vercel --prod`); backend = `/Users/aariziqbal/Desktop/Coding/parking/backend` (separate git repo at `/Users/aariziqbal/Desktop/Coding/parking`, auto-deploys to Render on push to its default branch).
- Backend base URL (public, hardcoded in the widget): `https://dryvway-app.onrender.com/api/support`
- Public chat rate limit, verbatim: `5/minute;30/hour;60/day` per IP.
- Conversation cap: `MAX_USER_TURNS_PER_CONVERSATION = 15` (already defined in `support_router.py`) applies to the public endpoint too.
- Human handoff is `mailto:support@dryvwayinc.com?subject=Dryvway%20support` — no public escalate endpoint.
- Widget is fixed **bottom-LEFT**. The existing desktop (≥1024px) landing-page layout must remain untouched except for the new mount in `layout.tsx`.
- Marketing palette comes from `src/app/theme.ts` (`C`, `F` exports). Key values: `C.amber` `#E8A040`, `C.slate` `#2C2C2A`, `C.paper` `#ffffff`. Fonts: `F.display` (Inter stack) for all UI.
- The marketing repo has **no unit-test infra** — frontend verification is `npx tsc --noEmit`, `npm run lint`, `npm run build`, and a manual browser check. Backend work is TDD with pytest.
- Local dev server must use an explicit port (`npm run dev -- -p 3100`) — the sibling parking app tends to occupy 3000.
- In the parking repo, commit ONLY the files this plan touches (`backend/app/routers/support_router.py`, `backend/tests/test_support.py`). Check `git status`/branch there before committing; do not sweep in unrelated changes.

---

### Task 1: Backend — anonymous `/public-chat` endpoint (TDD)

**Files:**
- Modify: `/Users/aariziqbal/Desktop/Coding/parking/backend/app/routers/support_router.py`
- Test: `/Users/aariziqbal/Desktop/Coding/parking/backend/tests/test_support.py` (append)

**Interfaces:**
- Consumes: existing module-level `support_bot_service`, `_prepare_messages(turns)`, `SupportChatRequest`, `CAPPED_REPLY`, `MAX_USER_TURNS_PER_CONVERSATION`, `limiter`, `APIResponse` — all already in `support_router.py`.
- Produces: `POST /public-chat` (mounted publicly as `POST /api/support/public-chat`). Request body `{"messages": [{"role": "user"|"assistant", "content": str}]}` (1–30 turns). Response `{"success": true, "message": "ok", "data": {"reply": str, "suggest_human": bool, "truncated": bool, "conversation_capped": bool}}`. Errors: 400 (unusable history), 422 (validation), 429 (rate limit), 502/503 (upstream/unconfigured). Task 4's `sendChat()` relies on exactly this shape.

Reference reading before starting: `tests/test_support.py` docstring and helpers `_make_client`, `_mock_bot`, `_turns` (top of file), plus `test_chat_rate_limited_per_uid` (~line 322) for the slowapi wiring pattern.

- [ ] **Step 1: Write the failing tests** — append to `tests/test_support.py`:

```python
# ---------------------------------------------------------------- /public-chat

def _make_public_client():
    """Bare app, NO auth override — public-chat must work anonymously."""
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from app.routers import support_router

    app = FastAPI()
    app.include_router(support_router.router)
    return TestClient(app), support_router


def test_public_chat_requires_no_auth(monkeypatch):
    client, router = _make_public_client()
    monkeypatch.setattr(router, "support_bot_service", _mock_bot())
    res = client.post(
        "/public-chat", json={"messages": [{"role": "user", "content": "hi"}]}
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["reply"] == "Here's how bookings work."
    assert data["conversation_capped"] is False


def test_public_chat_503_when_unconfigured(monkeypatch):
    client, router = _make_public_client()
    bot = MagicMock()
    bot.is_configured = False
    monkeypatch.setattr(router, "support_bot_service", bot)
    res = client.post(
        "/public-chat", json={"messages": [{"role": "user", "content": "hi"}]}
    )
    assert res.status_code == 503


def test_public_chat_conversation_cap_skips_model(monkeypatch):
    client, router = _make_public_client()
    bot = _mock_bot()
    monkeypatch.setattr(router, "support_bot_service", bot)

    # Same construction as test_chat_conversation_cap_skips_model: 30 turns
    # with the last assistant turn swapped to user -> 16 user turns > cap of 15.
    turns = _turns(30)
    turns[-1] = {"role": "user", "content": "one more"}
    res = client.post("/public-chat", json={"messages": turns})

    assert res.status_code == 200
    data = res.json()["data"]
    assert data["conversation_capped"] is True
    assert data["suggest_human"] is True
    bot.answer.assert_not_called()


def test_public_chat_rate_limited_per_ip(monkeypatch):
    """6th request inside a minute from one IP -> 429 (limit is 5/minute)."""
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    from app.routers import support_router
    from app.utils.rate_limiting import limiter

    app = FastAPI()
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.include_router(support_router.router)

    monkeypatch.setattr(support_router, "support_bot_service", _mock_bot())

    limiter.reset()
    limiter.enabled = True
    try:
        client = TestClient(app)
        payload = {"messages": [{"role": "user", "content": "hi"}]}
        statuses = [
            client.post("/public-chat", json=payload).status_code for _ in range(6)
        ]
        assert statuses[:5] == [200] * 5
        assert statuses[5] == 429
    finally:
        limiter.reset()
        limiter.enabled = False
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/aariziqbal/Desktop/Coding/parking/backend && python -m pytest tests/test_support.py -k public_chat -v`
Expected: 4 FAILURES with 404 (`/public-chat` doesn't exist yet).

- [ ] **Step 3: Implement the endpoint** in `support_router.py`.

3a. Add the rate-limit constant next to the existing ones (after line 38 `ESCALATE_RATE_LIMIT = "5/hour"`):

```python
PUBLIC_CHAT_RATE_LIMIT = "5/minute;30/hour;60/day"  # anonymous, per IP
```

3b. Extract the shared chat body. Take everything in `support_chat` from `if not support_bot_service.is_configured:` through the final `return APIResponse(...)` and move it into a module-level helper (place it just above `@router.post("/chat", ...)`):

```python
async def _run_chat(body: SupportChatRequest) -> APIResponse:
    """Shared brain for /chat (authed) and /public-chat (anonymous)."""
    if not support_bot_service.is_configured:
        raise HTTPException(
            status_code=503, detail="Ask Skip is not available right now"
        )

    # Conversation cap: beyond this the answer is always "talk to a human",
    # so skip the model entirely (zero AI spend on runaway threads).
    user_turns = sum(1 for t in body.messages if t.role == "user")
    if user_turns > MAX_USER_TURNS_PER_CONVERSATION:
        return APIResponse(
            success=True,
            message="ok",
            data={
                "reply": CAPPED_REPLY,
                "suggest_human": True,
                "truncated": False,
                "conversation_capped": True,
            },
        )

    prepared = _prepare_messages(body.messages)

    try:
        result = await asyncio.to_thread(support_bot_service.answer, prepared)
    except openai.RateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Skip is a little overwhelmed — try again in a minute.",
        )
    except openai.APIConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Skip couldn't be reached — try again shortly.",
        )
    except openai.APIStatusError as e:
        logger.error(f"Ask Skip upstream error: {e}")
        raise HTTPException(
            status_code=502, detail="Skip hit a snag — try again shortly."
        )
    except Exception as e:
        logger.error(f"Ask Skip chat failed: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong")

    return APIResponse(
        success=True,
        message="ok",
        data={**result, "conversation_capped": False},
    )
```

3c. `support_chat` becomes a thin authed wrapper (keep its decorators and signature exactly as they are):

```python
@router.post("/chat", response_model=APIResponse)
@limiter.limit(CHAT_RATE_LIMIT)
async def support_chat(
    request: Request,
    body: SupportChatRequest,
    user: dict = Depends(verify_token_with_rate_key),
):
    return await _run_chat(body)
```

3d. Add the public endpoint directly below it. No auth dependency: `verify_token_with_rate_key` never runs, so `request.state.user_id` is never stamped and slowapi's key function falls back to the client IP.

```python
@router.post("/public-chat", response_model=APIResponse)
@limiter.limit(PUBLIC_CHAT_RATE_LIMIT)
async def public_support_chat(request: Request, body: SupportChatRequest):
    """Anonymous Ask Skip chat for the marketing site (www.dryvwayinc.com).

    Same brain and guardrails as /chat, but no auth — rate-limited per IP,
    tighter than the per-user in-app limits.
    """
    return await _run_chat(body)
```

3e. Update the module docstring's first line to mention the public endpoint, e.g. `"""Ask Skip support endpoints: public FAQs, guarded AI chat, anonymous marketing-site chat, human escalation.`

- [ ] **Step 4: Run the new tests**

Run: `cd /Users/aariziqbal/Desktop/Coding/parking/backend && python -m pytest tests/test_support.py -k public_chat -v`
Expected: 4 PASS.

- [ ] **Step 5: Run the whole support suite** (the `/chat` refactor must not break existing tests)

Run: `cd /Users/aariziqbal/Desktop/Coding/parking/backend && python -m pytest tests/test_support.py -v`
Expected: ALL PASS (existing `/chat`, `/faqs`, `/escalate`, rate-limit tests included).

- [ ] **Step 6: Commit (parking repo)** — check `git -C /Users/aariziqbal/Desktop/Coding/parking status` and current branch first; stage only these two files:

```bash
git -C /Users/aariziqbal/Desktop/Coding/parking add backend/app/routers/support_router.py backend/tests/test_support.py
git -C /Users/aariziqbal/Desktop/Coding/parking commit -m "Add anonymous /api/support/public-chat for the marketing site

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Do NOT push yet — pushing is Task 2 (it triggers the Render production deploy).

---

### Task 2: Deploy backend + CORS (contains a user-blocking step)

**Files:** none (git push + Render dashboard + curl only)

**Interfaces:**
- Consumes: Task 1's committed endpoint.
- Produces: live `https://dryvway-app.onrender.com/api/support/public-chat` reachable from origin `https://www.dryvwayinc.com`. Tasks 4–6 depend on this being live.

- [ ] **Step 1: Confirm with the user, then push the parking repo** (push = production deploy via Render `autoDeploy: true`). Push the branch the commit is on; if the repo's default branch is what Render tracks and the commit is elsewhere, surface that to the user instead of guessing.

```bash
git -C /Users/aariziqbal/Desktop/Coding/parking push
```

- [ ] **Step 2: Wait for Render deploy, then verify the endpoint live** (deploys take a few minutes; poll `/health` first):

```bash
curl -s https://dryvway-app.onrender.com/health
curl -s -X POST https://dryvway-app.onrender.com/api/support/public-chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What is Dryvway?"}]}'
```

Expected: second command returns `{"success":true,...,"data":{"reply":"...",...}}` with a real Skip answer (this consumes one OpenAI call — that's fine, do it once). A 404 means the deploy hasn't finished or didn't pick up the commit.

- [ ] **Step 3: Ask the user to update CORS** — this is a manual dashboard step only they can do:

> In the Render dashboard → `dryvway-backend` service → Environment → edit `CORS_ORIGINS` and add `https://www.dryvwayinc.com` and `https://dryvwayinc.com` (comma-separated with the existing values). Save (service restarts).

- [ ] **Step 4: Verify CORS preflight after the user confirms:**

```bash
curl -s -i -X OPTIONS https://dryvway-app.onrender.com/api/support/public-chat \
  -H 'Origin: https://www.dryvwayinc.com' \
  -H 'Access-Control-Request-Method: POST' | head -20
```

Expected: response headers include `access-control-allow-origin: https://www.dryvwayinc.com`.

---

### Task 3: Port the Skip mascot into the marketing repo

**Files:**
- Create: `src/app/_skip/SkipMascot.tsx` (copied + edited)
- Create: `src/app/_skip/skipPoses.ts` (copied verbatim)
- Create: `src/app/_skip/SkipMascot.module.css` (copied verbatim)
- Create: `src/app/_skip/cn.ts`

**Interfaces:**
- Consumes: `C` from `src/app/theme.ts`; `clsx` + `tailwind-merge` (already in package.json).
- Produces: `export function SkipMascot(props: SkipMascotProps)` with props `{ pose: SkipPose; variant?: 'inline' | 'splash'; open?: boolean; showLabel?: boolean; label?: string; sublabel?: string; className?: string }` and `export type SkipPose = 'idle' | 'searching' | 'loading' | 'confirmed' | 'celebrating'`. Task 5 renders `<SkipMascot pose={...} variant="inline" showLabel={false} />`.

- [ ] **Step 1: Copy the three files**

```bash
mkdir -p /Users/aariziqbal/Desktop/Coding/dryvwaywebsite/src/app/_skip
cp /Users/aariziqbal/Desktop/Coding/parking/parking-web-app/components/skip/SkipMascot.tsx \
   /Users/aariziqbal/Desktop/Coding/parking/parking-web-app/components/skip/skipPoses.ts \
   /Users/aariziqbal/Desktop/Coding/parking/parking-web-app/components/skip/SkipMascot.module.css \
   /Users/aariziqbal/Desktop/Coding/dryvwaywebsite/src/app/_skip/
```

(Do NOT copy the `.test.` files — this repo has no test runner.)

- [ ] **Step 2: Create `src/app/_skip/cn.ts`** (same helper the app uses; deps already installed):

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Edit `src/app/_skip/SkipMascot.tsx` imports and tokens** (4 exact substitutions):

| Old (from the app) | New (marketing repo) |
|---|---|
| `import { cn } from '@/lib/cn'` | `import { cn } from './cn'` |
| `import { tokens } from '@/lib/designTokens'` | `import { C } from '../theme'` |
| `'--skip-amber': tokens.color.amber,` | `'--skip-amber': C.amber,` |
| `'--skip-ink': tokens.color.slate,` | `'--skip-ink': C.slate,` |
| `'--skip-highlight': tokens.color.card,` | `'--skip-highlight': C.paper,` |
| `'--skip-bounce': tokens.motion.easing.bounce,` | `'--skip-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',` |

(The palette values are identical — `#E8A040` amber, `#2C2C2A` slate, white card/paper — so the mascot looks the same; the label block's Tailwind classes never render because Task 5 always passes `showLabel={false}`.)

- [ ] **Step 4: Typecheck**

Run: `cd /Users/aariziqbal/Desktop/Coding/dryvwaywebsite && npx tsc --noEmit`
Expected: no errors (pre-existing errors, if any, must not come from `src/app/_skip/`).

- [ ] **Step 5: Commit**

```bash
git add src/app/_skip/SkipMascot.tsx src/app/_skip/skipPoses.ts src/app/_skip/SkipMascot.module.css src/app/_skip/cn.ts
git commit -m "Port the animated Skip mascot from parking-web-app

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: API client — `src/app/_skip/skipApi.ts`

**Files:**
- Create: `src/app/_skip/skipApi.ts`

**Interfaces:**
- Consumes: the live endpoints from Tasks 1–2.
- Produces (Task 5 imports all of these):
  - `SUPPORT_EMAIL: string`, `MAILTO_HREF: string`
  - `interface SupportFaq { id: string; category: string; question: string; short_answer: string }`
  - `interface ChatTurn { role: "user" | "assistant"; content: string }`
  - `interface ChatReply { reply: string; suggest_human: boolean; truncated: boolean; conversation_capped: boolean }`
  - `class SkipApiError extends Error { status: number }`
  - `fetchFaqs(): Promise<SupportFaq[]>`, `sendChat(messages: ChatTurn[]): Promise<ChatReply>`
  - `loadThread(): { messages: ChatTurn[]; suggestHuman: boolean }`, `saveThread(messages: ChatTurn[], suggestHuman: boolean): void`

- [ ] **Step 1: Write the file** — full content:

```ts
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

export function loadThread(): { messages: ChatTurn[]; suggestHuman: boolean } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.messages)) {
        return {
          messages: parsed.messages,
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/_skip/skipApi.ts
git commit -m "Add Ask Skip API client for the marketing site

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: The widget — `src/app/_skip/SkipWidget.tsx`

**Files:**
- Create: `src/app/_skip/SkipWidget.tsx`

**Interfaces:**
- Consumes: `SkipMascot` (Task 3), everything from `skipApi.ts` (Task 4), `C`/`F` from `../theme`.
- Produces: `export function SkipWidget()` — self-positioning (fixed bottom-left), no props. Task 6 mounts it in the root layout.

Behavior requirements (from the spec) that the code below implements — verify each survives any edits:
1. Launcher always visible bottom-left; toggles the panel; `aria-label`.
2. Panel: desktop ≈380px anchored above the launcher; mobile (≤767px) full-width bottom sheet.
3. First open shows Skip's greeting + FAQ quick-chips (from `/faqs`, fetched once); tapping a chip sends that question. FAQ fetch failure just hides the chips.
4. Free-form input; Enter sends; empty/whitespace never sends; input disabled while sending.
5. While waiting: mascot pose `loading` + "Skip is thinking…" bubble.
6. `suggest_human` or `conversation_capped` → show the mailto button.
7. Errors: 429 → "Skip needs a breather — try again in a minute."; anything else → "Skip couldn't be reached — try again shortly." The failed user turn is rolled back and restored into the input for retry.
8. Thread persists via `loadThread`/`saveThread` on every change.

- [ ] **Step 1: Write the component** — full content:

```tsx
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
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. (If `SkipMascot`'s `variant="inline"` sizing looks off inside the 64px launcher during Task 6's browser check, the fix belongs there — this task only needs types/lint green.)

- [ ] **Step 3: Commit**

```bash
git add src/app/_skip/SkipWidget.tsx
git commit -m "Add Ask Skip chat widget (bottom-left launcher + panel)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Mount in the root layout + full local verification

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `SkipWidget` from Task 5.
- Produces: the widget on every page of the site.

- [ ] **Step 1: Edit `src/app/layout.tsx`** — add the import and mount (the only two changed lines):

```tsx
import { SkipWidget } from "./_skip/SkipWidget";
```

and in the body:

```tsx
      <body className={`${inter.variable} ${sourceSerif.variable}`}>
        {children}
        <SkipWidget />
      </body>
```

- [ ] **Step 2: Run the dev server on an explicit port**

Run: `cd /Users/aariziqbal/Desktop/Coding/dryvwaywebsite && npm run dev -- -p 3100` (background)

- [ ] **Step 3: Browser-verify against the LIVE backend** (Task 2 must be done; localhost isn't in CORS_ORIGINS, so if chat is blocked by CORS locally, verify FAQs/chat via the deployed site in Task 7 and check everything else locally). Check at `http://localhost:3100`:
  - Launcher sits bottom-left on desktop width and does not overlap any existing landing content; desktop landing layout otherwise unchanged.
  - Panel opens/closes; greeting + FAQ chips appear; chip click sends the question; free-form chat gets a real Skip reply; "Skip is thinking…" shows while waiting.
  - Navigate landing → /privacy and back: thread persists.
  - Mobile width (≤767px): panel is a full-width bottom sheet.
  - Force an error (e.g. temporarily change `SUPPORT_API` to a bad host in the running session, or go offline): error message shows, the typed message returns to the input, no crash. Revert any temporary change.

- [ ] **Step 4: Production build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "Mount Ask Skip widget site-wide

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Deploy and live verification

**Files:** none (deploy + browser only)

- [ ] **Step 1: Deploy to production**

Run: `cd /Users/aariziqbal/Desktop/Coding/dryvwaywebsite && vercel --prod`

- [ ] **Step 2: Verify on the live site** at https://www.dryvwayinc.com:
  - Widget appears bottom-left; open it; send one real question ("How do I list my driveway?"); confirm a grounded Skip reply (this is the end-to-end CORS + endpoint proof).
  - Ask something clearly off-topic or account-specific ("cancel my booking") → reply should offer the human team and the "Email support@dryvwayinc.com" button should appear; clicking it opens a mail draft.
  - Quick check on a phone-sized viewport.

- [ ] **Step 3: Report results to the user** — what was deployed, what was verified, and remind them the widget's chat now spends OpenAI credits at up to 5 msgs/min per visitor IP.
