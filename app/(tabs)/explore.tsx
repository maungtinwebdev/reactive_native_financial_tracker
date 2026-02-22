import React, { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { useTransactionStore } from '@/store/transactionStore';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/format';
import { format, isSameDay, isSameYear, startOfYear, endOfYear, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import { generatePDF } from '@/utils/pdfGenerator';
import { Ionicons } from '@expo/vector-icons';

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { setTheme } = useThemeStore();
  const { transactions } = useTransactionStore();
  const [range, setRange] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

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
      if (range === 'monthly') return format(date, 'MMM'); // Group by month name
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

  // Prepare Trend Data (Dynamic based on range)
  const { incomeData, expenseData, maxMonthlyValue } = useMemo(() => {
    // Show all available data for the selected range, but reverse to show oldest to newest
    const recentGroups = [...groupedTransactions].reverse();
    
    const income: any[] = [];
    const expense: any[] = [];
    
    recentGroups.forEach(group => {
      // Label formatting
      let label = group.title;
      // if (range === 'monthly') label = group.title.split(' ')[0].substring(0, 3);
      // if (range === 'daily') label = group.title.split(' ')[1]; // Just the day number if "MMM dd"
      
      income.push({
        value: group.income,
        label: label,
        labelTextStyle: { color: Colors[theme].icon, fontSize: 10 },
        dataPointText: '',
      });
      
      expense.push({
        value: group.expense,
        dataPointText: '',
      });
    });

    // Add empty state if needed for better visualization
    if (range === 'daily' && recentGroups.length === 0) {
      // Show empty hours? Or just empty.
    }

    const maxVal = Math.max(
      ...income.map(d => d.value),
      ...expense.map(d => d.value),
      100
    );
    
    return { incomeData: income, expenseData: expense, maxMonthlyValue: maxVal };
  }, [groupedTransactions, theme, range]);

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
  const totalIncome = incomeData.reduce((acc, curr) => acc + curr.value, 0);
  const totalExpense = expenseData.reduce((acc, curr) => acc + curr.value, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 
    ? (netSavings / totalIncome) * 100 
    : 0;
  const expenseRate = totalIncome > 0
    ? (totalExpense / totalIncome) * 100
    : 0;
  
  const getRangeLabel = () => {
    if (range === 'daily') return 'Today\'s';
    if (range === 'yearly') return 'This Year\'s';
    return 'This Year\'s Monthly';
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: Colors[theme].text }]}>Financial Overview</Text>
              <Text style={[styles.subtitle, { color: Colors[theme].icon }]}>{getRangeLabel()} Performance</Text>
            </View>
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
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={[styles.summaryValue, { color: '#4ade80' }]}>{formatCurrency(totalIncome)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
              <Text style={styles.summaryLabel}>Total Expense</Text>
              <Text style={[styles.summaryValue, { color: '#f87171' }]}>{formatCurrency(totalExpense)}</Text>
            </View>
          </View>

          <View style={[styles.summaryContainer, { marginBottom: 24 }]}>
             <View style={[styles.summaryCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
               <Text style={styles.summaryLabel}>Net Savings Rate</Text>
               <Text style={[styles.summaryValue, { color: savingsRate >= 0 ? '#4ade80' : '#f87171' }]}>
                 {Math.round(savingsRate)
}%
               </Text>
               <Text style={[styles.summarySubtext, { color: Colors[theme].icon }]}>
                 {savingsRate > 20 ? "Good!" : "Low"}
               </Text>
             </View>
             <View style={[styles.summaryCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
               <Text style={styles.summaryLabel}>Expense Rate</Text>
               <Text style={[styles.summaryValue, { color: '#f87171' }]}>
                 {Math.round(expenseRate)}%
               </Text>
               <Text style={[styles.summarySubtext, { color: Colors[theme].icon }]}>
                 of Income
               </Text>
             </View>
          </View>

          {groupedTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: Colors[theme].icon }}>No transactions yet</Text>
            </View>
          ) : (
            <>
              {/* Monthly Trend Chart */}
              <View style={[styles.chartContainer, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
                <Text style={[styles.chartTitle, { color: Colors[theme].text }]}>Income vs Expense</Text>
                <LineChart
                  data={incomeData}
                  data2={expenseData}
                  height={220}
                  showVerticalLines
                  spacing={range === 'daily' ? 60 : 44}
                  initialSpacing={20}
                  color1="#4ade80"
                  color2="#f87171"
                  textColor1="#4ade80"
                  textColor2="#f87171"
                  dataPointsHeight={6}
                  dataPointsWidth={6}
                  dataPointsColor1="#4ade80"
                  dataPointsColor2="#f87171"
                  textShiftY={-2}
                  textFontSize={10}
                  thickness={3}
                  hideRules
                  yAxisColor="transparent"
                  xAxisColor="transparent"
                  yAxisTextStyle={{ color: Colors[theme].icon, fontSize: 10 }}
                  verticalLinesColor={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  xAxisLabelTextStyle={{ color: Colors[theme].icon, fontSize: 10 }}
                  curved
                  isAnimated
                  startFillColor1="#4ade80"
                  endFillColor1="#4ade80"
                  startOpacity1={0.2}
                  endOpacity1={0.0}
                  areaChart // Makes it an area chart with gradient fill
                />
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#4ade80' }]} />
                    <Text style={[styles.legendText, { color: Colors[theme].text }]}>Income</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#f87171' }]} />
                    <Text style={[styles.legendText, { color: Colors[theme].text }]}>Expense</Text>
                  </View>
                </View>
              </View>

              {/* Category Pie Chart */}
              {categoryData.length > 0 && (
                <View style={[styles.chartContainer, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
                  <Text style={[styles.chartTitle, { color: Colors[theme].text }]}>Spending Distribution</Text>
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

              {/* Monthly Reports Export */}
              {range === 'monthly' && (
                <View style={styles.sectionContainer}>
                  <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>Monthly Reports</Text>
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
                        onPress={() => generatePDF(`Monthly Report - ${group.title} ${new Date().getFullYear()}`, group.data, { income: group.income, expense: group.expense, balance: group.balance })}
                      >
                        <Ionicons name="document-text-outline" size={20} color={Colors[theme].text} />
                        <Text style={[styles.exportButtonText, { color: Colors[theme].text }]}>PDF</Text>
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
