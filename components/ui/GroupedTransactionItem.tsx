import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Transaction } from '@/store/transactionStore';
import { TransactionItem } from './TransactionItem';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate } from '@/utils/format';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { getCategoryIcon } from '@/utils/icons';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export interface TransactionGroup {
  id: string;
  date: string;
  type: 'income' | 'expense';
  transactions: Transaction[];
  totalAmount: number;
}

interface GroupedTransactionItemProps {
  group: TransactionGroup;
}

export function GroupedTransactionItem({ group }: GroupedTransactionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormat();
  
  const isIncome = group.type === 'income';
  const amountColor = isIncome ? Colors[theme].success : Colors[theme].text;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, { borderBottomColor: Colors[theme].border, backgroundColor: Colors[theme].background }]}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={[
          styles.iconContainer, 
          { 
            backgroundColor: isIncome 
              ? (theme === 'dark' ? '#064e3b' : '#dcfce7') 
              : (theme === 'dark' ? '#7f1d1d' : '#fee2e2') 
          }
        ]}>
          {isIncome 
            ? <ArrowDown size={24} color={theme === 'dark' ? '#34d399' : Colors.light.success} />
            : <ArrowUp size={24} color={theme === 'dark' ? '#f87171' : Colors.light.danger} />
          }
          <View style={[styles.badge, { backgroundColor: Colors[theme].tint, borderColor: Colors[theme].background }]}>
            <Text style={[styles.badgeText, { color: theme === 'dark' ? '#000' : '#fff' }]}>{group.transactions.length}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={[styles.description, { color: Colors[theme].text }]}>
            {isIncome ? t('transactions.totalIncome') : t('transactions.totalExpense')}
          </Text>
          <Text style={[styles.date, { color: Colors[theme].icon }]}>{formatDate(group.date)}</Text>
        </View>

        <View style={styles.rightContent}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}{formatAmount(group.totalAmount)}
          </Text>
          {expanded ? (
            <ChevronUp size={20} color={Colors[theme].icon} />
          ) : (
            <ChevronDown size={20} color={Colors[theme].icon} />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.childrenContainer}>
          {group.transactions.map((t, index) => (
            <View key={t.id} style={[
              styles.childWrapper, 
              index === group.transactions.length - 1 && styles.lastChild
            ]}>
              <TransactionItem transaction={t} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  childrenContainer: {
    paddingLeft: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  childWrapper: {
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  lastChild: {
    borderBottomWidth: 0,
  }
});
