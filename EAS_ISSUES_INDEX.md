# EAS Issues & Solutions - Quick Index

Complete reference for all EAS-related issues and how to fix them.

---

## Your Current Situation

**Date:** February 25, 2026  
**Current Status:** 
- Original account: Out of free builds (limit hit)
- New account: `bruno18farnandes` (just created, fresh quota)
- Free plan resets: March 1, 2026 (3 days)

---

## Documentation Files

### 1. [EAS_AUTHENTICATION_FIX.md](EAS_AUTHENTICATION_FIX.md)
**For:** Permission/login errors like "Entity not authorized"

**Error:** `You don't have the required permissions to perform this operation`

**Fix:** Login with correct account
```bash
eas whoami
eas logout
eas login
# Enter correct email
```

**Read this if:** Getting authentication/permission errors

---

### 2. [ALTERNATE_BUILD_METHODS.md](ALTERNATE_BUILD_METHODS.md)
**For:** When EAS free plan limit is hit

**Situation:** Used up 30 free builds for the month

**Options:**
1. Wait 3 days for reset (March 1)
2. Use different EAS account
3. Build locally with Android SDK (no limit)
4. Upgrade to paid EAS plan

**Read this if:** Getting "free plan limit" errors or running out of builds

---

### 3. [EAS_ACCOUNT_REUSE_GUIDE.md](EAS_ACCOUNT_REUSE_GUIDE.md) ⭐ **YOU ARE HERE**
**For:** Switching between accounts and reusing after reset

**Situation:** Want to switch back to original account when it resets

**Plan:**
- Now: Use Account B (bruno18farnandes)
- March 1+: Can switch back to Account A

**Read this if:** Planning to reuse original account or manage multiple accounts

---

## Quick Decision Map

```
Do you see this error?

├─ "Entity not authorized" or "Permission denied"
│  └─ → Read: EAS_AUTHENTICATION_FIX.md
│     └─ Command: eas login (with correct email)
│
├─ "free plan exhausted" or "Free plan builds used"
│  └─ → Read: ALTERNATE_BUILD_METHODS.md
│     └─ Options: Wait 3 days, local build, or upgrade
│
└─ Want to manage multiple accounts
   └─ → Read: EAS_ACCOUNT_REUSE_GUIDE.md
      └─ Tip: Use Account B now, switch back March 1
```

---

## Your Immediate Action Plan

### Today (Feb 25, 2026)
```bash
# 1. You're set up with new account
eas whoami
# Should show: bruno18farnandes

# 2. Build whenever you need
npm run build:android

# 3. SAVE THIS INFO FOR LATER:
# Original Account ID: [your-original-email]
# Original Project ID: 0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
```

### Next 3 Days (Until March 1)
```bash
# Keep using Account B
# You have ~30 free builds available

npm run check:play-protect
npm run build:android
```

### After March 1, 2026
```bash
# Option A: Continue with Account B (if builds remaining)
npm run build:android

# Option B: Switch back to Account A (freshly reset)
eas logout
eas login
# Enter: your-original-email@gmail.com

# Then build:
npm run build:android
```

---

## Commands Reference

### Check Current Status
```bash
eas whoami                    # Shows current account
eas project:list              # Lists your projects
```

### Switch Accounts
```bash
eas logout                    # Logout current
eas login                     # Login to different account
```

### Build
```bash
npm run check:play-protect   # Verify compliance
npm run build:android        # Build for Play Store
npm run build:apk            # Build preview APK
npm run build:local          # Build locally
```

### Fix Issues
```bash
rm -rf .eas                   # Clear EAS cache (if needed)
eas project:init             # Reinitialize project
```

---

## Common Scenarios

### Scenario 1: Permission Denied Error

**Problem:** `You don't have the required permissions`

**Solution:**
```bash
eas whoami  # Check current account
eas logout
eas login   # Use correct account
```

**Read:** [EAS_AUTHENTICATION_FIX.md](EAS_AUTHENTICATION_FIX.md)

---

### Scenario 2: Out of Free Builds

