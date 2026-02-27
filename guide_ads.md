# Google Ads Integration Guide for FinancialTracker

## 📱 **Overview**

This guide will help you integrate Google AdMob ads into your FinancialTracker React Native app to generate revenue while maintaining a good user experience.

## 🚀 **Prerequisites**

1. **Google AdMob Account**: Create account at [https://apps.admob.com](https://apps.admob.com)
2. **App Published**: Your app must be published or ready for publishing
3. **Payment Setup**: Configure payment information in AdMob
4. **Privacy Policy**: Create and link privacy policy

## 📋 **Step 1: AdMob Setup**

### 1.1 Create Ad Unit IDs
```
Banner Ad ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
Interstitial Ad ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
Rewarded Ad ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

### 1.2 Test Ad Unit IDs (Development)
```
Banner: ca-app-pub-3940256099942544/6300978111
Interstitial: ca-app-pub-3940256099942544/1033173712
Rewarded: ca-app-pub-3940256099942544/5224354917
```

## 🔧 **Step 2: Install Required Packages**

```bash
# Install Google Mobile Ads SDK
npm install react-native-google-mobile-ads

# Install for iOS
cd ios && pod install && cd ..
```

## ⚙️ **Step 3: Configure Android**

### 3.1 Update AndroidManifest.xml
```xml
<!-- Add to android/app/src/main/AndroidManifest.xml -->
<manifest>
    <application>
        <!-- Add this inside application tag -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
    </application>
</manifest>
```

### 3.2 Update build.gradle
```gradle
// Add to android/app/build.gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        // Add this line
        multiDexEnabled true
    }
}

