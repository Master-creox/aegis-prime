/* AEGIS PRIME v0.8.0 — preload bridge for local Piper voice + local Vosk STT.
   contextBridge only: the renderer gets these functions, no Node APIs. */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aegisPiper', {
  speak: (text, exe, model) => ipcRenderer.invoke('piper-speak', { text, exe, model }),
  isAvailable: (exe, model) => ipcRenderer.invoke('piper-available', { exe, model }),
});

contextBridge.exposeInMainWorld('aegisStt', {
  transcribe: (model, wavBase64) => ipcRenderer.invoke('stt-transcribe', { model, wavBase64 }),
  isAvailable: (modelEn, modelHi) => ipcRenderer.invoke('stt-available', { modelEn, modelHi }),
});
