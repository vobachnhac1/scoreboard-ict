#!/bin/bash

# Script để rebuild native dependencies cho Electron
# Sử dụng khi gặp lỗi "cannot build native dependency"

echo " Rebuilding native dependencies cho Electron..."

# Lấy version Electron từ package.json
ELECTRON_VERSION=$(node -p "require('./package.json').devDependencies.electron.replace('^', '')")

echo "📦 Electron version: $ELECTRON_VERSION"

# Rebuild better-sqlite3
echo "🔨 Rebuilding better-sqlite3..."
npm rebuild better-sqlite3 --build-from-source --runtime=electron --target=$ELECTRON_VERSION --dist-url=https://electronjs.org/headers

# Nếu cần rebuild cho universal binary (macOS)
if [[ "$1" == "--universal" ]]; then
    echo "🍎 Building for Universal Binary (Intel + Apple Silicon)..."
    
    # Build cho x64
    echo "  → Building for x64..."
    npm rebuild sqlite3 --build-from-source --runtime=electron --target=$ELECTRON_VERSION --dist-url=https://electronjs.org/headers --arch=x64
    
    # Build cho arm64
    echo "  → Building for arm64..."
    npm rebuild sqlite3 --build-from-source --runtime=electron --target=$ELECTRON_VERSION --dist-url=https://electronjs.org/headers --arch=arm64
fi

echo " Rebuild hoàn tất!"
echo ""
echo "Bây giờ bạn có thể chạy:"
echo "  npm run dist:mac      (cho kiến trúc hiện tại)"
echo "  npm run dist:mac:universal (cho universal binary)"
echo "  npm run dist:win      (cho Windows)"

