#!/bin/bash

echo "🔧 Setting up Android SDK for local APK build..."

# Install Android Command Line Tools
echo "📦 Installing Android Command Line Tools..."
if ! command -v sdkmanager &> /dev/null; then
    echo "❌ Android SDK not found. Installing..."
    
    # Create Android SDK directory
    mkdir -p ~/Library/Android/sdk
    
    # Download command line tools
    cd ~/Library/Android/sdk
    curl -O https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip
    unzip commandlinetools-mac-11076708_latest.zip
    mv cmdline-tools latest/
    mkdir -p cmdline-tools
    mv latest cmdline-tools/
    
    # Set environment variables
    export ANDROID_HOME=~/Library/Android/sdk
    export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
    export PATH=$PATH:$ANDROID_HOME/platform-tools
    export PATH=$PATH:$ANDROID_HOME/build-tools/36.0.0
    
    echo "✅ Android Command Line Tools installed"
else
    echo "✅ Android SDK already installed"
fi

# Install required SDK components
echo "📱 Installing Android SDK components..."
yes | sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"

# Create local.properties
echo "📝 Creating local.properties..."
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# Set Java environment
echo "☕ Setting up Java environment..."
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

echo "✅ Android SDK setup complete!"
echo "🏗️  Ready to build APK locally"
