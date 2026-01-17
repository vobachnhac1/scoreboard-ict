#!/bin/bash

# Script để fix lỗi better-sqlite3 NODE_MODULE_VERSION mismatch

echo "🔧 Fixing better-sqlite3 for Electron..."
echo ""

# Bước 1: Xóa better-sqlite3 cũ
echo "📦 Step 1: Removing old better-sqlite3..."
rm -rf node_modules/better-sqlite3

# Bước 2: Cài lại better-sqlite3
echo "📦 Step 2: Installing better-sqlite3@11.5.0..."
yarn add better-sqlite3@11.5.0 --exact

# Bước 3: Rebuild cho Electron
echo "🔨 Step 3: Rebuilding for Electron..."
yarn rebuild:native

echo ""
echo "✅ Done! Now you can run:"
echo "   yarn dev"
echo ""

