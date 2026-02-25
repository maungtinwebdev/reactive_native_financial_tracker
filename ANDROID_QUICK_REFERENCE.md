# Quick Reference - Android Export & Play Protect Compliance

## TL;DR - Quick Start

```bash
# 1. Check compliance
npm run check:play-protect

# 2. Build for Google Play
npm run build:android

# 3. Or use interactive guide
./build-for-export.sh
```

## Commands Overview

| Command | Purpose | Usage |
|---------|---------|-------|
| `npm run check:play-protect` | Validate Play Protect compliance | Before building |
| `npm run build:android` | Production build (AAB for Play Store) | For release |
| `npm run build:apk` | Preview APK for testing | For internal testing |
| `npm run build:local` | Local build with Android SDK | For development |
| `npm run android` | Install & run on connected device | For local testing |
| `./build-for-export.sh` | Interactive export wizard | Guided process |

## Pre-Export Checklist

- [ ] Run `npm run check:play-protect` and verify all checks pass
- [ ] Review `PLAY_PROTECT_CHECKLIST.md` for security requirements
- [ ] Ensure AndroidManifest.xml has `allowBackup="false"` and `usesCleartextTraffic="false"`
- [ ] Verify no dangerous permissions (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, etc.)
- [ ] Check that code obfuscation is enabled in build.gradle
- [ ] Generate production signing keystore (keep it secure!)
- [ ] Test locally with `npm run android` on real device

## Build Flow

```
User runs npm run build:android
         ↓
Check prerequisites (Node, npm, Android SDK)
         ↓
Validate all dependencies installed
         ↓
Run Play Protect compliance checks
         ↓
Build app with code obfuscation/minification
         ↓
Package as AAB (Android App Bundle)
         ↓
Sign with production keystore
         ↓
Upload to EAS servers
         ↓
Download artifact from EAS Console
         ↓
Upload to Google Play Console
```

## Google Play Protect Security Requirements

✅ **Your app currently meets:**
- Disabled backup (`allowBackup="false"`)
- Enforced HTTPS (`usesCleartextTraffic="false"`)
- Removed dangerous permissions
- Enabled code obfuscation (ProGuard)
- Network security configuration
- Portrait orientation only
- No debug mode in release builds

## Common Issues & Fixes

### ❌ Build fails with ProGuard error
```bash
# Ensure ProGuard rules are properly configured
# Check android/app/proguard-rules.pro
# Rebuild: npm run build:android
```

### ❌ Play Protect rejects app
```bash
# Run compliance checker
npm run check:play-protect

# Fix any failed checks in AndroidManifest.xml
# Rebuild and resubmit
```

### ❌ Wrong signing key error
```bash
# Never regenerate keystore! Use same key for all versions
# Backup keystore file securely
keytool -list -v -keystore financialtracker-release-key.keystore
```

### ❌ Network error uploading
```bash
# Check internet connection
# Try again with: npm run build:android
# Or manually upload via Play Console web interface
```

## File Reference

| File | Purpose |
|------|---------|
| `scripts/check-play-protect.js` | Compliance validation script |
| `build-for-export.sh` | Interactive export guide |
| `ANDROID_EXPORT_GUIDE.md` | Complete export documentation |
| `PLAY_PROTECT_CHECKLIST.md` | Security requirements checklist |
| `APK_BUILD_GUIDE.md` | Detailed build instructions |
| `android/app/build.gradle` | Build configuration |
| `android/app/src/main/AndroidManifest.xml` | App manifest & permissions |
| `android/app/src/main/res/xml/network_security_config.xml` | Network policy |
| `eas.json` | EAS build profiles |

## Next Steps After Build

1. **Download Artifact**
   - Go to EAS Console
   - Download the AAB file

2. **Create Google Play Account**
   - Visit https://play.google.com/console
   - Pay $25 developer fee
   - Complete account setup

3. **Create App Listing**
   - App name, description, screenshots
   - Category, content rating
   - Privacy policy URL

4. **Submit for Review**
   - Upload AAB to Play Console
   - Review automated checks
   - Submit for Google Play review (2-24 hours)

5. **Monitor Release**
   - Start with 5% rollout
   - Monitor crash reports
   - Expand to 100% when stable

## Security Reminders

🔒 **IMPORTANT:**
- Never commit `.keystore` files to git
- Backup keystore in secure location
- Use strong keystore passwords
- Don't lose signing key!
- All future versions must use same key

## Useful Links

- [Google Play Console](https://play.google.com/console)
- [Play Protect Policy](https://support.google.com/googleplay/answer/2812158)
- [Expo Build Docs](https://docs.expo.dev/build/)
- [Android Security Guide](https://developer.android.com/training/articles/security-tips)

## Getting Help

1. **Compliance issues?** → Read `PLAY_PROTECT_CHECKLIST.md`
2. **Build errors?** → Check `APK_BUILD_GUIDE.md`
3. **Export process?** → See `ANDROID_EXPORT_GUIDE.md`
4. **Tool help?** → Run `npm run check:play-protect --help` or `./build-for-export.sh`

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Status:** Ready for Production ✓
