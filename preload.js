/* AEGIS PRIME v0.7.1 — preload bridge for local Piper voice.
   contextBridge only: the renderer gets exactly two functions, no Node APIs. */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aegisPiper', {
  speak: (text, exe, model) => ipcRenderer.invoke('piper-speak', { text, exe, model }),
  isAvailable: (exe, model) => ipcRenderer.invoke('piper-available', { exe, model }),
});
