/* AEGIS PRIME v0.8.0 — Electron wrapper (dual-model Piper; IPC already accepts a model argument, unchanged) with local Piper voice (free, offline).
   The renderer never runs a shell command: it calls the preload bridge, and
   this file runs piper.exe via execFile (argument array, no shell) with the
   text piped on stdin. No user text is ever interpolated into a shell string. */
const { app, BrowserWindow, ipcMain } = require('electron');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

function resolveInApp(p) {
  if (!p) return null;
  if (path.isAbsolute(p)) return p;
  return path.join(app.getAppPath(), p);
}

function checkPiper(exePath, modelPath) {
  const exe = resolveInApp(exePath);
  const model = resolveInApp(modelPath);
  const modelJson = model ? model + '.json' : null;
  return {
    exe: exe,
    model: model,
    exeExists: !!(exe && fs.existsSync(exe)),
    modelExists: !!(model && fs.existsSync(model)),
    modelJsonExists: !!(modelJson && fs.existsSync(modelJson)),
  };
}

ipcMain.handle('piper-available', (_event, args) => {
  const a = args || {};
  const c = checkPiper(a.exe || 'piper/piper.exe', a.model || 'voices/en_US-lessac-medium.onnx');
  return { exeExists: c.exeExists, modelExists: c.modelExists, modelJsonExists: c.modelJsonExists };
});

ipcMain.handle('piper-speak', (_event, args) => {
  return new Promise((resolve) => {
    const a = args || {};
    const text = String(a.text || '').slice(0, 20000);
    if (!text.trim()) return resolve({ ok: false, error: 'Khali text — bolne ko kuch nahi hai' });
    const c = checkPiper(a.exe || 'piper/piper.exe', a.model || 'voices/en_US-lessac-medium.onnx');
    if (!c.exeExists) return resolve({ ok: false, error: 'piper.exe nahi mila — README ke install steps dekho (piper/ folder)' });
    if (!c.modelExists) return resolve({ ok: false, error: 'Voice model (.onnx) nahi mila — voices/ folder me model rakho' });
    if (!c.modelJsonExists) return resolve({ ok: false, error: 'Model ki .onnx.json file nahi mili — .onnx ke saath uski .onnx.json bhi chahiye' });
    const outPath = path.join(os.tmpdir(), 'aegis-piper-' + process.pid + '-' + Date.now() + '.wav');
    // execFile with an argument array and NO shell: the text is piped on stdin,
    // so quotes/special characters in the text cannot become a command.
    const child = execFile(
      c.exe,
      ['--model', c.model, '--output_file', outPath],
      { timeout: 60000, windowsHide: true },
      (err) => {
        if (err) {
          try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
          const msg = (err.code === 'ETIMEDOUT') ? 'Piper timeout (60s) — pehli baar model load slow ho sakta hai'
            : 'Piper generation fail hua — exe/model path check karo';
          return resolve({ ok: false, error: msg });
        }
        if (!fs.existsSync(outPath)) return resolve({ ok: false, error: 'Piper ne WAV file nahi banayi' });
        return resolve({ ok: true, fileUrl: pathToFileURL(outPath).href });
      }
    );
    child.stdin.write(text);
    child.stdin.end();
  });
});


/* v0.8.0 LOCAL STT (Vosk, offline) — fixes the Electron WAKE Error -2.
   Why: Electron's browser SpeechRecognition uploads audio to a cloud speech
   service that Electron has no key for, so it fails with
   "chunked_data_pipe_upload_data_stream.cc(217) OnSizeReceived failed with
   Error: -2". Local STT never calls that service: the renderer records the
   mic to a 16 kHz mono WAV, and this handler runs a local Python+Vosk script
   on it via execFile (argument array, no shell). No transcript is ever faked:
   a missing Python, vosk package, or model returns ok:false with a reason. */
