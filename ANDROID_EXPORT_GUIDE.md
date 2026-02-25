# Android Export Guide - Google Play Protect Compliance

Complete guide for exporting the Financial Tracker app to Android users via Google Play Store with full Play Protect compliance.

## Table of Contents
1. [Pre-Export Validation](#pre-export-validation)
2. [Build Process](#build-process)
3. [Signing Configuration](#signing-configuration)
4. [Google Play Store Setup](#google-play-store-setup)
5. [Testing & Validation](#testing--validation)
6. [Release Process](#release-process)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Export Validation

### Step 1: Run Play Protect Compliance Check

```bash
node scripts/check-play-protect.js
```

This script validates:
- ✅ Security configurations in AndroidManifest.xml
- ✅ Network security policies
- ✅ Code obfuscation & minification settings
- ✅ Dangerous permissions removal
- ✅ Build configuration
- ✅ Dependency integrity
- ✅ Required configuration files

**Expected Output:**
```
Google Play Protect Compliance Checker
Financial Tracker Android Export Validation

═══ AndroidManifest.xml Security Configuration ═══
✓ AndroidManifest.xml found
✓ Data backup disabled (allowBackup=false)
✓ Cleartext traffic disabled (usesCleartextTraffic=false)
...

═══ Compliance Summary ═══
Total Checks: 35
Passed: 34 (97.1%)
Warnings: 1
Failed: 0

Recommendation
✓ APP IS READY FOR PLAY PROTECT EXPORT
```

### Step 2: Verify Security Configuration

All critical files should be in place:
- `android/app/src/main/AndroidManifest.xml` - Permissions & security settings
- `android/app/src/main/res/xml/network_security_config.xml` - Network policy
- `android/app/build.gradle` - Build optimizations
- `proguard-rules.pro` - Code obfuscation rules

---

## Build Process

### Option A: Using EAS Build (Recommended)

EAS handles signing, building, and optimization automatically.

**Prerequisites:**
```bash
npm install -g eas-cli
eas login
eas project:init --id <your-project-id>
```

**Build for Google Play Store:**

```bash
npm run build:android
```

Or manually:
```bash
eas build -p android --profile production
```

This:
- ✅ Builds a production APK/AAB
- ✅ Automatically signs with your keystore
- ✅ Enables code obfuscation (ProGuard)
- ✅ Optimizes for all Android devices
- ✅ Generates all required artifacts

**Expected Duration:** 5-10 minutes

### Option B: Local APK Build

For testing or custom builds:

```bash
npm run build:local
```

Or manually:
```bash
./build-local-apk.sh
```

**Note:** Local builds require Android SDK setup and manual signing.

---

## Signing Configuration

### Generate Production Keystore (One-time)

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore financialtracker-release-key.keystore \
  -alias financialtracker-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Store these details securely:**
- Keystore file: `financialtracker-release-key.keystore`
- Keystore password: (your secure password)
- Key alias: `financialtracker-key`
- Key password: (same or different)
- Validity: 10000 days (~27 years)

### Configure in EAS

Add to `eas.json`:

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "aab",
        "pattern": "@(production|staging)"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**⚠️ SECURITY:** Never commit your keystore file to version control. Add to `.gitignore`:

```gitignore
*.keystore
*.key
*.jks
*.pem
```

---

## Google Play Store Setup

### Step 1: Create Google Play Developer Account

1. Visit [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time developer fee
3. Complete account setup with personal/business information

### Step 2: Create New App

1. In Google Play Console → **Create app**
2. **App name:** Financial Tracker
3. **Default language:** English (or your primary language)
4. **App or game:** Select App
5. **Category:** Finance
6. **Free or Paid:** Free

### Step 3: Complete Store Listing

**Essential Information:**
- **Short description** (80 characters):
  ```
  Simple, secure personal finance tracker for your money management
  ```

- **Full description** (4000 characters):
  ```
  Financial Tracker is a secure, easy-to-use personal finance app 
  that helps you track expenses, manage budgets, and monitor your 
  spending habits.
  
  Features:
  - Track income and expenses
  - Categorize transactions
  - View spending patterns
  - Export reports
  - Secure data encryption
  - Multi-language support
  
  Privacy: Your financial data never leaves your device without 
  your explicit consent. All data is encrypted and stored securely.
  ```

- **Screenshots** (minimum 2, maximum 8):
  - Create 1080x1920 PNG/JPG screenshots
  - Show main features and app interface

- **Feature graphic** (1024x500 px):
  - Banner showing app's key features

- **Icon** (512x512 px):
  - High-quality app icon

- **Promo video** (optional):
  - YouTube link showing app walkthrough

### Step 4: App Signing Certificate

Google Play Console manages signing certificates automatically via Play App Signing.

**In Play Console → App signing:**
- Google manages app signing certificate (automatic)
- Your upload key is configured in EAS
- APKs are resigned by Google during distribution

---

## Testing & Validation

### Pre-Release Testing

#### 1. Local Testing

```bash
# Build and install on local device
npm run android

# Or test the APK
npm run build:android
adb install app/build/outputs/apk/release/app-release.apk
```

#### 2. Internal Testing (Google Play)

1. **Prepare APK/AAB:**
   ```bash
   npm run build:android
   # Download artifact from EAS
   ```

2. **In Google Play Console:**
   - Go to **Testing → Internal testing**
   - Create new test release
   - Upload APK/AAB
   - Add test email addresses

3. **Test on device:**
   - Accept invitation on test device
   - Install from Play Store beta link
   - Verify all features work

#### 3. Staged Rollout

```
1. Start with 5% of users
2. Monitor crash reports & ratings for 3-7 days
3. Increase to 25% if no critical issues
4. Expand to 50% if stable
5. Full release when confident
```

### Validation Checklist

**Functionality:**
- [ ] App launches without crashes
- [ ] Can add/edit/delete transactions
- [ ] Export to PDF works
- [ ] Export to Excel works
- [ ] Multi-language switching works
- [ ] All tabs load properly
- [ ] Settings persist after restart

**Security:**
- [ ] No cleartext traffic in network logs
- [ ] No sensitive data in logs
- [ ] User data encrypted
- [ ] No dangerous permissions requested
- [ ] Biometric lock works (if enabled)

**Performance:**
- [ ] App launches in < 3 seconds
- [ ] Smooth scrolling and animations
- [ ] No excessive battery drain
- [ ] Reasonable memory usage (< 200MB)

**Compatibility:**
- [ ] Works on Android 8.0+ (API 26+)
- [ ] Tested on tablets and phones
- [ ] Tested with different screen sizes
- [ ] No layout issues on various DPI

---

## Release Process

### Step 1: Prepare Release Notes

Create release notes describing:
- New features
- Bug fixes
- Performance improvements
- Known issues

Example:
```
Version 1.0.0 Release Notes

🎉 Initial Release

Features:
- Full transaction tracking
- Multiple currency support
- PDF/Excel exports
- Multi-language support

Improvements:
- Optimized for all Android devices
- Enhanced security with encryption
- Improved app performance

Fixes:
- Initial release

Requirements:
- Android 8.0 or higher
- Internet connection for cloud sync
```

### Step 2: Create Production Release

In Google Play Console:

1. **Go to Release section:**
   - Select **Production → Create new release**

2. **Upload Build:**
   - Upload APK or AAB from EAS
   - Or upload pre-built APK

3. **Review Changes:**
   - All store listing information reviewed
   - Release notes reviewed
   - Screenshots and graphics verified

4. **Request Review:**
   - Click **Review and rollout**
   - Select rollout percentage (suggest 5% initial)
   - Submit for review

### Step 3: App Review Process

**Timeline:** Usually 2-4 hours, sometimes up to 24 hours

**Review Criteria:**
- ✅ Crashes or hangs
- ✅ Violates policies (Google Play Policies)
- ✅ Inappropriate content
- ✅ Deceptive practices
- ✅ Security vulnerabilities
- ✅ Permissions abuse

**Our App Status:**
- ✅ No dangerous permissions
- ✅ Uses HTTPS only
- ✅ Code obfuscated
- ✅ Complies with Play Policies
- ✅ No in-app billing (or properly implemented)

### Step 4: Monitor After Release

**Immediately After Approval:**

```bash
# Check Play Console metrics
- Monitor crash rates
- Review user ratings
- Check ANR (Application Not Responding)
- Monitor revenue (if applicable)
```

**First 24 Hours:**
- Monitor for critical crashes
- Check user reviews
- Be ready to rollback if major issues

**Ongoing Monitoring:**
- Weekly review of crash reports
- Monthly performance analysis
- Quarterly security updates

---

## Troubleshooting

### Common Issues

#### 1. Build Fails with ProGuard Errors

**Error:** `ProGuard: Can't find referenced class`

**Solution:**
```gradle
// In android/app/build.gradle
release {
    minifyEnabled true
    proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    
    // Add keep rules
    -keep class com.facebook.react.** { *; }
    -keep class com.reactnative.** { *; }
}
```

#### 2. APK Rejected - Contains Obfuscated Code

**Error:** Play Store blocks obfuscated code

**Solution:** Don't obfuscate in debug builds:
```gradle
buildTypes {
    debug {
        minifyEnabled false
    }
    release {
        minifyEnabled true
    }
}
```

#### 3. Network Error During Upload

**Error:** `Connection timeout uploading to Play Console`

**Solution:**
```bash
# Retry with smaller upload:
eas build -p android --profile production --force-new-build

# Or upload manually:
# Download AAB from EAS and upload via Play Console web
```

#### 4. App Crashes on Specific Android Versions

**Solution:**
```bash
# Test on different API levels
adb -s <device> shell getprop ro.build.version.sdk

# Enable verbose logging
adb logcat | grep FATAL
```

#### 5. Play Protect Scan Issues

**Error:** "This app contains risky behavior"

**Solution:**
1. Run compliance checker:
   ```bash
   node scripts/check-play-protect.js
   ```

2. Fix any failed checks
3. Rebuild and resubmit
4. Wait 24-48 hours for re-scan

#### 6. App Signed with Wrong Key

**Error:** Can't upgrade because signing key is different

**Solution:** DO NOT LOSE YOUR KEYSTORE
- Each app version must be signed with same key
- Store keystore in secure location
- Backup keystore file
- Never regenerate keystore

---

## Security Best Practices

1. **Keystore Management**
   - Store keystore file securely (encrypted backup)
   - Never commit to version control
   - Back up on external encrypted drive
   - Password >= 16 characters

2. **Code Updates**
   - Always test updates locally first
   - Use version control (git)
   - Tag releases: `v1.0.0`, `v1.0.1`, etc.

3. **Data Protection**
   - Use HTTPS for all network requests
   - Encrypt sensitive data at rest
   - Clear sensitive data on logout
   - Never store passwords/tokens

4. **Permissions**
   - Request only necessary permissions
   - Explain why each permission is needed
   - Respect user choices
   - Handle permission denials gracefully

5. **Dependencies**
   - Keep dependencies updated
   - Monitor security advisories
   - Run security audits:
     ```bash
     npm audit
     npm audit fix
     ```

---

## Useful Commands

```bash
# Compliance check
node scripts/check-play-protect.js

# Local build & test
npm run build:local
npm run android

# Production build (EAS)
npm run build:android

# Check for vulnerabilities
npm audit

# Lint code
npm run lint

# View build logs
eas build --platform android --status

# Download build artifact
eas build --platform android --latest
```

---

## Next Steps After Release

1. **Monitor Metrics** (Weekly)
   - Crash reports
   - User ratings
   - Download count
   - Uninstall rate

2. **Gather Feedback** (Monthly)
   - Read user reviews
   - Monitor support requests
   - Track feature requests

3. **Plan Updates** (Quarterly)
   - Security patches
   - Feature improvements
   - Performance optimizations
   - Dependency updates

4. **Marketing** (As needed)
   - Update app listing
   - Refresh screenshots
   - Create promo materials
   - Social media announcements

---

## Support & Resources

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer/
- **Play Protect Policies:** https://play.google.com/about/developer-content-policy/
- **Expo Build Docs:** https://docs.expo.dev/build/
- **EAS Submit Docs:** https://docs.expo.dev/submit/android/
- **Android Security:** https://developer.android.com/training/articles/security-tips

---

**Last Updated:** February 2026
**Version:** 1.0.0
