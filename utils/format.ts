import { format } from 'date-fns';
import i18n from '@/i18n';

export const formatCurrency = (amount: number) => {
  const language = i18n.language || 'en';
  
  // Handle Myanmar Kyat
  if (language === 'mm') {
    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} Ks`;
  } 
  // Handle Japanese Yen
  else if (language === 'jp') {
    return `¥${amount.toLocaleString('ja-JP', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }
  
  // Default to USD for English and others
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};
