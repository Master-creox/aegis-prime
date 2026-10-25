# AEGIS PRIME — Personal AI HUD (v0.1)

A personal AI assistant dashboard inspired by the futuristic HUD in the "Stonic AI" Reel Akash shared on 2026-10-25 — built as original code, not a copy of that creator's project. Open `index.html` in any modern browser. No server, no API key, no install needed. Chat, memory and notes are stored only in the browser's localStorage on the user's own device.

## What it does (all working in v0.1)

- **Glowing AI core orb** — states: Idle, Listening, Thinking, Terminated. The orb pulses, spins while thinking, and greys out on Terminate.
- **Left control panel, like the video HUD** — CHAT, MEMORY, SKILLS, CHARACTER, SETTING, AGENTS.
- **TERMINATE button** — stops speech, cancels the current task, and puts the core into Terminated state until WAKE is pressed again.
- **WAKE / LISTEN** — tries the browser's built-in Speech Recognition (Chrome/Edge) and speaks replies with Speech Synthesis when the voice toggle is on. If voice is not supported, typing works fully.
- **MEMORY** — `remember that …` saves a fact, `recall …` / `what is …` retrieves it, `note …` saves a note. Facts and notes persist in localStorage and are listed in the Memory panel.
- **SKILLS (real, not fake)** — time/date, calculator (`calc 12*8+5`), password strength check (`password check DemoPass123!`), system info, cybersecurity tips.
- **CHARACTER** — Friendly (casual Hinglish), Formal (Jarvis style), Focus (short & direct). Character changes tone only, never the facts.
- **AGENTS** — requests are routed and labelled: Guard (security words), Scout (memory/plan words), Sage (explain/what-is words), Core (everything else).
- **SETTINGS** — rename the AI, change the accent colour (cyan/green/purple), turn voice on/off, clear all memory.
- **LIVE LOG + STATUS** — right panel logs every message, agent routing, panel change and Terminate/Wake, with a live clock and memory counts.

## Try it

1. Open `index.html`.
2. Type `help`, then try: `time`, `calc 12*8`, `password check MyPass123`, `remember that my laptop is at repair`, `recall laptop`, `tip`, `system`.

## Honest limits (v0.1)

- The brain is rule-based and runs fully in the browser — it is **not** a real LLM, and it does not do real threat scanning, real gesture control, or real device control. Those are future phases, not v0.1 claims.
- Voice recognition/speech depend on the browser; on phones it may ask for microphone permission.
- Nothing leaves the device: no server calls, no account, no data upload.

## Roadmap ideas (not built yet)

Voice-first mode, a real LLM brain behind an API key (entered in-app only, never in code), webcam gesture control, and system/device actions behind explicit permissions — all as separate, opt-in phases.
