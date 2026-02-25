import { useLocale } from './useLocale';

export const useCurrencyFormat = () => {
  const { formatCurrency, getLocaleInfo } = useLocale();
  
  const formatAmount = formatCurrency;
  const getCurrentCurrency = () => getLocaleInfo().currency;
  const getCurrentCurrencySymbol = () => getLocaleInfo().currencySymbol;
  const currentLanguage = getLocaleInfo().language;

  return { 
    formatAmount, 
    currentLanguage, 
    getCurrentCurrency, 
    getCurrentCurrencySymbol 
  };
};