**Problem:** `This account has used its Android builds...`

**Solution Options:**
1. **Wait 3 days** → Free plan resets March 1
2. **Use different account** → Switch to bruno18farnandes
3. **Build locally** → No cloud limit
4. **Upgrade plan** → Pay for unlimited

**Read:** [ALTERNATE_BUILD_METHODS.md](ALTERNATE_BUILD_METHODS.md)

---

### Scenario 3: Want to Use Original Account Again

**Problem:** Original account hit limit, want to reuse it later

**Solution:** After March 1 (plan reset):
```bash
eas logout
eas login
# Login with original email
npm run build:android  # Uses refreshed quota
```

**Read:** [EAS_ACCOUNT_REUSE_GUIDE.md](EAS_ACCOUNT_REUSE_GUIDE.md)

---

### Scenario 4: Want to Use Account B After Limit

**Problem:** Used up both accounts' free builds

**Solution:**
```bash
# Option 1: Wait another 30 days for Account B reset
# Option 2: Upgrade to paid plan ($99/month)
# Option 3: Build locally forever (free)
```

**Read:** [ALTERNATE_BUILD_METHODS.md](ALTERNATE_BUILD_METHODS.md#option-4-upgrade-eas-plan-for-ongoing-production-use)

---

## Timeline Reference

```
TODAY (Feb 25, 2026)
├─ Account A: ✗ OUT (0 builds left)
├─ Account B: ✓ FRESH (30 builds available)
└─ → USE ACCOUNT B

IN 3 DAYS (Mar 1, 2026)
├─ Account A: ✓ RESET (30 new builds) 
├─ Account B: ? PARTIAL (depends on usage)
└─ → CAN SWITCH TO ACCOUNT A

IN 30 DAYS (Mar 25, 2026)
├─ Account A: ? PARTIAL
├─ Account B: ✓ RESET (30 new builds)
└─ → CAN SWITCH TO ACCOUNT B
```

---

## File Summary

| File | Size | Read Time | Use When |
|------|------|-----------|----------|
| EAS_AUTHENTICATION_FIX.md | ~350 lines | 15 min | Permission errors |
| ALTERNATE_BUILD_METHODS.md | ~400 lines | 20 min | Hit free limit |
| EAS_ACCOUNT_REUSE_GUIDE.md | ~400 lines | 20 min | Manage multiple accounts |
| **This file** | ~250 lines | 5 min | Quick reference |

---

## When to Read Each Guide

**Right now:** You have EAS working with new account

**If you see error:** Go to relevant guide above

**Before March 1:** Plan your account switch strategy

**After March 1:** Decide which account to use

---

## Support Resources

- **All EAS Docs:** [docs.expo.dev/build/](https://docs.expo.dev/build/)
- **EAS Issues:** [github.com/expo/expo/issues](https://github.com/expo/expo/issues)
- **Email Support:** support@expo.dev (paid plans only)
- **Forums:** [forums.expo.dev](https://forums.expo.dev/)

---

## Key Takeaways

1. **Right now:** Use Account B (bruno18farnandes) - it's fresh
2. **Save info:** Note your original account email for later
3. **After March 1:** You can switch back to Account A (quota resets)
4. **No rush:** You have 3 days to decide strategy
5. **Consider upgrading:** If building professionally, $99/month unlimited

---

## Next Steps

1. ✅ **Current:** Using Account B (done)
2. ⏳ **Soon:** Wait until March 1 for plan reset
3. 🔄 **After Reset:** Decide to stay with B or switch to A
4. 📱 **Production:** Plan long-term (upgrade or local builds)

---

**Last Updated:** February 25, 2026  
**Your Status:** Ready to build with Account B  
**Next Milestone:** March 1, 2026 (Original account reset)

**Quick Links:**
- [Authentication Fix](EAS_AUTHENTICATION_FIX.md)
- [Build Methods](ALTERNATE_BUILD_METHODS.md)
- [Account Reuse](EAS_ACCOUNT_REUSE_GUIDE.md)
