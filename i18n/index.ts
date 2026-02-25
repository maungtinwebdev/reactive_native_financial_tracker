import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import mm from './locales/mm.json';
import jp from './locales/jp.json';

const RESOURCES = {
  en: { translation: en },
  mm: { translation: mm },
  jp: { translation: jp },
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // 1. Check AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      
      // 2. Fallback to device locale
      // Expo Localization returns array of locales
      const locales = Localization.getLocales();
      const deviceLanguage = locales[0]?.languageCode;
      
      // Check if device language is supported
      if (deviceLanguage && ['en', 'mm', 'jp'].includes(deviceLanguage)) {
        return callback(deviceLanguage);
      }
      
      // 3. Default to English
      return callback('en');
    } catch (error) {
      console.log('Error reading language', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR as any)
  .use(initReactI18next)
  .init({
    resources: RESOURCES,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React handles XSS
    },
    compatibilityJSON: 'v4', // Updated to v4 for better compatibility
    // Remove hardcoded lng to allow async detection
  });

export default i18n;
