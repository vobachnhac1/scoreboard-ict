const { app, globalShortcut, BrowserWindow, ipcMain, dialog } = require('electron');
// const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-assembler');
const { fork } = require('child_process');

const path = require('path');
const url = require('url');
const fs = require('fs');

// Set userData path cho server code TRƯỚC KHI require app.js
// Đảm bảo app.getPath('userData') luôn hoạt động
const userDataPath = app.getPath('userData');

// Tạo thư mục userData nếu chưa tồn tại
if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

process.env.USER_DATA_PATH = userDataPath;
console.log('📍 Electron userData path:', process.env.USER_DATA_PATH);

// Log ra file để debug khi chạy từ /Applications
const logPath = path.join(userDataPath, 'electron.log');
fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] App started\n`);
fs.appendFileSync(logPath, `[${new Date().toISOString()}] userData: ${userDataPath}\n`);

const server = require('./app');

// Tạm thời tắt electron-reloader để test migration
// try {
//   require('electron-reloader')(module);
// } catch (err) {
//     console.log('Reload failed:', err);
// }

let mainWindow;

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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 768,
    // webPreferences: {
    //   nodeIntegration: true
    // },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:6789/');
  // mainWindow.loadURL(url.format({
  //     pathname: path.join(__dirname, 'index.html'),
  //     protocol: 'file:',
  //     slashes: true
  // }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Register

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// app.whenReady().then(() => {
//   installExtension(REACT_DEVELOPER_TOOLS)
//     .then((name) => console.log(`Added Extension:  ${name}`))
//     .catch((err) => console.log('An error occurred: ', err));
//   // globalShortcut.register('F2', () => {
//   //   mainWindow.loadURL('http://localhost:6789/#/versus');
//   // });
  // });

function startServer() {
  const subprocess = fork('./app.js'); // hoặc file Node.js của bạn

  subprocess.on('exit', (code, signal) => {
    console.log(`⚠️ Node process exited with code ${code} and signal ${signal}. Restarting...`);
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
