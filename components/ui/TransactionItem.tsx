import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Transaction, useTransactionStore } from '@/store/transactionStore';
import { formatCurrency, formatDate } from '@/utils/format';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Home, Zap, Car, Utensils, Trash2 } from 'lucide-react-native';

interface TransactionItemProps {
  transaction: Transaction;
}

const getCategoryIcon = (category: string, color: string) => {
  switch (category.toLowerCase()) {
    case 'shopping': return <ShoppingBag size={24} color={color} />;
    case 'food': return <Coffee size={24} color={color} />;
    case 'housing': return <Home size={24} color={color} />;
    case 'utilities': return <Zap size={24} color={color} />;
    case 'transport': return <Car size={24} color={color} />;
    case 'dining': return <Utensils size={24} color={color} />;
    case 'salary': return <ArrowDownLeft size={24} color={color} />;
    case 'investment': return <ArrowUpRight size={24} color={color} />;
    default: return <ShoppingBag size={24} color={color} />;
  }
};

export function TransactionItem({ transaction }: TransactionItemProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { deleteTransaction } = useTransactionStore();
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? Colors[theme].success : Colors[theme].text;

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <RectButton style={styles.rightAction} onPress={() => deleteTransaction(transaction.id)}>
        <Trash2 size={24} color="#fff" />
      </RectButton>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={[styles.container, { borderBottomColor: Colors[theme].border, backgroundColor: Colors[theme].background }]}>
        <View style={[
          styles.iconContainer, 
          { 
            backgroundColor: isIncome 
              ? (theme === 'dark' ? '#064e3b' : '#dcfce7') 
              : (theme === 'dark' ? '#7f1d1d' : '#fee2e2') 
          }
        ]}>
          {getCategoryIcon(transaction.category, isIncome ? (theme === 'dark' ? '#34d399' : Colors.light.success) : (theme === 'dark' ? '#f87171' : Colors.light.danger))}
        </View>
        
        <View style={styles.details}>
          <Text style={[styles.description, { color: Colors[theme].text }]}>{transaction.description}</Text>
          <Text style={[styles.category, { color: Colors[theme].icon }]}>{transaction.category} • {formatDate(transaction.date)}</Text>
        </View>

        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
      </View>
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
    backgroundColor: '#dd2c00',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});
