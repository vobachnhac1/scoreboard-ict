const { app, globalShortcut, BrowserWindow, ipcMain, dialog } = require('electron');
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-assembler');
const { fork } = require('child_process');
const { autoUpdater } = require('electron-updater');

const path = require('path');
const url = require('url');
const fs = require('fs');

// Configure electron-log for auto-updater
const log = require('electron-log');
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Configure auto-updater
autoUpdater.autoDownload = false; // Không tự động download, để user quyết định
autoUpdater.autoInstallOnAppQuit = true; // Tự động install khi quit app

// Set userData path cho server code TRƯỚC KHI require app.js
// Đảm bảo app.getPath('userData') luôn hoạt động
const userDataPath = app.getPath('userData');

// Tạo thư mục userData nếu chưa tồn tại
if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

process.env.USER_DATA_PATH = userDataPath;
console.log('Electron userData path:', process.env.USER_DATA_PATH);

// Log ra file để debug khi chạy từ /Applications
const logPath = path.join(userDataPath, 'electron.log');
fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] App started\n`);
fs.appendFileSync(logPath, `[${new Date().toISOString()}] userData: ${userDataPath}\n`);

const server = require('./app');

// Tạm thời tắt electron-reloader để test migration
try {
  require('electron-reloader')(module);
} catch (err) {
    console.log('Reload failed:', err);
}

let mainWindow;
let secondaryDisplayWindow = null; // Cửa sổ hiển thị điểm phụ

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('folder:getFiles', async (event, folderPath) => {
  try {
    const files = await fs.readdir(folderPath);
    return files;
  } catch (error) {
    console.error('Error reading folder:', error);
    return [];
  }
});

// Auto-Update IPC Handlers
ipcMain.handle('check-for-updates', async () => {
  try {
    log.info('Manual check for updates triggered');
    const result = await autoUpdater.checkForUpdates();
    return result;
  } catch (error) {
    log.error('Check for updates error:', error);
    return { error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    log.info('Download update triggered');
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    log.error('Download update error:', error);
    return { error: error.message };
  }
});

ipcMain.handle('quit-and-install', () => {
  log.info('Quit and install triggered');
  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-current-version', () => {
  const version = app.getVersion();
  log.info('Current version:', version);
  return version;
});

// License IPC Handlers
ipcMain.handle('license:check-status', async () => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:6789/api/license/status');
    return response.data;
  } catch (error) {
    log.error('License check error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('license:activate', async (event, licenseKey) => {
  try {
    const axios = require('axios');
    const response = await axios.post('http://localhost:6789/api/license/activate', {
      license_key: licenseKey,
    });
    return response.data;
  } catch (error) {
    log.error('License activation error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
});

// Secondary Display Window IPC Handlers
ipcMain.handle('secondary-display:open', async (event, data) => {
  try {
    if (secondaryDisplayWindow) {
      // Nếu cửa sổ đã tồn tại, focus vào nó
      secondaryDisplayWindow.focus();
      // Gửi dữ liệu mới
      secondaryDisplayWindow.webContents.send('update-score-data', data);
      return { success: true, message: 'Window already exists, focused and updated' };
    }

    // Tạo cửa sổ mới
    secondaryDisplayWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      title: 'Màn hình phụ - Bảng điểm',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
      backgroundColor: '#1e3a8a' // Blue background
    });

    // Load URL với hash route
    secondaryDisplayWindow.loadURL('http://localhost:6789/#/secondary-display');

    // Gửi dữ liệu sau khi load xong
    secondaryDisplayWindow.webContents.on('did-finish-load', () => {
      secondaryDisplayWindow.webContents.send('update-score-data', data);
    });

    // Cleanup khi đóng
    secondaryDisplayWindow.on('closed', () => {
      secondaryDisplayWindow = null;
    });

    log.info('Secondary display window opened');
    return { success: true, message: 'Window created' };
  } catch (error) {
    log.error('Secondary display open error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('secondary-display:close', async () => {
  try {
    if (secondaryDisplayWindow) {
      secondaryDisplayWindow.close();
      secondaryDisplayWindow = null;
      log.info('Secondary display window closed');
      return { success: true };
    }
    return { success: false, message: 'Window does not exist' };
  } catch (error) {
    log.error('Secondary display close error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('secondary-display:update', async (event, data) => {
  try {
    if (secondaryDisplayWindow) {
      secondaryDisplayWindow.webContents.send('update-score-data', data);
      return { success: true };
    }
    return { success: false, message: 'Window does not exist' };
  } catch (error) {
    log.error('Secondary display update error:', error);
    return { success: false, error: error.message };
  }
});

// Setup Auto-Updater
function setupAutoUpdater() {
  // Check for updates when app starts (after 3 seconds)
  setTimeout(() => {
    log.info('Checking for updates...');
    autoUpdater.checkForUpdates();
  }, 3000);

  // Event: Update available
  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    if (mainWindow) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
        files: info.files.map(f => ({
          url: f.url,
          size: (f.size / 1024 / 1024).toFixed(2) + ' MB'
        }))
      });
    }
  });

  // Event: Update not available
  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
    if (mainWindow) {
      mainWindow.webContents.send('update-not-available', info);
    }
  });

  // Event: Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    log.info('Download progress:', progressObj.percent);
    if (mainWindow) {
      mainWindow.webContents.send('download-progress', {
        percent: Math.round(progressObj.percent),
        transferred: (progressObj.transferred / 1024 / 1024).toFixed(2),
        total: (progressObj.total / 1024 / 1024).toFixed(2),
        bytesPerSecond: (progressObj.bytesPerSecond / 1024).toFixed(2)
      });
    }
  });

  // Event: Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info);
    }
  });

  // Event: Error
  autoUpdater.on('error', (error) => {
    log.error('Update error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', {
        message: error.message,
        stack: error.stack
      });
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    }
  });

  mainWindow.loadURL('http://localhost:6789/');
  // mainWindow.loadURL(url.format({
  //     pathname: path.join(__dirname, 'index.html'),
  //     protocol: 'file:',
  //     slashes: true
  // }));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Register

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// License check function
async function checkLicenseOnStartup() {
  try {
    // Đợi server khởi động (3 giây)
    await new Promise(resolve => setTimeout(resolve, 3000));

    const axios = require('axios');
    const response = await axios.get('http://localhost:6789/api/license/status');

    if (response.data && response.data.success) {
      const licenseData = response.data.data;

      if (licenseData.valid) {
        log.info(' License valid. Days remaining:', licenseData.daysRemaining);

        // Gửi thông tin license cho renderer process
        if (mainWindow) {
          mainWindow.webContents.send('license-status', {
            valid: true,
            data: licenseData
          });
        }
      } else {
        log.warn(' License invalid or expired. Require activation.');

        // Gửi thông báo cần kích hoạt
        if (mainWindow) {
          mainWindow.webContents.send('license-status', {
            valid: false,
            requireActivation: true,
            data: licenseData
          });
        }
      }
    }
  } catch (error) {
    log.error(' License check error:', error.message);

    // Gửi thông báo lỗi
    if (mainWindow) {
      mainWindow.webContents.send('license-status', {
        valid: false,
        requireActivation: true,
        error: error.message
      });
    }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=>{
  createWindow()
  setupAutoUpdater();
  checkLicenseOnStartup(); // Kiểm tra license khi khởi động
});

app.whenReady().then(() => {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
  // globalShortcut.register('F2', () => {
  //   mainWindow.loadURL('http://localhost:6789/#/versus');
  // });
  });

function startServer() {
  const subprocess = fork('./app.js'); // hoặc file Node.js của bạn

  subprocess.on('exit', (code, signal) => {
    console.log(` Node process exited with code ${code} and signal ${signal}. Restarting...`);
    setTimeout(startServer, 1000); // restart sau 1s
  });
}


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("certificate-error", (event, webContents, url, error) => {
  console.log("CERT ERROR:", url, error);
});

// app.commandLine.appendSwitch("ignore-certificate-errors");

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
