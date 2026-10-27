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
