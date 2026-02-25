import React, { createContext, useContext, ReactNode } from 'react';
import { useLocale } from '@/hooks/useLocale';

interface LocaleContextType {
  currentLanguage: string;
  currentCurrency: {
    code: string;
    symbol: string;
    locale: string;
    decimalPlaces: number;
  };
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  formatNumber: (number: number, decimals?: number) => string;
  getLocaleInfo: () => {
    language: string;
    currency: string;
    currencySymbol: string;
    locale: string;
    decimalPlaces: number;
    isRTL: boolean;
  };
  isLanguageActive: (lang: string) => boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const locale = useLocale();

  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocaleContext = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocaleContext must be used within a LocaleProvider');
  }
  return context;
};