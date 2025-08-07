const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  generarPDFTicket: (html) => ipcRenderer.invoke("generarPDFTicket", html),
});
