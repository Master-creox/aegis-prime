/* AEGIS PRIME v0.7 — Electron wrapper with local Piper voice (free, offline).
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
