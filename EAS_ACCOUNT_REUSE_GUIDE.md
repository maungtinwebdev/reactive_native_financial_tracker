# EAS Account Setup - Switching & Reusing After Free Plan Reset

Guide for managing multiple EAS accounts and switching back to original account when free plan resets.

---

## Timeline

**Current Status:** February 25, 2026
- Current account: `bruno18farnandes` (new account - just created)
- Free plan limit hit for original account
- Original project ID: `0db7c3d3-2b0b-46f9-b5f8-008f4d175db7`

**Free Plan Reset:** March 1, 2026 (in 3 days)
- After reset: Original account quota refreshed
- Option to switch back to original account

---

## Scenario: You Want to Reuse Original Account After Reset

When your original EAS account's free plan resets on March 1, you can switch back to it and continue using it for another 30 free builds.

### Step 1: Save Original Account Credentials (NOW)

Write down:
```
Original EAS Account Email: [SAVE THIS]
Original Project ID: 0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
Original Account Username: [SAVE THIS]
```

### Step 2: Continue With New Account (Until March 1)

```bash
# Current setup uses: bruno18farnandes
# Keep building with new account until plan reset
npm run build:android
```

### Step 3: After Plan Resets (March 1, 2026+)

Once the original account's free plan resets:

#### Option A: Switch Back to Original Account

```bash
# 1. Logout from current account
eas logout

# 2. Login with original account
eas login
# Enter: original-email@gmail.com
# Enter: original-password

# 3. Verify you're switched
eas whoami
# Should show: original-username
```

#### Option B: Continue With New Account

```bash
# 1. Keep using new account
eas whoami
# Shows: bruno18farnandes

# 2. Build whenever ready
npm run build:android
```

---

## Managing Multiple EAS Accounts

### Account Structure

```
Account A (Original)
├─ Email: original@gmail.com
├─ Project ID: 0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
├─ Plan: Free (30 builds/month)
├─ Reset: March 1, 2026
└─ Status: No access currently (limit reached)

Account B (Current)
├─ Email: bruno18farnandes@expo.dev
├─ Project ID: [NEW - will be assigned]
├─ Plan: Free (30 builds/month)
├─ Reset: March 25, 2026
└─ Status: Active - can build now
```

---

## Switching Between Accounts Strategy

### If You Have 2+ Accounts

**Recommended approach:**
1. Use Account A until limit reached (use 30 builds)
2. Switch to Account B for next 30 days
3. When Account A resets, switch back
4. Repeat cycle

### Commands to Switch

```bash
# Check current account
eas whoami

# Switch to Account A
eas logout
eas login
# Email: account-a@gmail.com

# Switch to Account B
eas logout
eas login
# Email: account-b@gmail.com
```

---

## Project Configuration for Multiple Accounts

### Current Setup in app.json

After reinitialization with new account:
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[NEW-PROJECT-ID]"
    },
    "extra": {
      "eas": {
        "projectId": "[NEW-PROJECT-ID]"
      }
    }
  }
}
```

### Switching Projects Between Accounts

**Problem:** Each account has separate projects
- Account A's project: ID `0db7c3d3...`
- Account B's project: ID `new-id-123...`

**Solution 1: Use Git Branches**
```bash
# Branch for Account A builds
git checkout -b account-a
# Configure app.json for Account A project
npm run build:android

# Branch for Account B builds
git checkout -b account-b
# Configure app.json for Account B project
npm run build:android
```

**Solution 2: Switch Back When Needed**
```bash
# When Account A resets, restore old project ID
eas logout
eas login
# Login as Account A

# Revert app.json to original project ID
git checkout original-branch
# Or manually edit to old project ID

npm run build:android
```

---

## Exact Steps: Back to Original Account After March 1

### Prerequisites
- Have original account email & password saved
- Know original project ID: `0db7c3d3-2b0b-46f9-b5f8-008f4d175db7`
- Wait until March 1, 2026 (plan resets)

### On March 1, 2026+

#### Step 1: Prepare app.json with Original Project ID

```bash
# Edit app.json to restore original project ID
# OR use git to revert:
git log --oneline app.json
# Find commit before changes
git checkout [commit-hash] -- app.json
```

#### Step 2: Login with Original Account

```bash
# Logout current
eas logout

# Login original
eas login
# Email: [your-original-email@gmail.com]
# Password: [your-original-password]

# Verify
eas whoami
```

#### Step 3: Rebuild

```bash
npm run check:play-protect

npm run build:android
# Should use Account A's renewed free plan
```

---

## File Changes to Track

### When Switching Accounts

**app.json changes:**
```json
// Account A version (original)
"updates": {
  "url": "https://u.expo.dev/0db7c3d3-2b0b-46f9-b5f8-008f4d175db7"
},
"extra": {
  "eas": {
    "projectId": "0db7c3d3-2b0b-46f9-b5f8-008f4d175db7"
  }
}

// Account B version (current/new)
"updates": {
  "url": "https://u.expo.dev/[NEW-ID]"
},
"extra": {
  "eas": {
    "projectId": "[NEW-ID]"
  }
}
```

### .eas/project-id

Created by EAS init, stores project ID locally:
```
[PROJECT-ID-HERE]
```

---

## Git Strategy for Multiple Accounts

### Option 1: Separate Branches

```bash
# Main branch - uses new Account B
git checkout main
cat app.json  # Shows new project ID

# Account A branch - uses original account
git checkout -b account-a-builds
# Restore old app.json
git log app.json
git checkout [old-commit] -- app.json

# To build with Account A after March 1:
git checkout account-a-builds
eas logout
eas login  # Use Account A
npm run build:android

