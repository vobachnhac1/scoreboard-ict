#!/usr/bin/env node

/**
 * Script để chạy dev mode với obfuscation
 * Watch server files và auto obfuscate khi có thay đổi
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Cấu hình obfuscator (giống compile-server.js)
const obfuscatorConfig = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

// Danh sách thư mục cần watch
const dirsToWatch = [
  'server/controllers',
  'server/services',
  'server/routes',
  'server/config'
];

// Map để track file đang được obfuscate
const processingFiles = new Set();

/**
 * Obfuscate một file
 */
function obfuscateFile(filePath) {
  if (processingFiles.has(filePath)) {
    return; // Đang xử lý rồi, skip
  }

  try {
    processingFiles.add(filePath);
    
    const code = fs.readFileSync(filePath, 'utf8');
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscatorConfig).getObfuscatedCode();
    
    // Tạo backup
    const backupPath = filePath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }
    
    // Ghi file đã obfuscate
    fs.writeFileSync(filePath, obfuscatedCode, 'utf8');
    
    console.log(`✅ Obfuscated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error obfuscating ${filePath}:`, error.message);
  } finally {
    processingFiles.delete(filePath);
  }
}

/**
 * Obfuscate tất cả file trong thư mục
 */
function obfuscateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      obfuscateDirectory(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.backup')) {
      obfuscateFile(filePath);
    }
  });
}

/**
 * Watch thư mục và auto obfuscate
 */
function watchDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  console.log(`👀 Watching: ${dirPath}`);

  fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.js') || filename.endsWith('.backup')) {
      return;
    }

    const filePath = path.join(dirPath, filename);
    
    if (eventType === 'change' && fs.existsSync(filePath)) {
      console.log(`📝 File changed: ${filePath}`);
      setTimeout(() => obfuscateFile(filePath), 100); // Debounce
    }
  });
}

// Main execution
console.log('🔐 Starting dev mode with obfuscation...\n');

// Obfuscate tất cả file lần đầu
console.log('📁 Initial obfuscation...');
dirsToWatch.forEach(dir => {
  obfuscateDirectory(dir);
});

console.log('\n✅ Initial obfuscation complete!\n');

// Start watching
console.log('👀 Starting file watchers...');
dirsToWatch.forEach(dir => {
  watchDirectory(dir);
});

console.log('\n🚀 Starting Electron app...\n');

/**
 * Restore backup files
 */
function restoreBackups() {
  console.log('\n🔄 Restoring backup files...');

  dirsToWatch.forEach(dir => {
    restoreBackupsInDir(dir);
  });

  console.log('✅ Backup restored\n');
}

function restoreBackupsInDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      restoreBackupsInDir(filePath);
    } else if (file.endsWith('.backup')) {
      const originalPath = filePath.replace('.backup', '');
      fs.copyFileSync(filePath, originalPath);
      fs.unlinkSync(filePath);
      console.log(`✅ Restored: ${originalPath}`);
    }
  });
}

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping dev mode...');
  restoreBackups();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Stopping dev mode...');
  restoreBackups();
  process.exit(0);
});

// Start webpack và electron
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

devProcess.on('exit', (code) => {
  console.log('\n🛑 Dev process exited');
  restoreBackups();
  process.exit(code);
});

