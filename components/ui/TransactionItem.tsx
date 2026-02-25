import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Transaction, useTransactionStore } from '@/store/transactionStore';
import { formatDate } from '@/utils/format';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { useRouter } from 'expo-router';
import { Trash2, Pencil } from 'lucide-react-native';
import { getCategoryIcon } from '@/utils/icons';
import { useTranslation } from 'react-i18next';

interface TransactionItemProps {
  transaction: Transaction;
  hideIcon?: boolean;
}

export function TransactionItem({ transaction, hideIcon = false }: TransactionItemProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { deleteTransaction } = useTransactionStore();
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? Colors[theme].success : Colors[theme].text;
  const AnimatedView = Animated.View as any;
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormat();

  const renderRightActions = (progress: any, dragX: any) => {
    return (
      <View style={{ flexDirection: 'row', width: 140 }}>
        <RectButton 
          style={[styles.rightAction, { backgroundColor: '#3b82f6' }]} 
          onPress={() => router.push({
            pathname: '/modal',
            params: { id: transaction.id }
          })}
        >
          <Pencil size={24} color="#fff" />
        </RectButton>
        <RectButton style={[styles.rightAction, { backgroundColor: '#ef4444' }]} onPress={() => deleteTransaction(transaction.id)}>
          <Trash2 size={24} color="#fff" />
        </RectButton>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <RectButton 
        onPress={() => router.push({
          pathname: '/modal',
          params: { id: transaction.id }
        })}
      >
        <View style={[styles.container, { borderBottomColor: Colors[theme].border, backgroundColor: Colors[theme].background }]}>
          {!hideIcon && (
            <AnimatedView 
              sharedTransitionTag={`icon-${transaction.id}`}
              style={[
                styles.iconContainer, 
                { 
                  backgroundColor: isIncome 
                    ? (theme === 'dark' ? '#064e3b' : '#dcfce7') 
                    : (theme === 'dark' ? '#7f1d1d' : '#fee2e2') 
                }
              ]}
            >
              {getCategoryIcon(transaction.category, isIncome ? (theme === 'dark' ? '#34d399' : Colors.light.success) : (theme === 'dark' ? '#f87171' : Colors.light.danger))}
            </AnimatedView>
          )}
          
          <View style={styles.details}>
            <Text style={[styles.description, { color: Colors[theme].text }]}>{transaction.description}</Text>
            <Text style={[styles.category, { color: Colors[theme].icon }]}>{t(`categories.${transaction.category}`)} • {formatDate(transaction.date)}</Text>
          </View>

          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
          </Text>
        </View>
      </RectButton>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
  },
});
