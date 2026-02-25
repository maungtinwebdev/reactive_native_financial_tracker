# Alternate Build Methods - When EAS Free Plan is Exhausted

When you've used up your EAS free plan builds for the month, you have several options to continue exporting your Financial Tracker app.

---

## Current Status

**Free Plan Limit Reached:** This month ✗  
**Reset Date:** Sun Mar 01 2026 (3 days)  
**Options:**
1. Wait for reset (3 days)
2. Use different EAS account
3. Build locally with Android SDK
4. Upgrade to paid EAS plan

---

## Option 1: Wait for Free Plan Reset (Recommended for Small Projects)

**Time to wait:** 3 days (until March 1, 2026)

The free plan automatically resets monthly. No action needed - just wait and your build quota will be refreshed.

```bash
# In 3 days, this will work again:
npm run build:android
```

**Best for:** Non-urgent releases or testing

---

## Option 2: Use Different EAS Account (Quick Solution)

### Step 1: Create or Switch to Another EAS Account

**Option A: Login with different account:**
```bash
eas logout
eas login
# Enter different email/password
```

**Option B: Create new EAS account:**
1. Visit https://expo.dev
2. Sign up with different email
3. Create new organization/project
4. Link to this app

### Step 2: Link New Account to Your Project

```bash
# Remove current EAS setup
rm -rf .eas

# Reinitialize with new account
eas project:init
# Select "Create new project"
# Or link to existing project from new account
```

### Step 3: Build with New Account

```bash
npm run build:android
# Uses new account's free plan quota
```

**Best for:** Quick workaround when you need immediate builds

**Limitations:**
- Different signing keys per account
- Can't upgrade same app later
- Only delays problem 30 days

---

## Option 3: Build Locally with Android SDK (Full Control)

### Prerequisites

```bash
# Verify Android SDK installed
echo $ANDROID_HOME

# Should output something like:
# /Users/m2/Library/Android/sdk
```

### Step 1: Verify Build Configuration

```bash
cd android
./gradlew clean
```

### Step 2: Build Release APK Locally

```bash
# Build release APK (signed with debug key)
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Step 3: Generate Production Signing Key

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore financialtracker-release-key.keystore \
  -alias financialtracker-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Step 4: Sign APK with Production Key

```bash
# Using jarsigner
jarsigner -verbose -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore financialtracker-release-key.keystore \
  android/app/build/outputs/apk/release/app-release.apk \
  financialtracker-key

# Or use apksigner (included in Android SDK)
~/Library/Android/sdk/build-tools/34.0.0/apksigner sign \
  --ks financialtracker-release-key.keystore \
  --ks-key-alias financialtracker-key \
  android/app/build/outputs/apk/release/app-release.apk
```

### Step 5: Build AAB for Play Store

```bash
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

**Best for:** Full control, no cloud dependency, repeatable builds

**Advantages:**
- No cloud limits
- Control over signing
- Faster builds (local)
- Can integrate with CI/CD

**Challenges:**
- Requires Android build tools
- Larger local setup
- Manual process

---

## Option 4: Upgrade EAS Plan (For Ongoing Production Use)

### EAS Plan Options

| Feature | Free | Pay-as-you-go | Subscription |
|---------|------|---|---|
| Monthly builds | 30 | Unlimited | Unlimited |
| Build wait time | ~30 min | ~15 min | ~5 min |
| Concurrent builds | 1 | 1 | Up to 4 |
| Priority queue | No | Yes | Yes |
| Cost | $0 | $0.50/build | $99+/month |

### Upgrade to Paid Plan

```bash
# Via web
# Visit: https://expo.dev/settings/billing
# Click "Upgrade Plan"
# Follow payment setup

# Or CLI
eas account:update
```

**Best for:** Professional/production apps with regular releases

---

## Comparison Table

| Method | Time | Cost | Complexity | Best For |
|--------|------|------|------------|----------|
| Wait for reset | 3 days | $0 | None | Testing, non-urgent |
| Different account | Immediate | $0 | Low | Quick workaround |
| Local build | Immediate | $0 | Medium | Development, CI/CD |
| Upgrade EAS | Immediate | $$$+ | None | Production apps |

---

## Quick Decision Guide

**I need to build TODAY:**
→ Use Option 3 (local build) or Option 2 (different account)

**I can wait 3 days:**
→ Use Option 1 (free reset)

**I plan to release regularly:**
→ Use Option 4 (upgrade plan)

**I just need to test:**
→ Use Option 1 or 2

**I want full control:**
→ Use Option 3 (local build)

---

## Step-by-Step: Local Build Method

### For Local Testing

