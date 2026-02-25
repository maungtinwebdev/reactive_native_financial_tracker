import { format } from 'date-fns';
import i18n from '@/i18n';
import { formatCurrencyByLocale } from './currencyConfig';

export const formatCurrency = (amount: number, language?: string) => {
  const lang = language || i18n.language || 'en';
  return formatCurrencyByLocale(amount, lang);
};

export const formatDate = (dateString: string, language?: string) => {
  const lang = language || i18n.language || 'en';
  const date = new Date(dateString);
  
  try {
    // Use en-US for date formatting to ensure English numerals
    // but use the language for locale-specific formatting
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    // Use en-US locale to ensure English numerals
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    // Fallback to date-fns with English format
    return format(date, 'MMM dd, yyyy');
  }
};
