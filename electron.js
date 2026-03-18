const { app, globalShortcut, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
// const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-assembler');
const { fork } = require('child_process');
const { autoUpdater } = require('electron-updater');

const path = require('path');
const url = require('url');
const fs = require('fs');

// --- SINGLE INSTANCE LOCK ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Nếu đã có một instance khác đang chạy, thông báo và thoát
  app.whenReady().then(() => {
    dialog.showErrorBox(
      'Thông báo ứng dụng',
      'Ứng dụng đang được mở. Vui lòng tắt ứng dụng trước khi mở lại.'
    );
    app.quit();
  });
  return; // Dừng thực thi script ở instance thứ 2 để không khởi chạy server
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Focus vào cửa sổ chính khi user cố gắng mở thêm instance
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
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
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  });

  ipcMain.handle('license:activate', async (event, licenseKey) => {
    const axios = require('axios');
    try {
      const response = await axios.post('http://localhost:6789/api/license/activate', {
        license_key: licenseKey,
      });
      return response.data;
    } catch (error) {
      log.error('License activation error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  });

  ipcMain.handle('license:revoke-device', async () => {
    try {
      const axios = require('axios');
      const response = await axios.delete('http://localhost:6789/api/license/revoke-device');
      return response.data;
    } catch (error) {
      log.error('License revoke device error:', error);
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
        simpleFullScreen: process.platform === 'darwin', // Use simple full screen for macOS
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
        },
        backgroundColor: '#1e3a8a' // Blue background
      });

      // Phím tắt F11 cho màn hình phụ
      secondaryDisplayWindow.webContents.on('before-input-event', (event, input) => {
        const isF11 = input.key === 'F11' || input.code === 'F11';
        const isMacFullscreen = process.platform === 'darwin' && input.meta && input.control && input.key.toLowerCase() === 'f';

        // Chỉ toggle khi phím được nhấn (keyDown) và KHÔNG phải là lặp lại (isAutoRepeat)
        if ((isF11 || isMacFullscreen) && input.type === 'keyDown' && !input.isAutoRepeat) {
          secondaryDisplayWindow.setFullScreen(!secondaryDisplayWindow.isFullScreen());
          event.preventDefault();
        }
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
    // Thay đổi icon trên thanh Dock của macOS nếu đây là máy Mac
    if (process.platform === 'darwin') {
      const { nativeImage } = require('electron');
      const appIcon = nativeImage.createFromPath(path.join(__dirname, 'build/icons/256x256.png'));
      if (!appIcon.isEmpty()) {
        app.dock.setIcon(appIcon);
      }
    }

    mainWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      icon: path.join(__dirname, 'build/icons/256x256.png'), // Thêm icon cho Window chính (Taskbar Windows/Linux)
      autoHideMenuBar: true, // Ẩn hoàn toàn Menu Bar trên Windows (không hiện khi bấm ALT)
      simpleFullScreen: process.platform === 'darwin', // Use simple full screen for macOS to avoid flickering/animations
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      }
    });

    // Vô hiệu hóa tiếp tục Menu nếu vẫn lỡ bị kích hoạt
    mainWindow.setMenu(null);

    mainWindow.loadURL('http://localhost:6789/');
    // mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, 'index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Register shortcuts
    // mainWindow.webContents.on('before-input-event', (event, input) => {
    //   const isF11 = input.key === 'F11' || input.code === 'F11';
    //   const isMacFullscreen = process.platform === 'darwin' && input.meta && input.control && input.key.toLowerCase() === 'f';

    //   // Chỉ toggle khi phím được nhấn (keyDown) và KHÔNG phải là lặp lại (isAutoRepeat)
    //   if ((isF11 || isMacFullscreen) && input.type === 'keyDown' && !input.isAutoRepeat) {
    //     mainWindow.setFullScreen(!mainWindow.isFullScreen());
    //     event.preventDefault();
    //   }
    // });
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
  app.on('ready', () => {
    // Ẩn Menu Bar mặc định (File | Edit | Window | Help...) của Electron
    Menu.setApplicationMenu(null);

    // Thay đổi cài đặt About Panel của OS (Ví dụ MacOS Menu App > About)
    app.setAboutPanelOptions({
      applicationName: 'DigiSports',
      applicationVersion: app.getVersion(),
      version: 'Production',
      copyright: 'Copyright (C) 2026 NhacVB - DigiSports.',
      credits: 'Phát triển bởi NhacVB',
      authors: ['NhacVB'],
      iconPath: path.join(__dirname, 'build/icons/256x256.png') // Sử dụng bản PNG đã được chuẩn hoá bởi icon-builder cho Mac
    });

    createWindow()
    setupAutoUpdater();
    checkLicenseOnStartup(); // Kiểm tra license khi khởi động
    setupServerWatchdog();    // Giám sát server 6789
  });

  app.whenReady().then(() => {
    // installExtension(REACT_DEVELOPER_TOOLS)
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((err) => console.log('An error occurred: ', err));
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

  // Setup Watchdog cho Server port 6789
  function setupServerWatchdog() {
    const net = require('net');
    const CHECK_INTERVAL = 10000; // 10 giây check 1 lần

    setInterval(() => {
      const socket = new net.Socket();
      socket.setTimeout(3000); // Timeout 3 giây

      socket.on('error', (err) => {
        log.error(`⚠️ Server watchdog: Cổng 6789 không phản hồi (${err.message}). Đang reload lại ứng dụng...`);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.reload();
        }
        socket.destroy();
      });

      socket.on('timeout', () => {
        log.warn('⚠️ Server watchdog: Cổng 6789 bị timeout. Đang reload...');
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.reload();
        }
        socket.destroy();
      });

      socket.connect(6789, '127.0.0.1', () => {
        socket.end();
        socket.destroy();
      });
    }, CHECK_INTERVAL);
  }

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
}
