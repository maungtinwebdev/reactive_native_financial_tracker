import React, { useMemo, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Platform, LayoutAnimation, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactionStore } from '@/store/transactionStore';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/format';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DateNavigator } from '@/components/DateNavigator';
import { format } from 'date-fns';
import { SyncButton } from '@/components/SyncButton';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { transactions, filter, setFilter, getFilteredTransactions, dateRange, selectedDate } = useTransactionStore();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [transactions, filter, selectedDate, dateRange]);

  useEffect(() => {
    if (filter !== 'monthly') {
      setFilter('monthly');
    }
  }, [filter, setFilter]);

  const filteredTransactions = useMemo(() => {
    return getFilteredTransactions();
  }, [transactions, filter, selectedDate, dateRange]);

  const balance = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }, [filteredTransactions]);

  const income = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredTransactions]);

  const expense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredTransactions]);

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={[styles.greeting, { color: Colors[theme].text }]}>Financial Overview</Text>
              <SyncButton />
            </View>

            <DateNavigator />
          </View>

          <LinearGradient
            colors={theme === 'dark' ? ['#1e3a8a', '#1e40af', '#172554'] : ['#4c669f', '#3b5998', '#192f6a']}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={styles.incomeAmount}>+{formatCurrency(income)}</Text>
              </View>
              <View style={[styles.summaryItem, styles.summaryBorder]}>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={styles.expenseAmount}>-{formatCurrency(expense)}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={{ color: Colors[theme].tint }}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: Colors[theme].icon }}>No transactions yet</Text>
            </View>
          ) : (
            recentTransactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: Colors[theme].tint,
            shadowColor: Colors[theme].text,
          }
        ]}
        onPress={() => router.push('/modal')}
        activeOpacity={0.8}
      >
        <Plus color={theme === 'dark' ? Colors.light.tint : '#fff'} size={32} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Added padding for FAB
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  incomeAmount: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '600',
  },
  expenseAmount: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
  },
  // New styles for grouped list
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    opacity: 0.8,
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
