## v0.5.1 fix (2026-10-27)

Bug fix: 'What is ...?' questions were treated as local memory lookups, so they never reached the CreoX brain (reply was 'memory me kuch nahi mila'). Now: if the question matches a saved local fact, memory answers first; otherwise the question goes to the CreoX brain when it is ON. Test with 'What is phishing?' — it should now reply 'via CreoX brain'.

# Aegis Prime — Personal AI HUD (v0.5 LLM)

Single-file HUD (`index.html`) with an animated SVG swordsman character
(lip-sync, blinking, head movement, breathing, moods) and, new in v0.5,
a **real LLM brain via Akash's OWN Master CreoX API** — no third-party
LLM, no sheet photos, no binary images.

## The brain: Master CreoX API (own, self-reliant)

- Live base: `https://master-creox-api.onrender.com` (v0.5.0, production).
- Chat endpoint: `POST {base}/api/v1/chat/completions`
  - Header: `X-API-Key: <dedicated chat key>`
  - Body: `{"model":"creox","messages":[{"role":"user","content":"..."}],"session_id":<int or null>}`
  - Response: `{"reply":"...","model":"creox","usage":{...},"session_id":<int>}`
  - The returned `session_id` is saved in localStorage
    (`aegis_creox_session_id`) and sent with later messages, so the
    conversation keeps context.
- The engine behind model `creox` is **CreoXEngine**: deterministic,
  offline, key-free on the server side, built around a cybersecurity
  knowledge base. That is a strength for a security HUD — and an honest
  limit (see below).

## How to create the dedicated chat key (README only — never in code)

1. Authenticate to the API as admin (bootstrap key) or as a JWT user.
2. Create a key scoped to chat only:
   `POST {base}/api/v1/keys` with body
   `{"name":"aegis-prime","scopes":["chat"]}`
3. The returned `mcx_` key is **shown only once**. Save it somewhere
   safe, then paste it into the HUD: sidebar **SETTING → LLM Brain —
   Master CreoX API → API Key**.
4. **NEVER paste the admin key into the HUD.** The HUD must only ever
   hold a dedicated chat-scoped key like the one above.

## Using the brain in the HUD

- In **SETTING**, set the API Base URL (default
  `https://master-creox-api.onrender.com`), paste the dedicated chat
  key, tick **"Use CreoX API brain for open questions"**, then click
  **Save Settings**.
- **Brain default is OFF** until a key is saved, so the HUD works out
  of the box with rule-based replies only.
- **Test Connection** calls `GET {base}/api/v1/models` with your key
  and reports OK / failed (with the status, e.g. 401 for an invalid
  key). The key value is never shown in the status, the log, or chat.
- When the brain is ON and a key is saved, open questions go to the
  API: state shows **"THINKING — CREOX BRAIN…"**, the reply appears
  with a **Core** badge and a small **"via CreoX brain"** note in the
  log.
- **Local first, always:** time/date, calculator, password strength,
  system info, and memory commands (`remember that…`, `recall…`,
  `note…`) are handled locally before any API call. The API is for
  open questions, not for replacing local skills/memory.

## Render sleep + timeout + fallback

- Render free services **sleep when idle**, so the **first request
  after sleep can take ~1 minute**. The HUD uses a **90-second
  timeout** (AbortController) and shows the "THINKING — CREOX BRAIN…"
  state while waiting — do not press SEND twice.
- **On any failure the HUD falls back to its existing rule-based
  reply** and logs the honest reason, without ever logging the key:
  - No key saved / brain OFF → rule-based replies only.
  - **401** invalid key → "CreoX brain unavailable (401) — rule-based
    reply used" (check the key, re-paste the dedicated chat key).
  - **429** rate limit → same fallback; wait and retry.
  - Network error / **timeout (90s)** → same fallback; Render may
    still be waking up — retry once.
  - Empty API reply → rule-based reply, logged as such.

## Where the key lives

- Only in the laptop's browser/Electron **localStorage**:
  `aegis_creox_base`, `aegis_creox_key`, `aegis_creox_brain`,
  `aegis_creox_session_id`.
- **Never in the repo, never in `index.html`** — grep the file for
  `mcx_` and you will find nothing. If you share the folder, remove
  the key from Settings first (or clear site data).

## Honest limits

- CreoXEngine is **cybersecurity-focused and deterministic**. For
  questions inside its knowledge base it gives a real, on-topic
  answer. For general chit-chat outside that KB it returns its honest
  fallback reply — it does not pretend to be a general-purpose LLM.
  Small talk (greetings, time/date, simple skills) stays local.
- Lip-sync is rhythm-based mouth cycling while speech plays, not
  phoneme-perfect visemes (no browser speech API gives phoneme
  timings).
- Electron voice limitation is unchanged: voice works in Chrome;
  in Electron, speech upload can fail (Error -2) and typing works
  fully.

## Run (desktop, same as v0.4)

```
cd C:\Users\Master_Creox\aegis-prime
git pull
npm start
```

After the v0.5 push, the C → D transfer (moving the whole project
folder to the D: drive) is a separate laptop step — the HUD code
itself does not change when the folder moves.
