#!/usr/bin/env node

/**
 * Script kiểm tra xem dự án đã sẵn sàng build chưa
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra dự án sẵn sàng build...\n');

let hasError = false;

// Kiểm tra icon files
console.log('📋 Icon files:');
const iconFiles = [
  { path: 'build/icon.icns', platform: 'macOS' },
  { path: 'build/icon.ico', platform: 'Windows' },
  { path: 'build/icon.png', platform: 'Source' }
];

iconFiles.forEach(({ path: filePath, platform }) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   ${filePath} (${sizeMB} MB) - ${platform}`);
  } else {
    console.log(`   ${filePath} KHÔNG tồn tại - ${platform}`);
    hasError = true;
  }
});

// Kiểm tra frontend build
console.log('\n📋 Frontend build:');
const frontendFiles = [
  'public/app.bundle.js',
  'public/index.html',
  'public/favicon.ico'
];

frontendFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   ${filePath} (${sizeKB} KB)`);
  } else {
    console.log(`   ${filePath} KHÔNG tồn tại`);
    hasError = true;
  }
});

// Kiểm tra main files
console.log('\n📋 Main files:');
const mainFiles = [
  'electron.js',
  'app.js',
  'preload.js',
  'package.json'
];

mainFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`   ${filePath}`);
  } else {
    console.log(`   ${filePath} KHÔNG tồn tại`);
    hasError = true;
  }
});

// Kiểm tra package.json config
console.log('\n📋 Package.json config:');
try {
  const packageJson = require('../package.json');
  
  // Kiểm tra main entry
  if (packageJson.main === 'electron.js') {
    console.log('   main entry point: electron.js');
  } else {
    console.log(`   main entry point sai: ${packageJson.main}`);
    hasError = true;
  }
  
  // Kiểm tra build config
  if (packageJson.build) {
    console.log('   build config tồn tại');
    
    if (packageJson.build.mac && packageJson.build.mac.icon) {
      console.log(`   macOS icon: ${packageJson.build.mac.icon}`);
    } else {
      console.log('   macOS icon chưa cấu hình');
      hasError = true;
    }
    
    if (packageJson.build.win && packageJson.build.win.icon) {
      console.log(`   Windows icon: ${packageJson.build.win.icon}`);
    } else {
      console.log('   Windows icon chưa cấu hình');
      hasError = true;
    }
  } else {
    console.log('   build config không tồn tại');
    hasError = true;
  }
} catch (error) {
  console.log(`   Lỗi đọc package.json: ${error.message}`);
  hasError = true;
}

// Kết luận
console.log('\n' + '='.repeat(50));
if (hasError) {
  console.log(' Dự án CHƯA sẵn sàng build!');
  console.log('\n💡 Hướng dẫn fix:');
  console.log('  1. Nếu thiếu icon: chạy script tạo icon');
  console.log('  2. Nếu thiếu frontend: chạy npm run build');
  console.log('  3. Xem chi tiết: BUILD_SIMPLE.md');
  process.exit(1);
} else {
  console.log(' Dự án đã sẵn sàng build!');
  console.log('\n🚀 Bạn có thể chạy:');
  console.log('  npm run dist:mac   (macOS)');
  console.log('  npm run dist:win   (Windows)');
  process.exit(0);
}

