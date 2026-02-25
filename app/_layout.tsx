import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';
import '@/i18n'; // Import i18n configuration

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { LocaleProvider } from '@/contexts/LocaleContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const { session, isInitialized, isGuest } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthScreen = segments[0] === 'auth' || segments[0] === 'verify';

    if (!session && !isGuest && !inAuthScreen) {
      // No session and not guest → go to auth
      router.replace('/auth');
    } else if ((session || isGuest) && inAuthScreen) {
      // Has session or guest but on auth/verify screen → go to home
      router.replace('/(tabs)');
    }
  }, [session, isGuest, isInitialized, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colorScheme === 'dark' ? '#111827' : '#f8fafc' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#3b5998'} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <LocaleProvider>
          <AuthGate />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{
              headerShown: false,
              animation: 'fade',
            }} />
            <Stack.Screen name="verify" options={{
              headerShown: false,
              animation: 'slide_from_right',
            }} />
            <Stack.Screen name="modal" options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              gestureDirection: 'vertical',
              contentStyle: {
                backgroundColor: 'transparent'
              }
            }} />
          </Stack>
          <StatusBar style="auto" />
        </LocaleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
