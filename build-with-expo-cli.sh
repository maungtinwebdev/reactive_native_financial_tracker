#!/bin/bash

echo "🔧 Building APK using Expo CLI..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Installing Java..."
    if command -v brew &> /dev/null; then
        brew install openjdk@17
        echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
        export JAVA_HOME=/usr/local/opt/openjdk@17
        echo "✅ Java installed. Please restart your terminal and run this script again."
        exit 1
    else
        echo "❌ Please install Java manually: https://www.java.com"
        exit 1
    fi
fi

# Set Java environment
export JAVA_HOME=/usr/local/opt/openjdk@17
export PATH="/usr/local/opt/openjdk@17/bin:$PATH"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Build using Expo CLI
echo "📱 Building APK with Expo CLI..."
npx expo build:android --type apk --release-channel production

echo "✅ Build complete!"
echo "📱 Check your Expo dashboard for the APK download"
