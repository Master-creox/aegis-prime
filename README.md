# AEGIS PRIME — Personal AI HUD (v0.7 PIPER)

## v0.7 local neural voice — Piper (free, offline, no key, no cost)

Akash chose the **local** route for a less robotic voice, because it is
free of cost. This version adds Piper — a small, CPU-only neural TTS
engine — as a voice engine inside the **Electron app**. The v0.6 system
voice picker, rate/pitch tuning, animated character, lip-sync, moods and
the CreoX LLM brain are all unchanged.

### How it works (short version)

1. Aegis speaks a reply.
2. If the Voice Engine is **Piper local** and the app runs in Electron,
   the renderer asks the preload bridge to generate audio.
3. Electron's main process runs `piper.exe` (argument array, text piped
   on stdin — never a shell string) and writes a WAV file to the OS temp
   folder. The renderer plays that WAV, with lip-sync starting on audio
   play and stopping on audio end.
4. If anything fails — Piper not installed, model missing, generation
   error, or the page was opened in Chrome (no bridge) — Aegis falls
   back to the v0.6 system voice and logs the honest reason. It never
   goes silent because Piper is missing.

### Laptop install steps (Akash does these on his own PC)

**Step 1 — Piper binary download karo (ek baar):**

1. Piper ke GitHub releases page par jao.
2. `piper_windows_amd64.zip` download karo (frozen binary — isme
   `piper.exe`, espeak-ng aur onnxruntime DLLs sab included hain).
3. Zip ko apne Aegis app folder me unzip karo, taaki structure aisa ho:
   ```
   aegis-prime/
     index.html
     main.js
     preload.js
     piper/
       piper.exe
       ... (baaki DLLs/files)
   ```
4. Settings me Piper exe path waise hi rehne do: `piper/piper.exe`
   (app folder se relative). Full path bhi chalega.

**Step 2 — Voice model download karo (ek baar, per voice):**

1. Hugging Face par `rhasspy/piper-voices` repo kholo.
2. Ek voice ke liye **dono files** chahiye — sirf `.onnx` kaafi nahi:
   - `en_US-lessac-medium.onnx` (~63 MB)
   - `en_US-lessac-medium.onnx.json` (uski matching config)
   Path pattern (repo me): `en/en_US/lessac/medium/`
3. Dono files ko app folder me `voices/` me rakho:
   ```
   aegis-prime/
     voices/
       en_US-lessac-medium.onnx
       en_US-lessac-medium.onnx.json
   ```
4. Settings me Piper model path waise hi rehne do:
   `voices/en_US-lessac-medium.onnx`

**Voice chunne se pehle samples suno:** `rhasspy.github.io/piper-samples`
par har voice ka sample sun sakte ho — jo sabse natural lage, wahi model
download karo. Default yahan `en_US-lessac-medium` rakha hai, kyunki ye
Piper ki sabse commonly used English voice hai.

**Hindi model ke baare me (honest note):** Piper ke catalog me ek Hindi
voice bhi milti hai — `hi/hi_IN/pratham/medium` (files:
`hi_IN-pratham-medium.onnx` + `.onnx.json`) — par ye **Hindi** hai,
Indian English (en-IN) nahi. Hinglish text (Roman script) ko English
model English pronunciation me padhega, aur Hindi model Devanagari text
ke liye bana hai. Isliye: English/Hinglish replies ke liye English model
se shuru karo, aur Hindi model ko alag se audition karke hi try karo.
Koi en-IN Piper voice hone ka daava yahan nahi kiya gaya hai.

**Step 3 — Settings me Piper on karo:**

1. `git pull`, phir `npm start` (Electron app — Chrome me file khol kar
   Piper nahi chalega, kyunki Chrome koi local program nahi chala sakta).
2. SETTING panel → Voice Engine: **Piper local — Electron only** chuno.
3. Piper exe path aur model path check karo (defaults upar wale hain).
4. **Save Settings** dabao.
5. **Test Piper Voice** dabao.
   - OK aaya → local neural voice chal rahi hai.
   - Fail aaya → status line me wajah dikhegi (exe nahi mila / model
     nahi mila / .onnx.json nahi mili) — usko theek karo, phir test karo.
     Tab tak replies system voice se bolenge.

### What is NOT committed to GitHub (by design)

`.gitignore` me ye sab blocked hai, taaki repo halka rahe aur koi bada
binary galti se push na ho:

- `piper/` — Piper binary + DLLs
- `voices/` — saare voice models
- `*.wav` — generated audio
- `*.onnx`, `*.onnx.json` — voice model files

GitHub par sirf code jayega (`index.html`, `main.js`, `preload.js`,
`package.json`, README). Piper aur models Akash apne laptop par alag se
install karega, upar wale steps se.

### Known limits (honest)

- **Piper neural hai, par halka model hai** — ye bade cloud voices
  (jaise ElevenLabs/Google neural) jitna natural nahi lagega, par system
  voices se clearly behtar hai. Yehi free/offline ka trade-off hai.
- **Pehli generation slow ho sakti hai** — model load hone me kuch
  seconds lagte hain; uske baad replies tez aate hain. Timeout 60
  seconds rakha hai.
- **Hinglish text** English model se English pronunciation me bolega —
  Hindi shabdon ka uchcharan perfect nahi hoga.
- **Electron only** — Chrome me `index.html` khol kar Piper mode kaam
  nahi karega; wahan system voice fallback chalega. Electron ki purani
  voice limitation (speech upload Error -2) Piper mode par lagu nahi
  hoti, kyunki Piper local audio banata hai, cloud speech service use
  nahi karta.
- **Lip-sync rhythm-based hai** — mouth audio ke saath khulta-band
  hota hai, phoneme-perfect visemes nahi hain.
- Live GUI test laptop par hi hoga — Akash ka screenshot/sunna hi final
  check hai.

### Files in this version

- `index.html` — v0.7 HUD (v0.6 voice + v0.5.1 LLM brain + Piper engine)
- `main.js` — Electron wrapper + Piper IPC handlers (`piper-speak`,
  `piper-available`)
- `preload.js` — contextBridge: `window.aegisPiper = { speak, isAvailable }`
- `package.json` — version 0.7.0, Electron wrapper (koi naya dependency nahi)
- `.gitignore` — piper/, voices/, *.wav, *.onnx, *.onnx.json
