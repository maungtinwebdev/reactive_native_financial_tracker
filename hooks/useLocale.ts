import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { formatCurrencyByLocale, getCurrencyConfig } from '@/utils/currencyConfig';
import { format } from 'date-fns';

export const useLocale = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [currentCurrency, setCurrentCurrency] = useState(() => getCurrencyConfig(currentLanguage));

  // Listen to language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      setCurrentCurrency(getCurrencyConfig(lng));
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Format currency based on current locale
  const formatCurrency = useCallback((amount: number) => {
    return formatCurrencyByLocale(amount, currentLanguage);
  }, [currentLanguage]);

  // Format date based on current locale
  const formatDate = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    try {
      // Use locale-specific date formatting
      const localeMap: Record<string, string> = {
        en: 'en-US',
        mm: 'my-MM',
        jp: 'ja-JP'
      };
      
      const locale = localeMap[currentLanguage] || 'en-US';
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      // Fallback to date-fns
      return format(dateObj, 'MMM dd, yyyy');
    }
  }, [currentLanguage]);

  // Format number based on current locale (using en-US for English numerals)
  const formatNumber = useCallback((number: number, decimals: number = 0) => {
    try {
      // Always use en-US to ensure English numerals
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(number);
    } catch (error) {
      return number.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
  }, [currentLanguage]);

  // Get locale-specific formatting info
  const getLocaleInfo = useCallback(() => {
    return {
      language: currentLanguage,
      currency: currentCurrency.code,
      currencySymbol: currentCurrency.symbol,
      locale: currentCurrency.locale,
      decimalPlaces: currentCurrency.decimalPlaces,
      isRTL: false // Add RTL support if needed
    };
  }, [currentLanguage, currentCurrency]);

  // Check if a language is active
  const isLanguageActive = useCallback((lang: string) => {
    return currentLanguage === lang;
  }, [currentLanguage]);

  return {
    currentLanguage,
    currentCurrency,
    formatCurrency,
    formatDate,
    formatNumber,
    getLocaleInfo,
    isLanguageActive
  };
};