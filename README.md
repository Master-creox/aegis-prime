## v0.8.0 local STT — WAKE Error -2 fix (2026-10-27)

### The problem this fixes
In Electron, WAKE used browser SpeechRecognition, which uploads mic audio to a
cloud speech service that Electron has no key for — so it failed with
`chunked_data_pipe_upload_data_stream.cc(217) OnSizeReceived failed with Error: -2`.
Piper (speaking, output) was already local and unaffected; this was the INPUT
(listening) side. v0.8.0 removes the cloud call from the Electron WAKE path
entirely: the mic is recorded in the app to a 16 kHz mono WAV and transcribed
on the laptop by Python + Vosk (offline). Nothing is uploaded anywhere.

### Laptop install steps (one at a time, in this order)
1. **Python** — install Python 3.10 or 3.11 from python.org. During install,
   tick "Add python.exe to PATH". Check in Command Prompt: `py --version`
   (if `py` is missing, `python --version` also works — the app tries
   `py`, then `python`, then `python3`).
2. **Vosk package** — in Command Prompt:
   `py -m pip install vosk`
   (if `py` is missing, use `python -m pip install vosk`.)
3. **Models** — from https://alphacephei.com/vosk/models download:
   - English: `vosk-model-small-en-us-0.15.zip`
     (https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip)
   - Hindi: `vosk-model-small-hi-0.22.zip`
     (https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip)
   Unzip each, and place the folders here (rename them to exactly `en` / `hi`):
   - `C:\Users\Master_Creox\aegis-prime\stt-models\en\`
   - `C:\Users\Master_Creox\aegis-prime\stt-models\hi\`
   Each folder must contain the model files (e.g. `am`, `conf`, `graph`
   subfolders/files) — do NOT put the zip itself in there, and do NOT nest
   an extra folder inside (wrong: `stt-models\en\vosk-model-small-en-us-0.15\…`).
4. **Run the app** — in `C:\Users\Master_Creox\aegis-prime`:
   `git pull` then `npm start`.
5. **Check** — SETTING → STT Engine = Auto (default) → Save Settings →
   **Test Local STT Setup**. It must say "Local STT ready" (English model
   found; Hindi model found if you installed it). Then press **WAKE**, speak
   for a few seconds, press WAKE again to stop early (or wait 10 seconds —
   it stops by itself), and your words should appear as a chat message.

### How WAKE now works
- **Electron (the app)**: WAKE → mic recorded locally → 16 kHz mono WAV →
  `stt_transcribe.py` (in the app folder, committed code) → Vosk model →
  transcript goes into the chat and is answered. Browser SpeechRecognition
  is never called in Electron, so Error -2 cannot occur on this path.
- **Chrome (file-open, no Electron bridge)**: WAKE keeps the old browser
  SpeechRecognition path (Chrome has the cloud service built in, so it
  works there). With STT Engine = "Local STT hi", Chrome instead falls back
  to typing with an honest message, because local STT needs the app.
- **If local STT is missing or fails** (no Python, no vosk, no model, empty
  recording): WAKE shows an honest reason in the log/status and asks you to
  type — it never invents a transcript, never loops, never crashes.

### Language rule (same as Piper, dual-model principle)
English speech → English model, Hindi speech → Hindi model, chosen from the
Language dropdown (SETTING → Piper voice language): Hindi always → Hindi
model, otherwise English model. **Auto limitation, honestly:** spoken
language cannot be known before transcription, so Auto defaults to English
for STT. If you speak Hindi, set Language to **Hindi always** first.

### Honest limits
- First transcription per model is slower (model load; 60s timeout).
- Vosk small models are moderate-accuracy, not cloud-grade: speak clearly,
  close to the mic, in a quiet room; technical words and names may be
  misheard. The bigger Vosk models are more accurate but much larger.
- Transcripts come out lowercase without punctuation — that is normal for
  small Vosk models; commands still work (the app lowercases commands anyway).
- STT is Electron-only, like Piper. Chrome file-open cannot run local
  programs, so Chrome WAKE stays on browser recognition.
- `stt-models/`, `*.wav`, `*.onnx`, `*.onnx.json`, `piper/`, `voices/` are
  gitignored — models and audio are never committed to the repo.

## v0.7.3 PURE-language system replies (2026-10-27)

Akash's principle, stated twice: "Hindi matlab Hindi hota hai, English matlab
English hota hai" — no Hinglish mixing in system replies.

- Reply language follows the Language dropdown (piperLangMode): 'hi' -> pure
  Devanagari Hindi, anything else (including Auto) -> pure English. Auto
  defaults to English for system replies because the CreoX brain answers in
  English.
- A PURELANG dictionary (en/hi pairs) plus a t(key) helper is wired into the
  spoken/chat system messages: settings saved, memory saved/cleared/found/
  not-found, session terminated / wake, voice not heard / not supported,
  voice test not supported, confirm-clear-memory, brain empty reply,
  rule-based fallback, Guard/Sage fallback, help reply, CreoX status /
  connection test, and Piper bridge/test status. Command keywords (help,
  time, calc, password check, remember that, recall, note) are literal
  commands and are never translated; proper names (AEGIS PRIME, CreoX) and
  technical terms stay as-is.
- Startup greeting (v0.7.2) is unchanged: Good Morning in English mode,
  Namaste in Devanagari in Hindi mode. Test button texts (v0.7.2) are
  unchanged.
- DELIBERATE SCOPE LIMITS (not bugs): (1) The CreoX brain's own replies are
  NOT translated — in Hindi mode they still arrive in English, with a Hindi
  system intro where applicable, because the brain has no Hindi KB; full
  Hindi brain answers are a later KB phase. (2) LIVE LOG lines keep their
  existing style and are not localized. (3) Skill content replies (time,
  tip, calc result, password score, system info) and the character tone
  prefix (jarvis "Sir, ") are unchanged. (4) The static initial
  creoxStatus HTML line is overwritten by creoxRefreshStatus() on startup
  with the localized text.

## v0.7.2 greeting (2026-10-27)

Language-correct greetings: English mode/test buttons say 'Good morning, I am AEGIS PRIME...' in English; Hindi mode/test says 'Namaste' in Devanagari Hindi. Startup greeting follows the Language dropdown (Hindi always -> Namaste in Devanagari, otherwise Good Morning in English).

# AEGIS PRIME — Personal AI HUD (v0.7.1 PIPER DUAL)

## v0.7.1 dual-model Piper voice — English wale English, Hindi wale Hindi

Akash ka principle: **"english wale english hi bole ge or hindi wale hindi"**.
Is version me Piper ke **do model** chalte hain — ek English ke liye, ek
Hindi (Devanagari) ke liye — aur Aegis khud pehchan kar sahi model chun
leta hai. v0.7 ka Piper, v0.6 ka system-voice picker, animated character,
lip-sync, moods aur CreoX LLM brain — sab wahi rehte hain.

### Dual-model rule (seedhe shabdon me)

1. Aegis bolne se pehle jawab ka text dekhta hai.
2. HTML tags hatane ke baad, Devanagari aksharon (U+0900–U+097F) ki
   ginti karta hai.
3. **Agar Devanagari akshar, kul aksharon (Latin + Devanagari) ke 30%
   se zyada hon → Hindi model.** Warna → English model.
4. Examples:
   - `Hello, how are you?` → English model
   - `नमस्ते, मैं AEGIS PRIME हूँ।` → Hindi model (Devanagari share
     30% se zyada hai, chahe beech me "AEGIS PRIME" English me hi kyun
     na likha ho)
   - `kya haal hai, sab theek hai?` (Roman Hinglish) → English model
     — isme koi Devanagari akshar nahi hai, isliye detection isko
     English hi samjhega. Ye v0.7.1 ki jaanboojh kar rakhi gayi limit
     hai (neeche dekho).
5. **Manual override bhi hai:** Settings me "Piper voice language"
   dropdown hai — Auto (default, upar wala rule), "English model hi
   (hamesha)", ya "Hindi model hi (hamesha)". Agar Roman Hinglish ko
   Hindi model se bulwana ho, to Language ko Hindi par set karo, phir
   Save karo. Test buttons is override ko bypass karte hain: Test Piper
   Voice hamesha English model test karta hai, Test Hindi Voice hamesha
   Hindi model test karta hai.

### Fallback (kuch missing ho to chup nahi rahega)

- Chuna hua model (file ya uski `.onnx.json`) na mile → dusra model
  try hota hai, aur log me wajah likhi aati hai.
- Dono model na milen, ya Piper fail ho, ya page Chrome me khola ho
  (koi bridge nahi) → v0.6 wali system voice se jawab bolega.
- Spoken text saaf karke Piper ko bheja jata hai: HTML tags/badges aur
  emoji/symbols hataye jaate hain, taaki pronunciation na bigde. Chat
  me dikhne wala text bilkul nahi badalta — sirf bola jaane wala text
  saaf hota hai.

### Laptop install steps (Akash does these on his own PC)

**Step 1 — Piper binary (pehle se installed ho to skip karo):**

1. Piper ke GitHub releases page par jao.
2. `piper_windows_amd64.zip` download karo, app folder me unzip karo,
   taaki structure aisa ho: `aegis-prime/piper/piper.exe` (+ DLLs).
3. Settings me Piper exe path waise hi rehne do: `piper/piper.exe`.

**Step 2 — English voice model (pehle se installed ho to skip karo):**

1. Hugging Face par `rhasspy/piper-voices` repo kholo.
2. Path: `en/en_US/lessac/medium/` — dono files chahiye:
   - `en_US-lessac-medium.onnx` (~63 MB)
   - `en_US-lessac-medium.onnx.json`
3. Dono ko `aegis-prime/voices/` me rakho.
4. Settings me English model path waise hi rehne do:
   `voices/en_US-lessac-medium.onnx`

**Step 3 — Hindi voice model (naya, v0.7.1 ke liye):**

1. Usi `rhasspy/piper-voices` repo me path: `hi/hi_IN/pratham/medium/`
2. Dono files chahiye — sirf `.onnx` kaafi nahi:
   - `hi_IN-pratham-medium.onnx`
   - `hi_IN-pratham-medium.onnx.json`
3. Dono ko `aegis-prime/voices/` me rakho (English model ke saath):
   ```
   aegis-prime/
     voices/
       en_US-lessac-medium.onnx
       en_US-lessac-medium.onnx.json
       hi_IN-pratham-medium.onnx
       hi_IN-pratham-medium.onnx.json
   ```
4. Settings me Hindi model path waise hi rehne do:
   `voices/hi_IN-pratham-medium.onnx`
5. Pehle samples suno: `rhasspy.github.io/piper-samples` — jo awaaz
   pasand aaye, wahi model lo. Default yahan `hi_IN-pratham-medium`
   rakha hai, kyunki ye Piper catalog ki Hindi voice hai.

**Step 4 — Settings me dual-model on karo:**

1. `git pull`, phir `npm start` (Electron app — Chrome me file khol
   kar Piper nahi chalega, kyunki Chrome koi local program nahi chala
   sakta).
2. SETTING panel → Voice Engine: **Piper local — Electron only**.
3. English model path, Hindi model path aur Language (Auto) check karo.
4. **Save Settings** dabao.
5. **Test Piper Voice** dabao (English test) aur **Test Hindi Voice**
   dabao (Devanagari test: "नमस्ते, मैं AEGIS PRIME हूँ।").
   - Dono OK aaye → dual-model chal raha hai.
   - Koi fail aaya → status line me wajah dikhegi (exe/model/JSON
     missing) — usko theek karo, phir test karo. Tab tak replies
     system voice se bolenge.

### What is NOT committed to GitHub (by design)

`.gitignore` me ye sab blocked hai:

- `piper/` — Piper binary + DLLs
- `voices/` — saare voice models (English + Hindi)
- `*.wav`, `*.onnx`, `*.onnx.json`

GitHub par sirf code jayega (`index.html`, `main.js`, `preload.js`,
`package.json`, README). Piper aur models Akash apne laptop par alag se
install karega, upar wale steps se.

### Known limits (honest)

- **Roman Hinglish English model se hi bolegi** (Auto mode me) —
  kyunki detection sirf aksharon ko dekhta hai, matlab ko nahi. Hindi
  model chahiye to Language dropdown ko Hindi par set karo, ya
  Devanagari me likho.
- **Koi en-IN (Indian English) Piper voice hone ka daava nahi kiya
  gaya hai.** Hindi model Hindi (Devanagari) ke liye hai, Indian
  English ke liye nahi.
- **Piper neural hai, par halka model hai** — bade cloud voices jitna
  natural nahi lagega, par system voices se clearly behtar hai. Yehi
  free/offline ka trade-off hai.
- **Pehli generation slow ho sakti hai** — model load hone me kuch
  seconds lagte hain (har model pehli baar). Timeout 60 seconds hai.
- **Electron only** — Chrome me Piper mode kaam nahi karega; wahan
  system voice fallback chalega. Piper mode par Electron ki purani
  voice limitation (speech upload Error -2) lagu nahi hoti, kyunki
  Piper local audio banata hai.
- **Lip-sync rhythm-based hai** — mouth audio ke saath khulta-band
  hota hai, phoneme-perfect visemes nahi hain.
- **IPC design v0.7 jaisa hi hai** — main.js me koi naya IPC nahi
  bana; `piper-speak`/`piper-available` pehle se hi model argument
  lete the, isliye renderer sirf sahi model ka naam bhejta hai. Text
  stdin se bheja jata hai (koi shell string interpolation nahi).
- Live GUI test laptop par hi hoga — Akash ka sunna hi final check hai.

### Files in this version

- `index.html` — v0.7.1 HUD (dual-model Piper + v0.6 voice + v0.5.1
  LLM brain + animated character)
- `main.js` — Electron wrapper + Piper IPC handlers (`piper-speak`,
  `piper-available` — model argument pehle se supported, unchanged)
- `preload.js` — contextBridge: `window.aegisPiper = { speak,
  isAvailable }`
- `package.json` — version 0.7.1, Electron wrapper (koi naya
  dependency nahi)
- `.gitignore` — piper/, voices/, *.wav, *.onnx, *.onnx.json
