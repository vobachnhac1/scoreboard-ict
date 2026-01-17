#!/usr/bin/env node

/**
 * Script để rebuild native dependencies cho Electron
 * Cross-platform (Windows, macOS, Linux)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Đọc version Electron từ package.json
const packageJson = require('../package.json');
const electronVersion = packageJson.devDependencies.electron.replace('^', '');

console.log('🔧 Rebuilding native dependencies cho Electron...');
console.log(`📦 Electron version: ${electronVersion}`);

// Kiểm tra tham số
const isUniversal = process.argv.includes('--universal');

try {
  // Rebuild better-sqlite3
  console.log('🔨 Rebuilding better-sqlite3...');

  const baseCommand = `npm rebuild better-sqlite3 --build-from-source --runtime=electron --target=${electronVersion} --dist-url=https://electronjs.org/headers`;

  if (isUniversal && process.platform === 'darwin') {
    console.log('🍎 Building for Universal Binary (Intel + Apple Silicon)...');

    // Build cho x64
    console.log('  → Building for x64...');
    execSync(`${baseCommand} --arch=x64`, { stdio: 'inherit' });

    // Build cho arm64
    console.log('  → Building for arm64...');
    execSync(`${baseCommand} --arch=arm64`, { stdio: 'inherit' });
  } else {
    // Build cho kiến trúc hiện tại
    execSync(baseCommand, { stdio: 'inherit' });
  }
  
  console.log('✅ Rebuild hoàn tất!');
  console.log('');
  console.log('Bây giờ bạn có thể chạy:');
  console.log('  npm run dist:mac      (cho kiến trúc hiện tại)');
  console.log('  npm run dist:mac:universal (cho universal binary)');
  console.log('  npm run dist:win      (cho Windows)');
  
} catch (error) {
  console.error('❌ Lỗi khi rebuild:', error.message);
  process.exit(1);
}

