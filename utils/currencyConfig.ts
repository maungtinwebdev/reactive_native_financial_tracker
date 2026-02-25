export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
  position: 'before' | 'after';
  negativeFormat: 'minus' | 'parentheses' | 'symbol';
}

export const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  en: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    decimalPlaces: 2,
    position: 'before',
    negativeFormat: 'minus'
  },
  mm: {
    code: 'MMK',
    symbol: 'Ks',
    locale: 'my-MM',
    decimalPlaces: 0,
    position: 'after',
    negativeFormat: 'minus'
  },
  jp: {
    code: 'JPY',
    symbol: '¥',
    locale: 'ja-JP',
    decimalPlaces: 0,
    position: 'before',
    negativeFormat: 'minus'
  }
};

export const getCurrencyConfig = (language: string): CurrencyConfig => {
  return CURRENCY_MAP[language] || CURRENCY_MAP.en;
};

export const formatCurrencyByLocale = (amount: number, language: string): string => {
  const config = getCurrencyConfig(language);
  
  try {
    // Use en-US for number formatting to ensure English numerals
    const numberFormatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    });

    const absAmount = Math.abs(amount);
    const numberPart = numberFormatter.format(absAmount);
    const negativePrefix = amount < 0 ? '-' : '';
    
    // Build currency string based on position and symbol
    let formatted: string;
    if (config.position === 'before') {
      formatted = `${config.symbol}${numberPart}`;
    } else {
      formatted = `${numberPart} ${config.symbol}`;
    }
    
    // Handle negative amounts
    if (amount < 0) {
      switch (config.negativeFormat) {
        case 'minus':
          formatted = `-${formatted}`;
          break;
        case 'parentheses':
          formatted = `(${formatted})`;
          break;
        case 'symbol':
          // Symbol already included
          break;
      }
    }
    
    return formatted;
  } catch (error) {
    // Fallback to basic formatting
    const absAmount = Math.abs(amount);
    const negativePrefix = amount < 0 ? '-' : '';
    
    if (config.position === 'before') {
      return `${negativePrefix}${config.symbol}${absAmount.toFixed(config.decimalPlaces)}`;
    } else {
      return `${negativePrefix}${absAmount.toFixed(config.decimalPlaces)} ${config.symbol}`;
    }
  }
};