```bash
# 1. Ensure dependencies installed
npm install

# 2. Clean previous builds
cd android
./gradlew clean

# 3. Build debug APK
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk

# 4. Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk

# 5. Run app
adb shell am start -n com.financialtracker.app/.MainActivity
```

### For Production Release

```bash
# 1. Generate keystore (one-time)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore financialtracker-release-key.keystore \
  -alias financialtracker-key \
  -keyalg RSA -keysize 2048 -validity 10000

# 2. Store keystore securely
# BACKUP: Copy to encrypted drive
# GITIGNORE: Add *.keystore to .gitignore

# 3. Build release APK
cd android
./gradlew assembleRelease

# 4. Sign APK
~/Library/Android/sdk/build-tools/*/apksigner sign \
  --ks ../financialtracker-release-key.keystore \
  --ks-key-alias financialtracker-key \
  app/build/outputs/apk/release/app-release.apk

# 5. Upload to Play Store
# Or build AAB instead:
./gradlew bundleRelease
# Then upload app-release.aab to Play Console
```

---

## Troubleshooting Local Builds

### Error: "Could not find gradle"

```bash
# Install/update Android Studio or build tools
cd android
chmod +x gradlew
./gradlew --version
```

### Error: "SDK location not found"

```bash
# Create local.properties
cd android
echo "sdk.dir=$HOME/Library/Android/sdk" > local.properties
```

### Error: "APK signature verification failed"

```bash
# Ensure you're signing with same keystore
# Never lose your keystore file!
keytool -list -v -keystore financialtracker-release-key.keystore
```

### Error: "Could not find Java"

```bash
# Install Java Development Kit (JDK)
# Check Java version
java -version
# Should be Java 11 or higher
```

---

## Recommended Workflow Going Forward

### Development Phase
```bash
# Use free EAS builds for testing
npm run build:android (until quota)
npm run build:apk       (preview builds)
```

### Production Phase
```bash
# Use local builds or upgrade plan
./gradlew bundleRelease (local AAB)
# Upload AAB to Play Console
```

### Long-term
```bash
# After first release, consider:
- Upgrade to paid EAS plan ($99+/month for subscriptions)
- Set up CI/CD with local builds
- Automate releases with GitHub Actions or similar
```

---

## Security Notes for Local Builds

🔒 **IMPORTANT:**
- Generate keystore ONCE, keep forever
- Never regenerate keystore (breaks update chain)
- Backup keystore to encrypted storage
- NEVER commit `.keystore` to git
- Use same keystore for all app versions
- Use strong keystore password (16+ chars)

---

## Files Reference

| File | Purpose |
|------|---------|
| `android/gradlew` | Gradle wrapper (run builds) |
| `android/build.gradle` | Build configuration |
| `android/app/build.gradle` | App-specific build config |
| `android/app/build.properties` | Build properties |
| `android/app/proguard-rules.pro` | Code obfuscation rules |

---

## Command Reference

```bash
# Local builds
cd android && ./gradlew clean                # Clean build directory
cd android && ./gradlew assembleDebug        # Build debug APK
cd android && ./gradlew assembleRelease      # Build release APK
cd android && ./gradlew bundleRelease        # Build release AAB

# Signing
keytool -genkeypair ...                      # Generate keystore
jarsigner -verbose ...                       # Sign APK
apksigner sign ...                           # Sign with Android tool

# Installation
adb install app.apk                          # Install APK on device
adb shell am start ...                       # Launch app on device
```

---

## When to Use Each Method

### Use EAS Cloud Builds When:
- You want managed builds (handles signing, optimization)
- You don't have Android SDK setup
- You need to build on different machines
- You want faster upload to Play Store

### Use Local Builds When:
- You've exhausted free plan
- You want full control over process
- You're in development (faster)
- You have Android SDK installed
- You want to save costs

### Use Different Account When:
- You need immediate build (today)
- You're testing multiple apps
- You want to separate projects

---

## Cost Comparison Over 1 Year

| Option | Cost | Builds/Month | Total/Year |
|--------|------|---|---|
| Free EAS (reset) | $0 | 30 | $0 |
| Local builds | $0 | ∞ | $0 |
| EAS Subscription | $99/mo | ∞ | $1,188 |
| EAS Pay-per-build | $0.50/build | 60 | $360 |

---

## Support

- **EAS Issues:** https://docs.expo.dev/build/
- **Local Build Help:** https://developer.android.com/build
- **Gradle Docs:** https://gradle.org/
- **Android Studio:** https://developer.android.com/studio

---

**Last Updated:** February 25, 2026  
**Status:** Ready for alternative builds  
**Next Reset:** March 1, 2026 (3 days)
