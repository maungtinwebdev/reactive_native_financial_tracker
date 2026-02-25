#!/usr/bin/env node

/**
 * Google Play Protect Compliance Checker
 * Validates app configuration against Play Protect security requirements
 * Run: node scripts/check-play-protect.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

let passCount = 0;
let failCount = 0;
let warningCount = 0;

const checks = [];

// Helper functions
function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  switch (type) {
    case 'pass':
      console.log(`${GREEN}✓${RESET} [${timestamp}] ${message}`);
      passCount++;
      break;
    case 'fail':
      console.log(`${RED}✗${RESET} [${timestamp}] ${message}`);
      failCount++;
      break;
    case 'warning':
      console.log(`${YELLOW}⚠${RESET} [${timestamp}] ${message}`);
      warningCount++;
      break;
    case 'info':
      console.log(`${BLUE}ℹ${RESET} [${timestamp}] ${message}`);
      break;
    case 'header':
      console.log(`\n${BOLD}${BLUE}═══ ${message} ═══${RESET}\n`);
      break;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  if (!fileExists(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

function checkFileExists(filePath, description) {
  if (fileExists(filePath)) {
    log('pass', `${description} found`);
    return true;
  } else {
    log('fail', `${description} missing at ${filePath}`);
    return false;
  }
}

function checkFileContent(filePath, pattern, description) {
  const content = readFile(filePath);
  if (!content) {
    log('fail', `Cannot check ${description} - file not found`);
    return false;
  }

  const regex = typeof pattern === 'string' 
    ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) 
    : pattern;

  if (regex.test(content)) {
    log('pass', description);
    return true;
  } else {
    log('fail', description);
    return false;
  }
}

function checkFileContentNot(filePath, pattern, description) {
  const content = readFile(filePath);
  if (!content) {
    log('fail', `Cannot check ${description} - file not found`);
    return false;
  }

  const regex = typeof pattern === 'string' 
    ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) 
    : pattern;

  if (!regex.test(content)) {
    log('pass', description);
    return true;
  } else {
    log('fail', description);
    return false;
  }
}

// Start checks
console.clear();
console.log(`${BOLD}${BLUE}Google Play Protect Compliance Checker${RESET}`);
console.log(`Financial Tracker Android Export Validation\n`);

// 1. AndroidManifest.xml checks
log('header', 'AndroidManifest.xml Security Configuration');

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
checkFileExists(manifestPath, 'AndroidManifest.xml');
checkFileContent(manifestPath, 'android:allowBackup="false"', 'Data backup disabled (allowBackup=false)');
checkFileContent(manifestPath, 'android:usesCleartextTraffic="false"', 'Cleartext traffic disabled (usesCleartextTraffic=false)');
checkFileContent(manifestPath, 'android:networkSecurityConfig="@xml/network_security_config"', 'Network security config configured');
checkFileContent(manifestPath, 'android:debuggable="false"', 'Debuggable mode disabled (debuggable=false)');
checkFileContentNot(manifestPath, 'READ_EXTERNAL_STORAGE', 'READ_EXTERNAL_STORAGE permission not declared');
checkFileContentNot(manifestPath, 'WRITE_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE permission not declared');
checkFileContentNot(manifestPath, 'SYSTEM_ALERT_WINDOW', 'SYSTEM_ALERT_WINDOW permission not declared');

// 2. Network Security Config checks
log('header', 'Network Security Configuration');

const networkSecurityPath = 'android/app/src/main/res/xml/network_security_config.xml';
checkFileExists(networkSecurityPath, 'Network security config');
checkFileContent(networkSecurityPath, 'cleartextTrafficPermitted="false"', 'Cleartext traffic globally disabled');
checkFileContent(networkSecurityPath, 'domain', 'Domain whitelist configured');

// 3. Build Configuration checks
log('header', 'Build Configuration (Obfuscation & Minification)');

const buildGradlePath = 'android/app/build.gradle';
checkFileExists(buildGradlePath, 'app/build.gradle');
checkFileContent(buildGradlePath, /minifyEnabled\s*=\s*true|minifyEnabled\s+true/, 'Code minification enabled');
checkFileContent(buildGradlePath, /shrinkResources\s*=\s*true|shrinkResources\s+true|enableShrinkResources/, 'Resource shrinking enabled');
checkFileContent(buildGradlePath, /proguardFiles/, 'ProGuard rules configured');

// 4. Gradle Properties checks
log('header', 'Gradle Release Build Properties');

const gradlePropsPath = 'android/gradle.properties';
const gradleProps = readFile(gradlePropsPath);
if (gradleProps) {
  if (gradleProps.includes('enableMinifyInReleaseBuilds') && gradleProps.includes('enableMinifyInReleaseBuilds=true')) {
    log('pass', 'Minification enabled in release builds');
  } else {
    log('warning', 'Verify enableMinifyInReleaseBuilds is set to true');
  }
}

// 5. Package.json checks
log('header', 'Package.json Dependencies');

const packageJsonPath = 'package.json';
const packageJson = JSON.parse(readFile(packageJsonPath));

const criticalDeps = {
  'react-native': 'React Native',
  'expo': 'Expo Framework',
  '@supabase/supabase-js': 'Supabase SDK',
  '@react-navigation/native': 'React Navigation'
};

Object.entries(criticalDeps).forEach(([dep, name]) => {
  if (packageJson.dependencies[dep]) {
    log('pass', `${name} (${dep}@${packageJson.dependencies[dep]}) is declared`);
  } else {
    log('fail', `${name} (${dep}) is missing`);
  }
});

// 6. Security files checks
log('header', 'Security & Configuration Files');

const requiredFiles = [
  { path: 'google_play_protect_fixes.md', desc: 'Play Protect fixes documentation' },
  { path: 'PLAY_PROTECT_CHECKLIST.md', desc: 'Play Protect compliance checklist' },
  { path: 'APK_BUILD_GUIDE.md', desc: 'APK build guide' },
  { path: 'SupabaseGuide.md', desc: 'Supabase integration guide' },
  { path: 'network_security_config.xml', desc: 'Network security configuration' }
];

requiredFiles.forEach(({ path: filePath, desc }) => {
  checkFileExists(filePath, desc);
});

// 7. App Configuration checks
log('header', 'App Configuration (app.json)');

const appJsonPath = 'app.json';
try {
  const appJson = JSON.parse(readFile(appJsonPath));
  
  if (appJson.expo?.orientation === 'portrait') {
    log('pass', 'Portrait orientation enforced');
  } else {
    log('warning', 'Consider enforcing portrait orientation');
  }

  if (appJson.expo?.plugins) {
    log('pass', 'Plugins configured in app.json');
  } else {
    log('warning', 'No plugins detected in app.json');
  }

  if (appJson.expo?.scheme) {
    log('pass', `Custom scheme configured: ${appJson.expo.scheme}`);
  } else {
    log('warning', 'No custom scheme configured');
  }
} catch (e) {
  log('fail', 'Failed to parse app.json');
}

// 8. Code scanning checks
log('header', 'Code Quality & Security Scanning');

try {
  const output = execSync('npm list', { encoding: 'utf-8', stdio: 'pipe' });
  if (output.includes('ERR!')) {
    log('warning', 'Some dependency issues detected - run npm install');
  } else {
    log('pass', 'All dependencies installed correctly');
  }
} catch (e) {
  log('warning', 'Could not verify dependencies - ensure npm install is run');
}

// 9. Build tools check
log('header', 'Android Build Tools & SDK');

const androidPath = process.env.ANDROID_HOME || path.join(process.env.HOME, 'Library/Android/sdk');
if (fileExists(androidPath)) {
  log('pass', `Android SDK found at ${androidPath}`);
} else {
  log('warning', 'Android SDK path not found - ensure ANDROID_HOME is set');
}

// 10. Export readiness
log('header', 'Export Readiness Checks');

checkFileExists('build-local-apk.sh', 'Local APK build script');
checkFileExists('eas.json', 'EAS configuration file');

const easJson = readFile('eas.json');
if (easJson && (easJson.includes('production') || easJson.includes('preview'))) {
  log('pass', 'EAS build profiles configured');
} else {
  log('warning', 'Verify EAS build profiles in eas.json');
}

// Summary
log('header', 'Compliance Summary');

const total = passCount + failCount + warningCount;
const passPercentage = ((passCount / total) * 100).toFixed(1);

console.log(`${BOLD}Total Checks:${RESET} ${total}`);
console.log(`${GREEN}${BOLD}Passed:${RESET} ${passCount} (${passPercentage}%)`);
console.log(`${YELLOW}${BOLD}Warnings:${RESET} ${warningCount}`);
console.log(`${RED}${BOLD}Failed:${RESET} ${failCount}`);

// Recommendation
log('header', 'Recommendation');

if (failCount === 0 && warningCount <= 2) {
  console.log(`${GREEN}${BOLD}✓ APP IS READY FOR PLAY PROTECT EXPORT${RESET}\n`);
  console.log('Your Financial Tracker app meets Google Play Protect requirements.');
  console.log('\nNext steps for Android export:');
  console.log('  1. Run: npm run build:android');
  console.log('  2. Generate production signing key (if not already done)');
  console.log('  3. Upload APK to Google Play Console');
  console.log('  4. Run internal testing before public release\n');
  process.exit(0);
} else if (failCount === 0) {
  console.log(`${YELLOW}${BOLD}⚠ REVIEW WARNINGS BEFORE EXPORT${RESET}\n`);
  console.log('Address the warnings above before exporting to Play Protect.\n');
  process.exit(1);
} else {
  console.log(`${RED}${BOLD}✗ CRITICAL ISSUES MUST BE FIXED${RESET}\n`);
  console.log('Fix all failed checks before attempting to export.\n');
  process.exit(1);
}
