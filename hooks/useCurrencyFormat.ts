import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { formatCurrency } from '@/utils/format';

export const useCurrencyFormat = () => {
  const { i18n } = useTranslation();

  const formatAmount = useCallback((amount: number) => {
    return formatCurrency(amount);
  }, [i18n.language]);

  return { formatAmount };
};
