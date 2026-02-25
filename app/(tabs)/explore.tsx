import React, { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';
import { useTransactionStore } from '@/store/transactionStore';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/format';
import { format, isSameDay, isSameYear, isSameMonth, startOfYear, endOfYear, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import { generateExcel } from '@/utils/excelGenerator';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { setTheme } = useThemeStore();
  const { transactions } = useTransactionStore();
  const [range, setRange] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const { t } = useTranslation();

  // Filter Logic Based on Range
  const groupedTransactions = useMemo(() => {
    const now = new Date();
    
    // Filter transactions based on range
    const filtered = transactions.filter(t => {
      const date = new Date(t.date);
      if (range === 'daily') {
        return isSameDay(date, now);
      }
      if (range === 'monthly') {
        return isSameYear(date, now);
      }
      if (range === 'yearly') {
        // "Yearly mean current year" - User requested current year for yearly too.
        // But usually yearly means comparison of years. 
        // If we strictly follow "current year", it's just one data point (2025).
        // Let's assume they want to see the yearly summary OF the current year.
        return isSameYear(date, now);
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Grouping key format based on range
    const getGroupKey = (date: Date) => {
      if (range === 'daily') return format(date, 'h a'); // Group by hour for daily view
      if (range === 'monthly') return format(date, 'MMMM'); // Group by month name
      if (range === 'yearly') return format(date, 'yyyy');
      return format(date, 'MMMM yyyy');
    };

    const groups = new Map<string, typeof transactions>();
    
    // Initialize groups to ensure continuous axis (optional, but good for charts)
    // For now, let's just group existing data to match previous logic style
    
    sorted.forEach(t => {
      const date = new Date(t.date);
      const key = getGroupKey(date);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(t);
    });
    
    return Array.from(groups.entries()).map(([key, items]) => {
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
  }, [transactions, range]);

  // Prepare Category Data (All Time for selected range view)
  const { categoryData, totalExpense: pieTotalExpense } = useMemo(() => {
    // Use all groups for the pie chart too
    const expenses = groupedTransactions.flatMap(group => 
      group.data.filter(t => (t.type || '').toLowerCase() === 'expense')
    );

    const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const byCategory = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + (Number(curr.amount) || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const colors = ['#f87171', '#fb923c', '#facc15', '#a3e635', '#4ade80', '#22d3ee', '#818cf8', '#c084fc', '#e879f9'];
    
    const data = Object.keys(byCategory).map((cat, index) => ({
      value: byCategory[cat],
      color: colors[index % colors.length],
      text: cat,
      // Simplify visuals for cleaner look
    })).sort((a, b) => b.value - a.value); // Sort by biggest expense

    return { categoryData: data, totalExpense: total };
  }, [groupedTransactions, range]);

  // Calculate Insights
  const totalIncome = groupedTransactions.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = groupedTransactions.reduce((acc, curr) => acc + curr.expense, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 
    ? (netSavings / totalIncome) * 100 
    : 0;
  const expenseRate = totalIncome > 0
    ? (totalExpense / totalIncome) * 100
    : 0;
  
  const getRangeLabel = () => {
    if (range === 'daily') return t('analytics.daily');
    if (range === 'yearly') return t('analytics.yearly');
    return t('analytics.monthly');
  };

  const handleExportExcel = async () => {
    const allTransactions = groupedTransactions.flatMap(g => g.data);
    const title = `${getRangeLabel()} ${t('analytics.title')} - ${new Date().getFullYear()}`;
    
    await generateExcel(
      title,
      allTransactions,
      {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: Colors[theme].text }]}>{t('analytics.title')}</Text>
              <Text style={[styles.subtitle, { color: Colors[theme].icon }]}>{t('analytics.performance', { range: getRangeLabel() })}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.exportButton, { backgroundColor: theme === 'dark' ? '#333' : '#f3f4f6' }]}
              onPress={handleExportExcel}
            >
              <Ionicons name="document-text-outline" size={20} color={Colors[theme].text} />
              <Text style={[styles.exportButtonText, { color: Colors[theme].text }]}>{t('analytics.excel')}</Text>
            </TouchableOpacity>
          </View>

          {/* Range Filter */}
          <View style={styles.filterContainer}>
            {(['daily', 'monthly', 'yearly'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.filterButton,
                  range === r && { backgroundColor: theme === 'dark' ? '#fff' : '#000' }
                ]}
                onPress={() => setRange(r)}
              >
                <Text style={[
                  styles.filterText,
                  { color: range === r ? (theme === 'dark' ? '#000' : '#fff') : Colors[theme].icon }
                ]}>
                  {t(`analytics.${r}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
              <Text style={styles.summaryLabel}>{t('analytics.totalIncome')}</Text>
              <Text style={[styles.summaryValue, { color: '#4ade80' }]}>{formatCurrency(totalIncome)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
              <Text style={styles.summaryLabel}>{t('analytics.totalExpense')}</Text>
              <Text style={[styles.summaryValue, { color: '#f87171' }]}>{formatCurrency(totalExpense)}</Text>
            </View>
          </View>

          <View style={[styles.summaryContainer, { marginBottom: 24 }]}>
             <View style={[styles.summaryCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
               <Text style={styles.summaryLabel}>{t('analytics.netSavingsRate')}</Text>
               <Text style={[styles.summaryValue, { color: savingsRate >= 0 ? '#4ade80' : '#f87171' }]}>
                 {Math.round(savingsRate)}%
               </Text>
               <Text style={[styles.summarySubtext, { color: Colors[theme].icon }]}>
                 {savingsRate > 20 ? t('analytics.good') : t('analytics.low')}
               </Text>
             </View>
             <View style={[styles.summaryCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
               <Text style={styles.summaryLabel}>{t('analytics.expenseRate')}</Text>
               <Text style={[styles.summaryValue, { color: '#f87171' }]}>
                 {Math.round(expenseRate)}%
               </Text>
               <Text style={[styles.summarySubtext, { color: Colors[theme].icon }]}>
                 {t('analytics.ofIncome')}
               </Text>
             </View>
          </View>

          {groupedTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: Colors[theme].icon }}>{t('dashboard.noTransactions')}</Text>
            </View>
          ) : (
            <>
              {/* Category Pie Chart */}
              {categoryData.length > 0 && (
                <View style={[styles.chartContainer, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
                  <Text style={[styles.chartTitle, { color: Colors[theme].text }]}>{t('analytics.spendingDistribution')}</Text>
                  <View style={{ alignItems: 'center' }}>
                    <PieChart
                      data={categoryData}
                      donut
                      radius={140}
                      focusOnPress
                      showValuesAsLabels={false}
                      showTextBackground={false} // Clean look
                      innerRadius={80} // Larger hole for cleaner donut
                      centerLabelComponent={() => {
                        return (
                          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: Colors[theme].icon }}>Total</Text>
                            <Text style={{ fontSize: 18, color: Colors[theme].text, fontWeight: 'bold' }}>
                              {formatCurrency(pieTotalExpense)}
                            </Text>
                          </View>
                        );
                      }}
                    />
                  </View>
                  <View style={styles.legendContainer}>
                    {categoryData.map((item, index) => (
                      <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={[styles.legendText, { color: Colors[theme].text }]}>
                           {item.text} ({((item.value / pieTotalExpense) * 100).toFixed(0)}%)
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Monthly Reports */}
              {range === 'monthly' && (
                <View style={styles.sectionContainer}>
                  <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>{t('analytics.monthlyReports')}</Text>
                  {groupedTransactions.map((group, index) => (
                    <View key={index} style={[styles.reportCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
                      <View style={styles.reportInfo}>
                        <Text style={[styles.reportMonth, { color: Colors[theme].text }]}>{group.title}</Text>
                        <Text style={[styles.reportSummary, { color: Colors[theme].icon }]}>
                          In: <Text style={{ color: '#4ade80' }}>{formatCurrency(group.income)}</Text> • Out: <Text style={{ color: '#f87171' }}>{formatCurrency(group.expense)}</Text>
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.exportButton, { backgroundColor: theme === 'dark' ? '#333' : '#f3f4f6' }]}
                        onPress={() => generateExcel(`Monthly Report - ${group.title} ${new Date().getFullYear()}`, group.data, { income: group.income, expense: group.expense, balance: group.balance })}
                      >
                        <Ionicons name="document-text-outline" size={20} color={Colors[theme].text} />
                        <Text style={[styles.exportButtonText, { color: Colors[theme].text }]}>{t('analytics.excel')}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
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
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    padding: 2,
    borderRadius: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summarySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  legendContainer: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportInfo: {
    flex: 1,
  },
  reportMonth: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportSummary: {
    fontSize: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
});
