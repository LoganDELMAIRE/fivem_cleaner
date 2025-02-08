const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { translations } = require('./translation');


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: false
    },
    autoHideMenuBar: true,
    frame: true,
    resizable: false
  });

  const indexPath = app.isPackaged 
    ? path.join(__dirname, '../build/index.html')
    : path.join(__dirname, '../build/index.html');

  win.loadFile(indexPath);

  // external link opening gestion
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Bloquer le raccourci clavier des DevTools
  win.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === 'i') {
      event.preventDefault();
    }
  });

}

function sendLog(win, message) {
  win.webContents.send('log-message', message);
}


// logs cleaning gestion
ipcMain.on('clean-logs', async (event, lang = 'fr') => {
  const win = BrowserWindow.fromWebContents(event.sender);
  let foldersFound = false;
  
  try {
    const localAppData = process.env.LOCALAPPDATA;
    sendLog(win, `Chemin LOCALAPPDATA: ${localAppData}`);

    const fivemPaths = {
      crashes: path.join(localAppData, 'FiveM', 'FiveM.app', 'crashes'),
      data: path.join(localAppData, 'FiveM', 'FiveM.app', 'data'),
      logs: path.join(localAppData, 'FiveM', 'FiveM.app', 'logs')
    };

    sendLog(win, translations[lang].startCleaning);

    for (const [key, folderPath] of Object.entries(fivemPaths)) {
      if (fs.existsSync(folderPath)) {
        foldersFound = true;
        sendLog(win, `${translations[lang].deletingFolder} "${key}" (${folderPath})`);
        await fs.promises.rm(folderPath, { recursive: true, force: true });
        sendLog(win, `✓ ${translations[lang].folderDeleted} "${key}"`);
      } else {
        sendLog(win, `ℹ️ ${translations[lang].folderAlreadyClean} "${key}" (${folderPath})`);
      }
    }

    if (!foldersFound) {
      sendLog(win, `✨ ${translations[lang].allFoldersClean}`);
    } else {
      sendLog(win, `✅ ${translations[lang].cleanSuccess}`);
    }
    
    event.reply('logs-cleaned', 'success');
  } catch (error) {
    sendLog(win, `❌ ${translations[lang].error}: ${error.message}`);
    event.reply('logs-cleaned', 'error');
  }
});

// external link opening gestion
ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Désactiver les DevTools globalement
app.on('browser-window-created', (event, win) => {
  win.webContents.on('context-menu', (e, params) => {
    e.preventDefault();
  });
});