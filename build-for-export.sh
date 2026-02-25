#!/bin/bash

###############################################################################
# Financial Tracker - Android Export Helper Script
# Usage: ./build-for-export.sh
# 
# This script guides you through the Android export process with Play Protect
# compliance checks and automated build steps.
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BOLD}${BLUE}═══ $1 ═══${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Start
clear
echo -e "${BOLD}${BLUE}Financial Tracker - Android Export Tool${NC}"
echo -e "Build APK/AAB for Google Play Store\n"

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js first."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

# Check Android SDK
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        print_success "Android SDK found at: $ANDROID_HOME"
    elif [ -d "$HOME/.android/sdk" ]; then
        export ANDROID_HOME="$HOME/.android/sdk"
        print_success "Android SDK found at: $ANDROID_HOME"
    else
        print_error "Android SDK not found. Set ANDROID_HOME environment variable."
        exit 1
    fi
else
    print_success "Android SDK found at: $ANDROID_HOME"
fi

# Check EAS CLI
if command -v eas &> /dev/null; then
    EAS_VERSION=$(eas -v 2>/dev/null || echo "unknown")
    print_success "EAS CLI installed"
else
    print_warning "EAS CLI not found. Installing..."
    npm install -g eas-cli
    print_success "EAS CLI installed"
fi

# Step 2: Run Play Protect Compliance Check
print_header "Step 2: Running Play Protect Compliance Check"

if npm run check:play-protect; then
    print_success "Compliance check passed!"
else
    print_error "Compliance check failed. Fix issues before building."
    exit 1
fi

# Step 3: Ask for build type
print_header "Step 3: Select Build Type"

echo "Choose build type:"
echo "  1) Production (Release to Play Store)"
echo "  2) Preview (Test APK)"
echo "  3) Local (Build locally)"
echo -n "Enter choice [1-3]: "
read BUILD_TYPE

case $BUILD_TYPE in
    1)
        print_info "Building for production..."
        BUILD_CMD="npm run build:android"
        BUILD_PROFILE="production"
        ;;
    2)
        print_info "Building preview APK..."
        BUILD_CMD="npm run build:apk"
        BUILD_PROFILE="preview"
        ;;
    3)
        print_info "Building locally..."
        BUILD_CMD="npm run build:local"
        BUILD_PROFILE="local"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Step 4: Verify signing configuration
print_header "Step 4: Verifying Signing Configuration"

if [ "$BUILD_PROFILE" = "production" ]; then
    if grep -q "signingConfig" "android/app/build.gradle"; then
        print_success "Signing configuration found"
    else
        print_warning "No signing configuration found"
        echo -e "\n${YELLOW}To sign for production:${NC}"
        echo "1. Generate keystore:"
        echo "   keytool -genkeypair -v -storetype PKCS12 \\"
        echo "     -keystore financialtracker-release-key.keystore \\"
        echo "     -alias financialtracker-key -keyalg RSA -keysize 2048 -validity 10000"
        echo ""
        echo "2. Configure in app/build.gradle"
        echo ""
        read -p "Press Enter to continue anyway, or Ctrl+C to cancel..."
    fi
fi

# Step 5: Check dependencies
print_header "Step 5: Checking Dependencies"

if npm list &> /dev/null; then
    print_success "All dependencies installed"
else
    print_warning "Some dependencies might be missing. Installing..."
    npm install
    print_success "Dependencies installed"
fi

# Step 6: Build
print_header "Step 6: Building Application"

print_info "Running: $BUILD_CMD"
print_info "This may take 5-15 minutes..."
echo ""

if eval "$BUILD_CMD"; then
    print_success "Build completed successfully!"
    echo ""
    
    if [ "$BUILD_PROFILE" = "production" ]; then
        print_info "Next steps:"
        echo "  1. Download artifact from EAS dashboard"
        echo "  2. Upload AAB to Google Play Console"
        echo "  3. Set up store listing (description, screenshots, etc.)"
        echo "  4. Configure pricing and distribution"
        echo "  5. Submit for review"
    elif [ "$BUILD_PROFILE" = "preview" ]; then
        print_info "APK ready for testing"
        echo "  Download from EAS dashboard and install on test device"
    else
        print_info "Local build complete"
        echo "  Check android/app/build/outputs/apk/ for APK files"
    fi
else
    print_error "Build failed. Check error messages above."
    exit 1
fi

# Step 7: Generate signing key (if needed)
if [ "$BUILD_PROFILE" = "production" ] && [ ! -f "financialtracker-release-key.keystore" ]; then
    print_header "Step 7: Generate Production Signing Key"
    
    read -p "Generate new production keystore? (y/n): " GENERATE_KEY
    
    if [ "$GENERATE_KEY" = "y" ] || [ "$GENERATE_KEY" = "Y" ]; then
        print_info "Generating production keystore..."
        
        keytool -genkeypair -v \
            -storetype PKCS12 \
            -keystore financialtracker-release-key.keystore \
            -alias financialtracker-key \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000
        
        print_success "Keystore generated: financialtracker-release-key.keystore"
        print_warning "IMPORTANT: Store this keystore file safely! Do not commit to git."
        
        # Add to .gitignore
        if ! grep -q "*.keystore" .gitignore; then
            echo "*.keystore" >> .gitignore
            echo ".keystore" >> .gitignore
            print_success "Added keystore to .gitignore"
        fi
    fi
fi

print_header "Build Process Complete"

echo -e "${GREEN}${BOLD}✓ Your Financial Tracker app is ready for Android export!${NC}\n"

print_info "Resources:"
echo "  - Export Guide: ./ANDROID_EXPORT_GUIDE.md"
echo "  - Build Guide: ./APK_BUILD_GUIDE.md"
echo "  - Play Protect Checklist: ./PLAY_PROTECT_CHECKLIST.md"
echo "  - Google Play Console: https://play.google.com/console"
echo ""

print_success "All steps completed successfully!"
