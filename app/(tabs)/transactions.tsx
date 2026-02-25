import React, { useMemo, useEffect } from 'react';
import { StyleSheet, SectionList, View, Text, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore, Transaction } from '@/store/transactionStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { GroupedTransactionItem, TransactionGroup } from '@/components/ui/GroupedTransactionItem';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type ListItem = Transaction | TransactionGroup;

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { transactions } = useTransactionStore();
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormat();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [transactions]);

  // Use ALL transactions for the history list
  const groupedTransactions = useMemo(() => {
    // 1. Sort all transactions by date desc
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 2. Group by Month Year
    const groups = new Map<string, Transaction[]>();
    
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
      // Sub-group by Date + Type
      const subGroups = new Map<string, Transaction[]>();
      
      items.forEach(t => {
        const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
        // Group transactions by Date and Type (Income vs Expense)
        const subKey = `${dateKey}_${t.type}`;
        
        if (!subGroups.has(subKey)) {
          subGroups.set(subKey, []);
        }
        subGroups.get(subKey)!.push(t);
      });

      const processedItems: ListItem[] = [];

      Array.from(subGroups.values()).forEach(groupItems => {
        if (groupItems.length === 1) {
          processedItems.push(groupItems[0]);
        } else {
          const first = groupItems[0];
          const totalAmount = groupItems.reduce((sum, t) => sum + t.amount, 0);
          processedItems.push({
            id: `group-${first.id}`, // Use first ID as base for key
            date: first.date,
            type: first.type,
            transactions: groupItems,
            totalAmount
          });
        }
      });

      // Sort processed items by date desc
      processedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate totals for this group (which is a whole month)
      const groupIncome = items
        .filter(t => (t.type || '').toLowerCase() === 'income')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        
      const groupExpense = items
        .filter(t => (t.type || '').toLowerCase() === 'expense')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        
      return {
        title: key,
        data: processedItems,
        income: groupIncome,
        expense: groupExpense,
        balance: groupIncome - groupExpense
      };
    });
  }, [transactions]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if ('transactions' in item) {
      return <GroupedTransactionItem group={item} />;
    }
    return <TransactionItem transaction={item} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <SectionList
          sections={groupedTransactions}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={[styles.title, { color: Colors[theme].text }]}>{t('transactions.title')}</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ color: Colors[theme].icon }}>{t('dashboard.noTransactions')}</Text>
            </View>
          }
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[styles.groupTitle, { color: Colors[theme].text }]}>{title}</Text>
          )}
          renderSectionFooter={({ section }) => (
            <View style={[styles.groupFooter, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6', marginBottom: 24 }]}>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>{t('transactions.income')}</Text>
                <Text style={styles.incomeAmountSmall}>{formatAmount(section.income)}</Text>
              </View>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>{t('transactions.expense')}</Text>
                <Text style={styles.expenseAmountSmall}>{formatAmount(-section.expense)}</Text>
              </View>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>Balance</Text>
                <Text style={[styles.balanceTextSmall, { color: Colors[theme].text }]}>{formatAmount(section.balance)}</Text>
              </View>
            </View>
          )}
        />
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
