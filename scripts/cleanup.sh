#!/bin/bash

# Production Cleanup Script
# This script removes unnecessary files for production deployment

echo "🧹 Starting production cleanup..."

# Remove backup and temporary files
echo "📁 Removing backup files..."
find . -name "*.backup" -type f -delete
find . -name "*.bak" -type f -delete
find . -name "*_backup*" -type f -delete
find . -name "*_old*" -type f -delete
find . -name "*_new*" -type f -delete
find . -name "*_clean*" -type f -delete
find . -name "*_broken*" -type f -delete
find . -name "*_fixed*" -type f -delete
find . -name "*_copy*" -type f -delete
find . -name "*.tmp" -type f -delete
find . -name "*.temp" -type f -delete

# Remove test directories
echo "🧪 Removing test directories..."
find . -name "test-*" -type d -exec rm -rf {} + 2>/dev/null || true
find . -path "./src/**/test" -type d -exec rm -rf {} + 2>/dev/null || true
find . -path "./src/**/tests" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove system files
echo "💻 Removing system files..."
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete

# Remove build artifacts
echo "🏗️ Removing build artifacts..."
rm -rf .next
rm -rf .vercel
rm -f tsconfig.tsbuildinfo

# Clean node_modules if requested
if [ "$1" = "--deep" ]; then
    echo "🗂️ Deep clean: removing node_modules..."
    rm -rf node_modules
    echo "📦 Run 'npm install' to reinstall dependencies"
fi

echo "✅ Cleanup completed!"
echo "📊 Current source files count:"
find ./src -name "*.tsx" -o -name "*.ts" | wc -l
