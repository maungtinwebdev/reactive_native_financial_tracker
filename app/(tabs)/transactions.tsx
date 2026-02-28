import React, { useMemo, useEffect, useState } from 'react';
import { StyleSheet, SectionList, View, Text, LayoutAnimation, Platform, UIManager, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore, Transaction } from '@/store/transactionStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { GroupedTransactionItem, TransactionGroup } from '@/components/ui/GroupedTransactionItem';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

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

  // Date Filtering State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [transactions, startDate, endDate]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }

    if (selectedDate) {
      if (showPicker === 'start') {
        setStartDate(selectedDate);
        // If end date is before new start date, update it
        if (endDate && selectedDate > endDate) {
          setEndDate(null);
        }
      } else if (showPicker === 'end') {
        setEndDate(selectedDate);
        // If start date is after new end date, update it
        if (startDate && selectedDate < startDate) {
          setStartDate(null);
        }
      }
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Use ALL or filtered transactions for the history list
  const groupedTransactions = useMemo(() => {
    // 1. Filter by date if range is set
    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      if (startDate && transactionDate < startOfDay(startDate)) return false;
      if (endDate && transactionDate > endOfDay(endDate)) return false;
      return true;
    });

    // 2. Sort all transactions by date desc
    const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 3. Group by Month Year
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
  }, [transactions, startDate, endDate]);

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

              <View style={styles.filterBar}>
                <View style={styles.dateInputs}>
                  <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }]}
                    onPress={() => setShowPicker('start')}
                  >
                    <Ionicons name="calendar-outline" size={14} color={startDate ? Colors[theme].tint : Colors[theme].icon} />
                    <Text style={[styles.dateText, { color: startDate ? Colors[theme].text : Colors[theme].icon }]}>
                      {startDate ? format(startDate, 'MMM dd') : t('transactions.startDate')}
                    </Text>
                  </TouchableOpacity>

                  <Ionicons name="arrow-forward" size={14} color={Colors[theme].icon} />

                  <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }]}
                    onPress={() => setShowPicker('end')}
                  >
                    <Ionicons name="calendar-outline" size={14} color={endDate ? Colors[theme].tint : Colors[theme].icon} />
                    <Text style={[styles.dateText, { color: endDate ? Colors[theme].text : Colors[theme].icon }]}>
                      {endDate ? format(endDate, 'MMM dd') : t('transactions.endDate')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {(startDate || endDate) && (
                  <TouchableOpacity
                    style={[styles.clearButton, { backgroundColor: theme === 'dark' ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)' }]}
                    onPress={clearFilters}
                  >
                    <Ionicons name="refresh" size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              {showPicker && (
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  {Platform.OS === 'ios' && (
                    <View style={styles.pickerHeader}>
                      <TouchableOpacity onPress={() => setShowPicker(null)}>
                        <Text style={{ color: Colors[theme].tint, fontWeight: '600' }}>{t('common.done')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <DateTimePicker
                    value={showPicker === 'start' ? (startDate || new Date()) : (endDate || new Date())}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={showPicker === 'start' && endDate ? endDate : new Date()}
                    minimumDate={showPicker === 'end' && startDate ? startDate : undefined}
                  />
                </View>
              )}
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 8,
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
