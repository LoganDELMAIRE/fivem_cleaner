const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  cleanLogs: (lang) => ipcRenderer.send('clean-logs', lang),
  onLogsClean: (callback) => ipcRenderer.on('logs-cleaned', callback),
  onLogMessage: (callback) => ipcRenderer.on('log-message', callback),
  removeLogsCleanListener: () => ipcRenderer.removeAllListeners('logs-cleaned'),
  removeLogMessageListener: () => ipcRenderer.removeAllListeners('log-message'),
  openExternal: (url) => ipcRenderer.send('open-external', url)
}); 