# Back to Account B:
git checkout main
eas logout
eas login  # Use Account B
npm run build:android
```

### Option 2: Stash Configuration

```bash
# Save current config
git stash
# app.json saved

# Switch to old config
git checkout [old-commit-hash] -- app.json

# After build, restore
git stash pop
```

---

## Decision Tree: Which Account to Use

```
Today (Feb 25):
├─ Account A: OUT OF FREE BUILDS (don't use)
├─ Account B: FRESH QUOTA (use this)
└─ → Use Account B

After March 1:
├─ Account A: QUOTA RESET (30 new builds available)
├─ Account B: USED (builds counted down)
├─ Still have builds in Account B? → Use Account B
└─ Account B out? → Switch to Account A
```

---

## Building Timeline

### Current Week (Feb 25-Mar 1)
```
Account A: ✗ Limited (0 builds) - WAIT
Account B: ✓ Fresh (30 builds) - USE THIS
```

### After March 1
```
Account A: ✓ Reset (30 builds) - CAN USE
Account B: ? Remaining (depends on usage)
```

### Recommended Usage
```
Week 1 (Feb 25-Mar 1):  Use Account B (10 builds max)
Week 2 (Mar 1+):        Use Account A (30 builds) - FRESH PLAN
Week 3:                 Continue Account A or switch to B
Week 4:                 Rotate between accounts as needed
```

---

## Commands Cheat Sheet

### Check Account Status
```bash
eas whoami                    # Show current account
eas project:list              # List your projects
eas project:info              # Project details (if accessible)
```

### Switch Accounts
```bash
eas logout                    # Logout current
eas login                     # Login new account
eas logout && eas login       # Quick switch
```

### Build with Specific Account
```bash
# 1. Switch account
eas logout
eas login

# 2. Configure app.json (if needed)
# Edit app.json with correct project ID

# 3. Build
npm run build:android
```

### Save/Restore Configuration
```bash
# Save current app.json
cp app.json app.json.account-b

# Restore old configuration
cp app.json.account-a app.json

# Or use git
git stash
git checkout [branch-or-commit] -- app.json
```

---

## Preventing This in Future

### Strategy 1: Plan Upgrade Path
- Use free plan now (while developing)
- Upgrade to $99/month subscription before release
- Get unlimited builds + priority support

### Strategy 2: Rotate Accounts
- Create 2-3 EAS accounts
- Use one per month
- Cycle through them

### Strategy 3: Local Builds
- Setup local build environment (Android SDK)
- Build locally for free (no limit)
- Use EAS only for final release

### Strategy 4: Team Organization
- Create EAS organization
- Add multiple team members
- Each gets their own free plan quota
- Build with different team members

---

## Important Files to Track

### For Switching Back

Save these files when switching to new account:

**Current app.json (Account B):**
```bash
cp app.json app.json.bruno18farnandes
```

**Original app.json (Account A):**
```bash
git log --oneline app.json | head -5
# Note the commit hash of original version
```

**Restore when needed:**
```bash
git checkout [original-commit-hash] -- app.json
# Or manually copy
cp app.json.account-a app.json
```

---

## Signing Keys Consideration

⚠️ **IMPORTANT:** Each account uses different signing keys!

- Account A's builds: Signed with Account A key
- Account B's builds: Signed with Account B key
- Can't mix keys in same Play Store app!

**Solution:**
- For testing: Use different apps (different package names)
- For production: Pick ONE account and stick with it
- Upload all versions to Play Store with same account

---

## When to Upgrade

Consider upgrading when:
- ✓ Need more than 30 builds/month
- ✓ Building with team (multiple people)
- ✓ Want priority support
- ✓ Ready for production release
- ✓ Need faster builds (5 min vs 30 min)

**Cost:** $99/month for unlimited builds + features

---

## Troubleshooting: Can't Switch Back

### If Original Account Not Working

```bash
# 1. Check account exists
eas login
# Enter original email - if wrong password, use forgot-password

# 2. Verify project still exists
eas project:list
# Should show original project ID

# 3. Check project is accessible
eas project:info
# If error, project may have been deleted
```

### If Project Not Found

```bash
# Project might have been deleted
# Options:
# 1. Create new project with original account
eas project:init

# 2. Contact Expo support if project should exist
# Reference: Project ID 0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
```

---

## Reference: Your Accounts

### Account A (Original - Currently Limited)
- Status: Free plan exhausted until March 1
- Project ID: `0db7c3d3-2b0b-46f9-b5f8-008f4d175db7`
- Action: **WAIT until March 1** to use again
- Available: March 1, 2026+

### Account B (Current - New)
- Status: Fresh free plan (30 builds available)
- Project ID: [Being assigned during init]
- Action: **USE NOW** for current builds
- Available: Now through March 25

---

## Quick Reference: After March 1

```bash
# If you want to use Account A again:

# 1. Switch to Account A
eas logout
eas login
# original-email@gmail.com

# 2. Update project configuration (if using git)
git checkout account-a-builds -- app.json

# 3. Build
npm run build:android
```

---

## Summary

| What | When | How |
|------|------|-----|
| **Now (Feb 25)** | Today | Use Account B only |
| **Wait** | Next 3 days | Don't use Account A |
| **March 1** | Plan resets | Can switch back to Account A |
| **After March 1** | Use renewed quota | Switch accounts as needed |
| **Best Practice** | Always | Upgrade to paid plan before production |

---

**Last Updated:** February 25, 2026  
**Free Plan Reset:** March 1, 2026  
**Original Account Status:** Limited until reset  
**Action:** Continue with new account, plan to switch back after March 1
