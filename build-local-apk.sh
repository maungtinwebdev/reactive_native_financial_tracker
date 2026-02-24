#!/bin/bash

echo "🔧 Building APK locally for Android distribution..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist android/app/build

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate local bundle
echo "📱 Generating bundle..."
npx expo export --platform android --dev false

# Build using Gradle directly
echo "🏗️  Building APK with Gradle..."
cd android
./gradlew assembleRelease -x bundleReleaseJsAndAssets

# Copy APK to project root
echo "📋 Copying APK to project root..."
cp app/build/outputs/apk/release/app-release.apk ../FinancialTracker-v1.0.0.apk

echo "✅ APK build complete!"
echo "📍 APK location: ./FinancialTracker-v1.0.0.apk"
echo "📱 Share this file with Android users"
