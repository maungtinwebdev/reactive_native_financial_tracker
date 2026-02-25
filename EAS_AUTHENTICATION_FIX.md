# EAS Authentication & Permission Issues - Fix Guide

**Error:** `Entity not authorized` - Your EAS account can't access this project  
**Solution:** Login with correct account or fix project permissions

---

## Quick Diagnosis

### Step 1: Check Current Account

```bash
eas whoami
```

**Output will show:**
- Your username
- Email
- Which organization you're in

### Step 2: Identify the Problem

**If wrong user logged in:**
```bash
eas logout
eas login
# Enter CORRECT email/password
```

**If correct user but still no permission:**
- This project belongs to different account
- Need to switch to that account
- Or get access granted

---

## Solution 1: Login with Correct Account (Most Common)

### Check Who You Are

```bash
eas whoami
```

### Logout Current Account

```bash
eas logout
```

### Login with Correct Account

```bash
eas login
# Enter email: your-correct-email@gmail.com
# Enter password: your-password
```

### Verify Login

```bash
eas whoami
# Should show your correct account
```

### Retry Build

```bash
npm run build:android
# Should work now
```

---

## Solution 2: Project Exists Under Different Account

If the project was created with Account A but you're logged in as Account B:

### Option A: Switch to Account A

```bash
eas logout
eas login
# Login as Account A (original creator)
npm run build:android
```

### Option B: Create New Project Under Current Account

```bash
# Remove existing EAS setup
rm -rf .eas

# Initialize with current account
eas project:init
# Select "Create a new project"
# This creates project under current account

# Rebuild
npm run build:android
```

**Note:** This creates a NEW project (new Project ID, new signing keys)

---

## Solution 3: Fix Project Access Permissions

### Invite Collaborator to Existing Project

If you need to grant access to current account:

1. **Login as original project owner:**
   ```bash
   eas logout
   eas login
   # Login as account that owns project
   ```

2. **Go to project settings:**
   - Visit https://expo.dev/
   - Find your project
   - Click "Settings"
   - Go to "Members" or "Access"

3. **Invite new user:**
   - Email: person@gmail.com
   - Role: Admin or Member

4. **New user accepts invite:**
   - Check email for invitation
   - Accept it
   - Verify access with `eas whoami`

---

## Solution 4: Transfer Project to Current Account

If you own the project but it's under an old account:

### Via Web Console

1. Login at https://expo.dev with owner account
2. Project Settings → Transfer Ownership
3. Enter new owner's email
4. New owner confirms transfer

### Verify Transfer

```bash
eas logout
eas login
# Login as new owner

eas project:info
# Should show project details
```

---

## Understanding EAS Project Structure

### What Controls Access

```
EAS Account (email@gmail.com)
  └─ Organization
      └─ Project (linked to app.json)
          ├─ Builds
          ├─ Members (with permissions)
          ├─ Secrets
          └─ Signing Keys
```

**Key Points:**
- Project belongs to specific account/organization
- Only account members can build
- app.json links to specific project
- Project ID in `.eas/project-id` file

---

## Common Scenarios

### Scenario 1: Personal Account → Work Account

```bash
# You created project with personal email
# Now trying with work email

# Solution: Login with personal account
eas logout
eas login
# personal-email@gmail.com
npm run build:android
```

### Scenario 2: Team Project Access

```bash
# Team owns project, you're new member

# Solution 1: Owner invites you
# You accept invite via email

# Solution 2: Ask owner to add you
# Project Settings → Members → Add member

# Verify with:
eas whoami
```

### Scenario 3: Multiple Accounts

```bash
# You have multiple EAS accounts

# Check current:
eas whoami

# Switch between:
eas logout
eas login
# Enter different email

# See which account owns project:
cat .eas/project-id
# Go to https://expo.dev/projects to see ownership
```

### Scenario 4: Lost Account Access

```bash
# Can't access original account

# Option 1: Recover account
# Visit https://expo.dev/forgot-password

# Option 2: Create new project
rm -rf .eas
eas project:init
# Create with new account
```

---

## Commands Reference

```bash
# Authentication
eas login                          # Login to EAS
eas logout                         # Logout from EAS
eas whoami                         # Check current account
eas account:update                 # Update account settings

# Project
eas project:info                   # Show project details
eas project:init                   # Create/link project
eas project:list                   # List your projects

# Building
npm run build:android              # Build with current account
npm run check:play-protect         # Verify compliance first
```

---

## Step-by-Step: Fix Permission Error

### Step 1: Identify Issue
```bash
eas whoami
# Note: your current email
```

### Step 2: Check Project Owner
```bash
cat .eas/project-id
# Go to https://expo.dev/projects
# Find project by ID - see who owns it
```

