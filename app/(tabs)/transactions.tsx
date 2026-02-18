import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '@/store/transactionStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/format';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { format } from 'date-fns';

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { transactions } = useTransactionStore();

  // Use ALL transactions for the history list
  const groupedTransactions = useMemo(() => {
    // 1. Sort all transactions by date desc
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 2. Group by Month Year
    const groups = new Map<string, typeof transactions>();
    
    sorted.forEach(t => {
      const date = new Date(t.date);
      const key = format(date, 'MMMM yyyy');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(t);
    });
    
    // 3. Transform to array with summaries
    return Array.from(groups.entries()).map(([key, items]) => {
      // Calculate totals for this group (which is a whole month)
      const groupIncome = items
        .filter(t => (t.type || '').toLowerCase() === 'income')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        
      const groupExpense = items
        .filter(t => (t.type || '').toLowerCase() === 'expense')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        
      return {
        title: key,
        data: items,
        income: groupIncome,
        expense: groupExpense,
        balance: groupIncome - groupExpense
      };
    });
  }, [transactions]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[theme].text }]}>All Transactions</Text>
          </View>

          {groupedTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: Colors[theme].icon }}>No transactions yet</Text>
            </View>
          ) : (
            <>
              {groupedTransactions.map((group) => (
                <View key={group.title} style={styles.groupContainer}>
                  <Text style={[styles.groupTitle, { color: Colors[theme].text }]}>{group.title}</Text>
                  
                  {group.data.map((t) => (
                    <TransactionItem key={t.id} transaction={t} />
                  ))}
                  
                  <View style={[styles.groupFooter, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}>
                    <View style={styles.footerItem}>
                      <Text style={styles.footerLabel}>Income</Text>
                      <Text style={styles.incomeAmountSmall}>{formatCurrency(group.income)}</Text>
                    </View>
                    <View style={styles.footerItem}>
                      <Text style={styles.footerLabel}>Expense</Text>
                      <Text style={styles.expenseAmountSmall}>{formatCurrency(group.expense)}</Text>
                    </View>
                    <View style={styles.footerItem}>
                      <Text style={styles.footerLabel}>Balance</Text>
                      <Text style={[styles.balanceTextSmall, { color: Colors[theme].text }]}>{formatCurrency(group.balance)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  footerItem: {
    alignItems: 'center',
    flex: 1,
  },
  footerLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  incomeAmountSmall: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
  },
  expenseAmountSmall: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceTextSmall: {
    fontSize: 12,
    fontWeight: '600',
  },
});
