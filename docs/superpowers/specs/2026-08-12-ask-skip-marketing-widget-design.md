# Ask Skip on the Marketing Site — Design

**Date:** 2026-08-12
**Status:** Approved by user
**Repos touched:** this repo (`dryvwaywebsite`, www.dryvwayinc.com) and the backend at
`/Users/aariziqbal/Desktop/Coding/parking/backend` (deployed on Render as `dryvway-backend`,
`https://dryvway-app.onrender.com`).

## Goal

Put the existing "Ask Skip" support chatbot on the public marketing site as a
dismissable widget fixed to the **bottom-left corner** of every page. Skip's brain
stays where it is today: the OpenAI-backed, FAQ-grounded `SupportBotService` on the
Render backend. The marketing widget is a new anonymous client for it.

## Decisions made during brainstorming

| Decision | Choice |
|---|---|
| Chatbot brain | Existing backend Skip service (real AI, FAQ-grounded) |
| Anonymous access | New public endpoint on the backend, no auth |
| Wiring | Browser calls Render directly; CORS updated |
| Human handoff | `mailto:support@dryvwayinc.com` button — no public escalate endpoint |
| Look | Port the animated Skip mascot from parking-web-app, recolored to the marketing palette |
| Placement | Fixed bottom-left, mounted site-wide via `layout.tsx` |

## Part 1 — Backend (parking repo)

New endpoint in `backend/app/routers/support_router.py`:

- **`POST /api/support/public-chat`**
  - Same request body as `/chat`: `{ "messages": [{ "role": "user"|"assistant", "content": str }] }`
    (1–30 turns, content 1–4000 chars).
  - Same response `data`: `{ reply, suggest_human, truncated, conversation_capped }`.
  - **No auth dependency** — anonymous. Rate-limited **per IP**: `5/minute;30/hour;60/day`
    (tighter than the in-app per-user `8/minute;60/hour;120/day`).
  - Reuses `_prepare_messages` (sanitize, window to 12 turns, must end on a user turn),
    the 15-user-turn conversation cap with `CAPPED_REPLY`, the same OpenAI error
    mapping to 502/503, and `SupportBotService.answer`.
- `GET /api/support/faqs` is already public (30/min per IP) and is used as-is.
  Payload per FAQ: `{ id, category, question, short_answer }`.
- **Test:** one pytest for `/public-chat` mirroring the existing `/chat` tests
  (mocked OpenAI service; asserts no-auth access, reply passthrough, cap behavior).
- **Deploy:** commit + push; Render `autoDeploy: true` picks it up. Verify with `curl`.

### Manual step (user, Render dashboard)

Add the marketing origins to the `CORS_ORIGINS` env var of the `dryvway-backend`
service: `https://www.dryvwayinc.com` and `https://dryvwayinc.com`. This var is
`sync: false` in `render.yaml`, so it cannot be set from the repo.

## Part 2 — Widget (this repo)

New folder `src/app/_skip/` (underscore prefix — no route is created):

- `SkipWidget.tsx` — client component: fixed bottom-left launcher + panel, chat
  state machine, fetch calls.
- `SkipMascot.tsx`, `skipPoses.ts`, `SkipMascot.module.css` — ported from
  `parking-web-app/components/skip/`, with the app's `designTokens`/`cn` imports
  replaced by this repo's `theme.ts` palette (warm/amber/slate) and local helpers.
- `skipApi.ts` — constants + fetch helpers. Backend base URL is a hardcoded
  constant `https://dryvway-app.onrender.com/api/support` (public URL; no env var).

Mounting: rendered once in `src/app/layout.tsx`, so it appears on the landing,
privacy, terms, and delete-account pages. Purely additive — the existing desktop
(≥1024px) landing layout stays byte-for-byte untouched apart from the new mount.

### Behavior

- **Launcher:** floating Skip-mascot button, fixed bottom-left. Click opens the
  panel; X (or clicking the launcher again) closes it. No hidden-state persistence —
  the launcher is always available.
- **Panel:** desktop ≈380px wide, anchored above the launcher; mobile: full-width
  bottom sheet. Styled with inline styles + the marketing palette, matching the
  site's idiom (Inter, serif italic accents optional).
- **Content:** FAQ quick-chips loaded once from `/faqs` on first open (tapping a
  chip asks Skip that question), plus a free-form text input. Replies render as
  plain text (backend guarantees no markdown).
- **Conversation persistence:** `sessionStorage`, so the thread survives page
  navigation but not a closed tab.
- **Human handoff:** when a reply has `suggest_human: true` (or the conversation is
  capped), show an **"Email support@dryvwayinc.com"** button — a `mailto:` link with
  a prefilled subject ("Dryvway support"). No transcript in the mailto body (URL
  length limits); no public escalate endpoint.
- **Errors:** HTTP 429 → "Skip needs a breather — try again in a minute." Network
  failure / 5xx → "Skip couldn't be reached — try again shortly." with the user's
  message preserved in the input for retry. While Skip is "typing", show a loading
  state on the mascot/panel.

## Part 3 — Rollout order

1. Backend: add endpoint + test, push, wait for Render deploy, `curl` verify.
2. User updates `CORS_ORIGINS` in the Render dashboard.
3. Marketing site: build widget, verify locally on an explicit port (the sibling
   parking app tends to occupy 3000) against the live backend, check mobile and
   desktop breakpoints, `npm run lint` + `npm run build`, then `vercel --prod`.

## Out of scope

- No public escalate/ticket endpoint, no email-capture form.
- No streaming responses (the backend chat is a single JSON reply today).
- No changes to the in-app HelpWidget or its endpoints.
- No analytics/tracking of chat usage.