### Step 3: Match Account to Owner
```bash
# If different account owns it:
eas logout
eas login
# Enter owner's email
```

### Step 4: Verify Access
```bash
eas project:info
# Should show project details without error
```

### Step 5: Retry Build
```bash
npm run build:android
# Should work now
```

---

## Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Entity not authorized` | Wrong account logged in | `eas login` with correct email |
| `Project not found` | Project ID invalid | `eas project:init` to relink |
| `Not authenticated` | Not logged in | `eas login` |
| `Permission denied` | Account not member | Ask owner to add you as member |
| `Org is not found` | Organization deleted | `eas project:init` with new org |

---

## Prevention: Best Practices

### 1. Document Project Owner
```bash
# Save in your notes:
# Project Owner: yourname@gmail.com
# Project ID: (from .eas/project-id)
# Organization: (from https://expo.dev)
```

### 2. Use Team Organizations
```bash
# For team projects:
# Create org: https://expo.dev/organizations
# Add all team members
# Create project under org
# Everyone has access
```

### 3. Backup Credentials
```bash
# Save in secure location:
# - EAS account email
# - Password (in password manager)
# - Backup codes (if 2FA enabled)
```

### 4. Setup Multiple Users (For Teams)

```bash
# Owner:
# 1. Create project
# 2. Go to Project → Settings → Members
# 3. Add team member email

# Team Member:
# 1. Accept invite from email
# 2. eas login (with their account)
# 3. Can now build
```

---

## Switching Between Multiple Projects/Accounts

### Check Current Project

```bash
cat .eas/project-id
eas project:info
```

### Switch to Different Project

```bash
# If project already initialized:
cd path/to/other/project
eas project:info
npm run build:android

# If not initialized:
cd path/to/other/project
eas project:init
# Link to existing project or create new one
```

### Switch EAS Account

```bash
eas logout
eas login
# Enter different email
```

---

## Troubleshooting Steps

### If Still Getting Error After Login

```bash
# 1. Clear EAS cache
rm -rf ~/.eas

# 2. Re-login
eas logout
eas login

# 3. Re-initialize project
rm -rf .eas
eas project:init

# 4. Retry
npm run build:android
```

### If Project Not Found

```bash
# 1. Verify project exists
eas project:list
# Should show your projects

# 2. Check project ID
cat .eas/project-id

# 3. If not listed, reinitialize
rm -rf .eas
eas project:init
# Create new project or select from list
```

### If Still Can't Access

```bash
# Contact EAS Support:
# https://github.com/expo/expo/issues
# Provide Request ID from error message:
# Request ID: 1d083a45-f5f6-4fa3-baac-409b62472dab

# Or email: support@expo.dev
```

---

## FAQ

**Q: I have multiple EAS accounts, how do I switch?**
```bash
eas logout
eas login
# Enter different email
```

**Q: Can I use same project with multiple accounts?**
A: Yes, if accounts are in same organization. Owner can add members.

**Q: What if I forgot my EAS password?**
```bash
# Go to: https://expo.dev/forgot-password
# Or use CLI:
eas logout
eas login
# Will prompt for password reset if needed
```

**Q: Can I transfer project to different account?**
A: Yes, through Project Settings → Transfer Ownership (web console only)

**Q: What's a Project ID?**
A: Unique identifier for your project. Stored in `.eas/project-id`. Links app to EAS project.

**Q: Do I need to reinitialize after login?**
A: No, `eas login` is enough. But if project appears "lost", run `eas project:init`

---

## When All Else Fails

### Nuclear Option: Start Fresh

```bash
# Backup current state
git status
git stash (if needed)

# Remove EAS files
rm -rf .eas

# Clear EAS cache
rm -rf ~/.eas

# Logout
eas logout

# Clear browser cookies (logout there too)
# Visit: https://expo.dev/logout

# Wait 30 seconds

# Login fresh
eas login
# Use primary account email

# Reinitialize
eas project:init
# Select "Create a new project"

# Build
npm run build:android
```

---

## Success Checklist

- ✅ Ran `eas whoami` and confirmed correct account
- ✅ Verified project ownership (who created it)
- ✅ Logged in with correct account
- ✅ Project accessible with `eas project:info`
- ✅ Build succeeds with `npm run build:android`

---

## Support Resources

- **EAS Docs:** https://docs.expo.dev/build/
- **Expo Forums:** https://forums.expo.dev/
- **GitHub Issues:** https://github.com/expo/expo/issues
- **Email Support:** support@expo.dev (for paid plans)

---

**Last Updated:** February 25, 2026  
**Status:** Ready for troubleshooting  
**Common Fix:** Just login with correct account (`eas login`)
