# How to Get Original Project ID & Entity - Account A & B Reference

Guide to retrieve, find, and recover project IDs and entity information from original accounts.

---

## What You Need to Find

### Project ID
```
0db7c3d3-2b0b-46f9-b5f8-008f4d175db7  ← This is what you're looking for
```

### Entity
The Expo/EAS project entity identifier (different from project ID)

### Account Info
- Email address
- Username
- Account ID

---

## Method 1: From Your Files (Easiest)

### Check app.json

```bash
cat app.json | grep -A 5 "updates"
```

**Output:**
```json
"updates": {
  "url": "https://u.expo.dev/0db7c3d3-2b0b-46f9-b5f8-008f4d175db7"
}
```

**Project ID:** `0db7c3d3-2b0b-46f9-b5f8-008f4d175db7`

---

### Check app.json (extra.eas section)

```bash
cat app.json | grep -A 10 "extra"
```

**Output:**
```json
"extra": {
  "router": {},
  "eas": {
    "projectId": "0db7c3d3-2b0b-46f9-b5f8-008f4d175db7"
  }
}
```

**Project ID:** Same as above

---

### Check .eas Directory

```bash
cat .eas/project-id
```

**Output:**
```
0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
```

---

## Method 2: From Git History (If You Have It)

### See Previous app.json Versions

```bash
git log --oneline app.json
```

**Output:**
```
a1b2c3d Updated app.json (current)
d4e5f6g Fixed EAS config (old Account A setup)
h7i8j9k Initial setup
```

### Get Old Project ID from Git

```bash
# Checkout previous version
git show d4e5f6g:app.json | grep projectId

# Or view full updates section
git show d4e5f6g:app.json | grep -A 2 "updates"
```

### View All Changes to Project ID

```bash
git log -p app.json | grep -B 5 -A 5 "projectId"
```

---

## Method 3: Query EAS CLI (If Logged In)

### List All Your Projects

```bash
eas project:list
```

**Output:**
```
Fetching projects from Expo...
Account: bruno18farnandes

┌─────────────────────────────────────────────┐
│ ID                                          │ Name              │
├─────────────────────────────────────────────┤
│ 0db7c3d3-2b0b-46f9-b5f8-008f4d175db7       │ FinancialTracker  │
│ new-proj-id-after-reinit-123456789         │ FinancialTracker  │
└─────────────────────────────────────────────┘
```

### Get Detailed Project Info

```bash
eas project:info
```

**Output (if accessible):**
```
Project: FinancialTracker
Account: bruno18farnandes
ID: 0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
Slug: FinancialTracker
```

---

## Method 4: From EAS Web Console

### Login and View

1. Go to https://expo.dev/
2. Login with your account
3. View your projects
4. Click on project
5. Find Project ID in URL or Settings

**URL pattern:**
```
https://expo.dev/projects/[PROJECT-ID-HERE]
https://expo.dev/projects/0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
```

**Settings Tab:** Shows full project ID

---

## Method 5: From Build Artifacts

### Check EAS Build History

```bash
eas build --platform android --status
```

**Output shows:**
- Build history
- Project ID in each build record

### Download Build Details

```bash
eas build --platform android --latest
```

Shows project information for last build

---

## Finding Entity Information

### Get Entity ID from app.json URL

```bash
cat app.json | grep "u.expo.dev"
```

**Pattern:**
```
https://u.expo.dev/[PROJECT-ID]
                    ↑
            This is the entity/project ID
```

### Entity in Error Messages

When you get errors, they show entity:

```
Original error message: Entity not authorized: AppEntity[0db7c3d3-2b0b-46f9-b5f8-008f4d175db7]
                                                          ↑
                                          This is the Entity ID
```

---

## Reference: Your Known IDs

### Account A (Original - Limited)
```
Project ID:    0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
Entity:        AppEntity[0db7c3d3-2b0b-46f9-b5f8-008f4d175db7]
Plan Resets:   March 1, 2026
Status:        Limited until reset
```

### Account B (Current)
```
Project ID:    [To be assigned during project:init]
Entity:        AppEntity[[NEW-ID]]
Status:        Fresh quota
```

---

## Complete Search Commands

### Find All Project IDs in Your Project

```bash
# Search all files
grep -r "projectId" .

# Search app.json only
grep "projectId" app.json

# Search git history
git log -p | grep -i "projectid"

# Search URLs
grep -r "u.expo.dev" .
```

### Find Your Account Info

```bash
# Current logged-in account
eas whoami

# Project owner info
eas project:info

# All your projects
eas project:list

# Organization info
eas org:info (if in org)
```

---

## Recover Lost Project ID

### If You Lost the ID

**Option 1: Check Git**
```bash
git log --all --oneline app.json
git show [commit-hash]:app.json | grep projectId
```

**Option 2: List Your Projects**
```bash
eas logout
eas login  # Login as original account

eas project:list
# Find the project in the list
```