function checkSttModel(modelPath) {
  const dir = resolveInApp(modelPath);
  let exists = false, fileCount = 0;
  try { if (dir && fs.existsSync(dir) && fs.statSync(dir).isDirectory()) { exists = true; fileCount = fs.readdirSync(dir).length; } } catch (e) {}
  return { dir, exists, fileCount };
}
function tryPythonCandidate(cmd, extraArgs) {
  return new Promise((resolve) => {
    execFile(cmd, extraArgs.concat(['--version']), { timeout: 10000, windowsHide: true }, (err) => {
      resolve(!err);
    });
  });
}
async function findPython() {
  const candidates = [['py', ['-3']], ['python', []], ['python3', []]];
  for (const [cmd, extra] of candidates) {
    if (await tryPythonCandidate(cmd, extra)) return { cmd, extra };
  }
  return null;
}
ipcMain.handle('stt-available', async (_event, args) => {
  const a = args || {};
  const en = checkSttModel(a.modelEn || 'stt-models/en');
  const hi = checkSttModel(a.modelHi || 'stt-models/hi');
  const py = await findPython();
  return { python: !!py, pythonCmd: py ? py.cmd : null,
    en: { exists: en.exists, fileCount: en.fileCount },
    hi: { exists: hi.exists, fileCount: hi.fileCount } };
});
ipcMain.handle('stt-transcribe', async (_event, args) => {
  const a = args || {};
  const wavPath = path.join(os.tmpdir(), 'aegis-stt-' + process.pid + '-' + Date.now() + '.wav');
  try {
    const model = checkSttModel(a.model || 'stt-models/en');
    if (!model.exists || model.fileCount === 0) return { ok: false, error: 'STT model folder nahi mila ya khaali hai: ' + (a.model || 'stt-models/en') + ' — README ke install steps dekho' };
    let wavBuf = null;
    if (typeof a.wavBase64 === 'string' && a.wavBase64) wavBuf = Buffer.from(a.wavBase64, 'base64');
    else if (a.wav) { try { wavBuf = Buffer.from(a.wav); } catch (e) {} }
    if (!wavBuf || wavBuf.length < 44) return { ok: false, error: 'STT ke liye koi audio nahi mila — dobara WAKE dabao aur bolo' };
    fs.writeFileSync(wavPath, wavBuf);
    const py = await findPython();
    if (!py) return { ok: false, error: 'Python nahi mila — Python 3.10/3.11 install karo aur "py" command check karo (README dekho)' };
    const script = path.join(app.getAppPath(), 'stt_transcribe.py');
    if (!fs.existsSync(script)) return { ok: false, error: 'stt_transcribe.py nahi mila — git pull karke dobara npm start karo' };
    const out = await new Promise((resolve) => {
      execFile(py.cmd, py.extra.concat([script, '--model', model.dir, '--wav', wavPath]), { timeout: 60000, windowsHide: true },
        (err, stdout, stderr) => resolve({ err, stdout: String(stdout || ''), stderr: String(stderr || '') }));
    });
    if (out.err) {
      const detail = (out.stderr.trim().split('\n').pop() || '').slice(0, 200);
      if (out.err.code === 'ETIMEDOUT') return { ok: false, error: 'STT timeout (60s) — pehli baar model load slow ho sakta hai, dobara try karo' };
      return { ok: false, error: detail || 'STT fail hua — Python/vosk/model check karo (README dekho)' };
    }
    let parsed = null;
    try { parsed = JSON.parse(out.stdout.trim().split('\n').pop()); } catch (e) {}
    if (!parsed || typeof parsed.text !== 'string') return { ok: false, error: 'STT ne koi text nahi diya — audio phir se record karo' };
    return { ok: true, text: parsed.text };
  } catch (e) {
    return { ok: false, error: 'STT fail hua: ' + String(e.message || e).slice(0, 200) };
  } finally {
    try { if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath); } catch (e) {}
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    title: 'AEGIS PRIME',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
