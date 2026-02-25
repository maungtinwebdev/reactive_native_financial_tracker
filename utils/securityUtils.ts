import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as FileSystem from 'expo-file-system/legacy';

export interface SecurityCheckResult {
  isSecure: boolean;
  issues: string[];
  recommendations: string[];
}

export const performSecurityChecks = async (): Promise<SecurityCheckResult> => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if app is in debug mode
  const isDebugMode = __DEV__;
  if (isDebugMode) {
    issues.push('App is running in debug mode');
    recommendations.push('Ensure release builds for production');
  }

  // Check for root detection
  const isRooted = await checkIfRooted();
  if (isRooted) {
    issues.push('Device appears to be rooted');
    recommendations.push('Rooted devices are not secure for financial apps');
  }

  // Check for emulator
  const isEmulator = DeviceInfo.isEmulator();
  if (isEmulator) {
    issues.push('Running on emulator');
    recommendations.push('Test on physical devices for security validation');
  }

  // Check app integrity
  const appIntegrityValid = await checkAppIntegrity();
  if (!appIntegrityValid) {
    issues.push('App integrity check failed');
    recommendations.push('Implement proper app signing verification');
  }

  // Check network security
  const networkSecure = await checkNetworkSecurity();
  if (!networkSecure) {
    issues.push('Network security configuration issue');
    recommendations.push('Verify SSL certificate pinning');
  }

  // Compute security status after all checks
  const isSecure = issues.length === 0 && !isDebugMode && !isRooted && !isEmulator;

  return {
    isSecure,
    issues,
    recommendations
  };
};

const checkIfRooted = async (): Promise<boolean> => {
  try {
    // Basic root detection - in a real app, you'd use more sophisticated methods
    if (Platform.OS === 'android') {
      // This is a simplified check - real apps would use multiple methods
      return Promise.resolve(false); // Assume not rooted for now
    }
    return Promise.resolve(false);
  } catch (error) {
    console.warn('Root check failed:', error);
    return Promise.resolve(false);
  }
};

const checkAppIntegrity = async (): Promise<boolean> => {
  try {
    // Check if app signature matches expected signature
    // This is a placeholder - real implementation would verify the APK signature
    return Promise.resolve(true);
  } catch (error) {
    console.warn('App integrity check failed:', error);
    return Promise.resolve(false);
  }
};

const checkNetworkSecurity = async (): Promise<boolean> => {
  try {
    // Check if network security config is properly set
    // This is a simplified check - real implementation would verify SSL certificates
    return Promise.resolve(true);
  } catch (error) {
    console.warn('Network security check failed:', error);
    return Promise.resolve(false);
  }
};

export const reportSecurityIssue = async (issue: string, details?: any) => {
  // In a real app, you might send this to a security monitoring service
  console.warn('Security Issue Reported:', issue, details);
  
  // For development, just log it
  if (__DEV__) {
    console.log('Security Issue (Dev Mode):', issue);
  }
};
