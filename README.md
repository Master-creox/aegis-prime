# AEGIS PRIME — Personal AI HUD (v0.6 VOICE)

## v0.6 voice improvement (2026-10-27)

Akash said the voice sounded very robotic. This version tackles that honestly —
it does **not** claim to turn a system voice into a neural voice.

### Why the old voice sounded robotic

The HUD speaks through the browser's built-in `SpeechSynthesis` voices — the
voices installed on the machine / shipped with the browser. Those are
formant-based system voices by design, so they sound flat and robotic
compared with modern neural voices. No setting in this file can magically
make a system voice neural. What v0.6 does is give Akash control to pick
the **least robotic voice actually available on his machine** and tune it.

### What's new in v0.6

- **Voice dropdown (SETTING panel):** populated at runtime from
  `speechSynthesis.getVoices()`, with a `voiceschanged` handler, because
  voices load asynchronously and are empty on first read in Chrome.
- **Rate slider:** 0.7–1.2, step 0.05, default **0.95** (slightly slower
  than 1.0 sounds less rushed and less robotic).
- **Pitch slider:** 0.7–1.3, step 0.05, default **1.05** (a touch higher
  than 1.0, less flat).
- **Test Voice button:** speaks "Namaste, main AEGIS PRIME hoon. Ye meri
  nayi awaaz hai." through the selected voice/rate/pitch, so Akash can
  compare voices before saving.
- **Auto-pick best default** when no voice is saved, by name matching
  (never assuming a voice exists):
  1. Google en-IN
  2. Google en-US
  3. Microsoft en-IN natural
  4. Microsoft en-US natural
  5. Microsoft en-IN
  6. Microsoft en-US
  7. Any en-IN
  8. Any en-GB / en-US
  9. First available voice / browser default
- Voice name (`voiceURI`), rate and pitch are saved in localStorage
  (`aegis_voice_name`, `aegis_voice_rate`, `aegis_voice_pitch`) via Save
  Settings, and restored on startup. If the saved voice is missing on a
  new machine, the auto-pick fallback is used instead of failing.
- `say()` now routes speech through one `speakClean()` helper that sets
  the selected voice, rate and pitch. Lip-sync start/stop wiring,
  blinking, head movement, moods, the CreoX LLM brain, local skills and
  memory are all unchanged from v0.5.1.

### How to pick a good voice (laptop steps)

1. `git pull`, then `npm start` (or open `index.html` in Chrome).
2. Open the SETTING panel → Voice section.
3. Try each voice with **Test Voice**. On most machines Chrome offers
   better Google voices than Electron's system voices — if a voice
   sounds robotic in Electron, try the same page in Chrome.
4. Recommended starting settings: **rate 0.95, pitch 1.05**. Then adjust
   in small steps (0.05 at a time) — big jumps sound worse, not better.
5. Press **Save Settings** once you like a voice.

### Known limits (honest)

- **Electron voice may still fail.** The known Electron limitation is
  unchanged: speech upload can fail with Error -2 in Electron, while
  Chrome voice usually works. Typing works fully in both.
- **This is still a system voice.** Even the best available system
  voice will not sound like a human or like a neural assistant voice.
- **Truly natural voice = later phase, not built here.** Two real
  options, both need extra setup:
  - **Cloud neural TTS** (e.g. Google Cloud TTS / similar): natural
    voices, but needs an API key and has a cost — the key must live
    in-app only, never in the repo.
  - **Local neural TTS on the laptop** (e.g. Piper): private, no key
    and no cost, but needs a laptop install and a voice model download.
  Neither is included in v0.6; Akash can pick one as the next voice phase.

### v0.5.1 fix (kept from the previous version)

" What is ...?" questions were treated as local memory lookups, so they
never reached the CreoX brain. Now: if the question matches a saved
local fact, memory answers first; otherwise the question goes to the
CreoX brain when it is ON. Test with "What is phishing?" — it should
reply "via CreoX brain".

### v0.5 LLM (kept)

Real brain via Akash's own Master CreoX API
(`POST /api/v1/chat/completions`, model `creox`). The HUD key is a
dedicated chat-scoped key saved only in localStorage — never the admin
key, never hardcoded. Local skills and memory run first; the API is for
open questions, with a rule-based fallback on 401/429/timeout
(90-second timeout covers Render free-service sleep).