**Option 3: Check EAS Console**
1. Login to https://expo.dev
2. Look at project URL: `https://expo.dev/projects/[ID-HERE]`
3. Copy the ID

**Option 4: Contact Expo Support**
- Email: support@expo.dev
- Provide: App name, email, approximate creation date
- They can look up your project

---

## If You Have Multiple Projects

### Distinguish Between Them

```bash
eas project:list
```

**Shows:**
```
ID                                    │ Name              │ Slug
0db7c3d3-2b0b-46f9-b5f8-008f4d175db7 │ FinancialTracker  │ FinancialTracker
abc123def456ghi789jkl012mnop345qrs   │ FinancialTracker  │ FinancialTracker-2
```

### Identify by Dates

```bash
# Check file dates
ls -la app.json eas.json

# Check git dates
git log --oneline --date=short --format="%h %ad %s" app.json
```

---

## Backup: Save Your IDs Now

### Create ID Reference File

```bash
cat > PROJECT_IDS.txt << 'EOF'
=== FINANCIAL TRACKER - PROJECT IDS ===

Account A (Original):
  Email: [your-original-email@gmail.com]
  Username: [original-username]
  Project ID: 0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
  Entity: AppEntity[0db7c3d3-2b0b-46f9-b5f8-008f4d175db7]
  Status: Limited until March 1, 2026
  Plan Resets: March 1, 2026

Account B (Current):
  Email: bruno18farnandes@expo.dev
  Username: bruno18farnandes
  Project ID: [Assign during project:init]
  Entity: [Will be assigned]
  Status: Fresh quota (30 builds)
  Plan Resets: March 25, 2026

=== SWITCHING BETWEEN ACCOUNTS ===

To switch to Account A:
  eas logout
  eas login
  # Enter: [your-original-email@gmail.com]

To switch back to Account B:
  eas logout
  eas login
  # Enter: bruno18farnandes@expo.dev

EOF

# View your reference
cat PROJECT_IDS.txt
```

### Keep in Git (Safe)

```bash
git add PROJECT_IDS.txt
git commit -m "chore: document project IDs for account reference"
git push
```

---

## Commands Quick Reference

```bash
# Get current account
eas whoami

# Get current project info
eas project:info

# List your projects
eas project:list

# Get project ID from file
cat .eas/project-id

# Get from app.json
grep projectId app.json

# See git history
git log app.json

# Extract old version
git show [commit]:app.json
```

---

## Finding Entity from Error

### Error Contains Entity

```
Entity not authorized: AppEntity[0db7c3d3-2b0b-46f9-b5f8-008f4d175db7]
                       ↑ Entity
```

### Extract from Error Message

```bash
# Example error
ERROR_MSG="Entity not authorized: AppEntity[0db7c3d3-2b0b-46f9-b5f8-008f4d175db7]"

# Extract entity
echo $ERROR_MSG | grep -oP 'AppEntity\[\K[^]]*'
# Output: 0db7c3d3-2b0b-46f9-b5f8-008f4d175db7
```

---

## Verification Checklist

- ✅ Found Project ID: `0db7c3d3-2b0b-46f9-b5f8-008f4d175db7`
- ✅ Found Entity: `AppEntity[0db7c3d3-2b0b-46f9-b5f8-008f4d175db7]`
- ✅ Know Account A email
- ✅ Know Account B email (bruno18farnandes)
- ✅ Saved IDs in reference file
- ✅ Can switch between accounts

---

## When to Use Each Source

| Source | When | Best For |
|--------|------|----------|
| app.json | Always available | Quick check |
| .eas/project-id | After init | Exact current ID |
| Git history | If tracked | Find old versions |
| eas project:list | Logged in | All your projects |
| EAS Console | Web access | Full details |
| Error messages | When errors occur | Debugging |

---

## Summary

### To Get Project ID:
```bash
# Easiest:
grep projectId app.json

# Or:
cat .eas/project-id

# Or:
eas project:list
```

### To Get Entity:
```bash
# From app.json URL:
grep "u.expo.dev" app.json

# From errors:
# Look for: AppEntity[ID-HERE]

# From CLI:
eas project:info
```

### To Get Account Info:
```bash
# Current account:
eas whoami

# All projects in account:
eas project:list

# Full project details:
eas project:info
```

---

## Your Current IDs

| Item | Value |
|------|-------|
| **Account A - Project ID** | `0db7c3d3-2b0b-46f9-b5f8-008f4d175db7` |
| **Account A - Entity** | `AppEntity[0db7c3d3-2b0b-46f9-b5f8-008f4d175db7]` |
| **Account A - Status** | Limited (resets March 1) |
| **Account B - Current** | bruno18farnandes |
| **Account B - Project ID** | [Will be assigned] |
| **Account B - Status** | Fresh quota (30 builds) |

---

**Last Updated:** February 25, 2026  
**Reference:** Original Project ID saved  
**Action:** Use Account B now, can reference Account A after March 1
