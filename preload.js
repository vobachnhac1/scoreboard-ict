const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // File system APIs
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  getFiles: (folderPath) => ipcRenderer.invoke('folder:getFiles', folderPath),

  // Auto-update APIs
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  getCurrentVersion: () => ipcRenderer.invoke('get-current-version'),

  // Update event listeners
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on('update-not-available', (event, info) => callback(info));
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (event, info) => callback(info));
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (event, error) => callback(error));
  },

  // Cleanup listeners
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.removeAllListeners('update-not-available');
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.removeAllListeners('update-downloaded');
    ipcRenderer.removeAllListeners('update-error');
  },

  // License APIs
  checkLicenseStatus: () => ipcRenderer.invoke('license:check-status'),
  activateLicense: (licenseKey) => ipcRenderer.invoke('license:activate', licenseKey),

  // License event listeners
  onLicenseStatus: (callback) => {
    ipcRenderer.on('license-status', (event, data) => callback(data));
  },
  removeLicenseListeners: () => {
    ipcRenderer.removeAllListeners('license-status');
  },

  // Secondary Display APIs
  openSecondaryDisplay: (data) => ipcRenderer.invoke('secondary-display:open', data),
  closeSecondaryDisplay: () => ipcRenderer.invoke('secondary-display:close'),
  updateSecondaryDisplay: (data) => ipcRenderer.invoke('secondary-display:update', data),

  // Secondary Display event listeners
  onUpdateScoreData: (callback) => {
    ipcRenderer.on('update-score-data', (event, data) => callback(data));
  },
  removeSecondaryDisplayListeners: () => {
    ipcRenderer.removeAllListeners('update-score-data');
  }
});
