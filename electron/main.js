// main.js (Electron)

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // si usás contextIsolation o nodeIntegration ajustá según tu config
    },
  });

  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);

ipcMain.handle("generarPDFTicket", async (event, html) => {
  // Crear una ventana oculta para renderizar el ticket
  const pdfWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  const pdfBuffer = await pdfWin.webContents.printToPDF({
    printBackground: true,
    landscape: false,
    marginsType: 0,
  });

  // Guardar el PDF en una carpeta temporal o fija
  const pdfPath = path.join(app.getPath("temp"), `ticket-${Date.now()}.pdf`);
  fs.writeFileSync(pdfPath, pdfBuffer);

  pdfWin.destroy();

  return pdfPath;
});