dependencies {
    // Add these dependencies
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

## 🍎 **Step 4: Configure iOS**

### 4.1 Update Info.plist
```xml
<!-- Add to ios/FinancialTracker/Info.plist -->
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX</string>

<key>SKAdNetworkItems</key>
<array>
    <dict>
        <key>SKAdNetworkIdentifier</key>
        <string>skadnetwork.google.com</string>
    </dict>
</array>
```

### 4.2 Update AppDelegate.mm
```objectivec
// Add to ios/FinancialTracker/AppDelegate.mm
#import <GoogleMobileAds/GoogleMobileAds.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Add this line
  [[GADMobileAds sharedInstance] startWithCompletionHandler:nil];
  
  // ... existing code
  return YES;
}
```

## 📱 **Step 5: Create Ad Components**

### 5.1 Banner Ad Component
```typescript
// components/ads/BannerAd.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ 
  ? TestIds.BANNER 
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

export const BannerAdComponent = () => {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
```

### 5.2 Interstitial Ad Component
```typescript
// components/ads/InterstitialAd.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ 
  ? TestIds.INTERSTITIAL 
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

export const useInterstitialAd = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        interstitial.load();
      }
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const showAd = () => {
    if (loaded) {
      interstitial.show();
    }
  };

  return { showAd, loaded };
};
```

### 5.3 Rewarded Ad Component
```typescript
// components/ads/RewardedAd.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  RewardedAd,
  AdEventType,
  TestIds,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ 
  ? TestIds.REWARDED 
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

export const useRewardedAd = (onReward: () => void) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );

    const unsubscribeEarnedReward = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        onReward();
      },
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        rewardedAd.load();
      }
    );

    rewardedAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarnedReward();
      unsubscribeClosed();
    };
  }, [onReward]);

  const showAd = () => {
    if (loaded) {
      rewardedAd.show();
    }
  };

  return { showAd, loaded };
};
```

## 🎯 **Step 6: Implement Ads in Your App**

### 6.1 Add Banner Ads to Screens
```typescript
// app/(tabs)/index.tsx
import { BannerAdComponent } from '@/components/ads/BannerAd';

export default function DashboardScreen() {
  // ... existing code

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* ... existing content */}
        </ScrollView>
      </SafeAreaView>

      {/* Add Banner Ad at bottom */}
      <BannerAdComponent />

      {/* Existing FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
        onPress={() => router.push('/modal')}
      >
        <Plus color={theme === 'dark' ? Colors.light.tint : '#fff'} size={32} />
      </TouchableOpacity>
    </View>
  );
}
```

### 6.2 Add Interstitial Ads
```typescript
// app/(tabs)/transactions.tsx
import { useInterstitialAd } from '@/components/ads/InterstitialAd';

export default function TransactionsScreen() {
  const { showAd } = useInterstitialAd();

  // Show ad when user navigates to this screen
  useEffect(() => {
    const timer = setTimeout(() => {
      showAd();
    }, 2000); // Show ad after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // ... existing code
}
```

### 6.3 Add Rewarded Ads for Premium Features
```typescript
// components/premium/UnlockFeatures.tsx
import { useRewardedAd } from '@/components/ads/RewardedAd';

export const UnlockFeatures = () => {
  const [isPremium, setIsPremium] = useState(false);
  
  const handleReward = () => {
    setIsPremium(true);
    // Grant premium features for 24 hours
  };

  const { showAd, loaded } = useRewardedAd(handleReward);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock Premium Features</Text>
      <Text style={styles.description}>
        Watch an ad to unlock premium features for 24 hours
      </Text>
      
      <TouchableOpacity
        style={[styles.button, { opacity: loaded ? 1 : 0.5 }]}
        onPress={showAd}
        disabled={!loaded}
      >
        <Text style={styles.buttonText}>
          {loaded ? 'Watch Ad & Unlock' : 'Loading...'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

## 📊 **Step 7: Ad Placement Strategy**

### 7.1 Recommended Ad Placements
```
1. Dashboard Screen: Banner ad at bottom
2. Transactions Screen: Interstitial ad on entry
3. Analytics Screen: Banner ad after charts
4. Add Transaction Modal: No ads (user experience)
5. Premium Features: Rewarded ads for unlock
```

### 7.2 Ad Frequency Settings
```typescript
// utils/adFrequency.ts
export const AD_FREQUENCY = {
  INTERSTITIAL_INTERVAL: 300000, // 5 minutes
  DAILY_REWARDED_LIMIT: 5, // Max 5 rewarded ads per day
  BANNER_ROTATION: 30000, // 30 seconds
};

export const shouldShowAd = (lastAdTime: number, interval: number) => {
  return Date.now() - lastAdTime > interval;
};
```

## 🔒 **Step 8: Privacy & Compliance**

### 8.1 GDPR Compliance
```typescript
// utils/privacy.ts
import { AdsConsent } from 'react-native-google-mobile-ads';

export const requestConsent = async () => {
  const consentInfo = await AdsConsent.requestInfoUpdate();
  
  if (consentInfo.isConsentFormAvailable) {
    const result = await AdsConsent.showConsentForm();
    return result;
  }
  
  return consentInfo.canRequestAds;
};
```

### 8.2 CCPA Compliance
```typescript
// Add to App.tsx
import { AdsConsent } from 'react-native-google-mobile-ads';

export default function App() {
  useEffect(() => {
    // Set privacy settings
    AdsConsent.setTagForUnderAgeOfConsent(false);
    AdsConsent.setTagForChildDirectedTreatment(false);
  }, []);

  // ... existing code
}
```

## 📈 **Step 9: Ad Performance Monitoring**

### 9.1 Ad Analytics
```typescript
// utils/adAnalytics.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trackAdEvent = async (eventType: string, adType: string) => {
  const timestamp = Date.now();
  const event = {
    type: eventType,
    adType,
    timestamp,
  };

  try {
    const existingEvents = await AsyncStorage.getItem('adEvents');
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    await AsyncStorage.setItem('adEvents', JSON.stringify(events));
  } catch (error) {
    console.error('Error tracking ad event:', error);
  }
};
```

### 9.2 Revenue Tracking
```typescript
// utils/revenueTracking.ts
export const trackRevenue = (adType: string, revenue: number) => {
  // Send to analytics service
  console.log(`Ad Revenue: ${adType} - $${revenue}`);
  
  // You can integrate with Firebase Analytics, Amplitude, etc.
  // analytics().logEvent('ad_revenue', {
  //   ad_type: adType,
  //   revenue: revenue,
  //   currency: 'USD'
  // });
};
```

## 🎨 **Step 10: UI/UX Best Practices**

### 10.1 Ad Loading States
```typescript
// components/ads/AdPlaceholder.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export const AdPlaceholder = ({ loading = false }) => {
  if (loading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="small" color="#666" />
        <Text style={styles.text}>Loading ad...</Text>
      </View>
    );
  }

  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>Ad space</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    height: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: '#666',
  },
});
```

### 10.2 Ad-Free Premium Option
```typescript
// components/premium/AdFreeOption.tsx
export const AdFreeOption = () => {
  const handlePurchase = () => {
    // Implement in-app purchase
    // Store purchase in AsyncStorage
    AsyncStorage.setItem('isPremium', 'true');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Go Ad-Free</Text>
      <Text style={styles.description}>
        Remove all ads and support development
      </Text>
      <TouchableOpacity style={styles.button} onPress={handlePurchase}>
        <Text style={styles.buttonText}>Remove Ads - $4.99</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## ⚠️ **Important Notes**

### AdMob Policies
1. **No fake clicks**: Never incentivize users to click ads
2. **Proper placement**: Don't place ads near buttons
3. **Content restrictions**: Financial apps have additional restrictions
4. **User experience**: Don't interrupt core functionality

### Testing
1. **Always use test ads** during development
2. **Test on real devices**, not emulators
3. **Check ad loading** in different network conditions
4. **Verify GDPR compliance** in EU regions

### Revenue Optimization
1. **A/B test ad placements**
2. **Monitor fill rates**
3. **Adjust frequency based on user feedback**
4. **Consider rewarded ads for premium features**

## 🚀 **Deployment Checklist**

- [ ] Replace test ad unit IDs with real ones
- [ ] Test ads on production build
- [ ] Verify GDPR consent flow
- [ ] Check ad performance on different devices
- [ ] Monitor AdMob dashboard for issues
- [ ] Set up revenue tracking
- [ ] Test premium purchase flow

## 📞 **Support**

For issues with Google Ads:
- [AdMob Help Center](https://support.google.com/admob)
- [React Native Google Mobile Ads Docs](https://github.com/invertase/react-native-google-mobile-ads)
- [AdMob Policy Center](https://support.google.com/admob/answer/6138512)

---

**Expected Revenue**: Financial apps typically earn $0.50-$2.00 per daily active user with proper ad implementation.
