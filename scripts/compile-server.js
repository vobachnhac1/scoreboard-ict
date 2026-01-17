/**
 * Script để compile và obfuscate server code trước khi build
 * Sử dụng javascript-obfuscator để bảo vệ source code
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Cấu hình obfuscator
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

// Danh sách thư mục cần obfuscate
const dirsToObfuscate = [
  'server/controllers',
  'server/services',
  'server/routes',
  'server/config'
];

// Danh sách file không obfuscate (vì có thể gây lỗi)
const excludeFiles = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'public'
];

/**
 * Obfuscate một file
 */
function obfuscateFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscatorConfig).getObfuscatedCode();
    
    // Tạo backup
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    
    // Ghi file đã obfuscate
    fs.writeFileSync(filePath, obfuscatedCode, 'utf8');
    
    console.log(`✅ Obfuscated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error obfuscating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Obfuscate tất cả file trong thư mục
 */
function obfuscateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    // Skip excluded files/dirs
    if (excludeFiles.some(exclude => filePath.includes(exclude))) {
      return;
    }
    
    if (stat.isDirectory()) {
      obfuscateDirectory(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.backup')) {
      obfuscateFile(filePath);
    }
  });
}

/**
 * Restore backup files
 */
function restoreBackups() {
  console.log('\n🔄 Restoring backup files...');
  
  dirsToObfuscate.forEach(dir => {
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

// Main execution
console.log('🔐 Starting server code obfuscation...\n');

const args = process.argv.slice(2);

if (args.includes('--restore')) {
  restoreBackups();
} else {
  dirsToObfuscate.forEach(dir => {
    console.log(`📁 Obfuscating directory: ${dir}`);
    obfuscateDirectory(dir);
  });
  
  console.log('\n✅ Obfuscation complete!');
  console.log('💡 To restore original files, run: node scripts/compile-server.js --restore\n');
}

