import React, { useMemo, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useTransactionStore } from '@/store/transactionStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/format';
import { TransactionItem } from '@/components/ui/TransactionItem';

import { DateNavigator } from '@/components/DateNavigator';

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { transactions, filter, setFilter, getFilteredTransactions, selectedDate, dateRange } = useTransactionStore();

  useEffect(() => {
    if (filter !== 'monthly') {
      setFilter('monthly');
    }
  }, [filter, setFilter]);

  const filteredTransactions = useMemo(() => {
    return getFilteredTransactions();
  }, [transactions, filter, selectedDate, dateRange]);

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

  // Prepare Pie Chart Data (Expenses by Category)
  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
  
  // Prepare Trend Data (Expenses over time)
  const getTrendData = () => {
    const date = new Date(selectedDate);
    if (filter === 'daily') {
      // Hourly breakdown (0-23)
      const hourlyData = new Array(24).fill(0);
      expenseTransactions.forEach(t => {
        const hour = new Date(t.date).getHours();
        hourlyData[hour] += t.amount;
      });
      
      return hourlyData.map((amount, hour) => ({
        value: amount,
        label: hour % 6 === 0 ? `${hour}:00` : '',
        labelTextStyle: { color: Colors[theme].icon, fontSize: 10 },
        frontColor: Colors[theme].tint,
      }));
    }
    
    if (filter === 'monthly') {
      // Daily breakdown (1-31)
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const dailyData = new Array(daysInMonth).fill(0);
      
      expenseTransactions.forEach(t => {
        const day = new Date(t.date).getDate() - 1; // 0-indexed
        if (day >= 0 && day < daysInMonth) {
          dailyData[day] += t.amount;
        }
      });
      
      return dailyData.map((amount, index) => ({
        value: amount,
        label: (index + 1) % 5 === 0 || index === 0 ? `${index + 1}` : '',
        labelTextStyle: { color: Colors[theme].icon, fontSize: 10 },
        frontColor: Colors[theme].tint,
      }));
    }
    
    if (filter === 'yearly') {
      // Monthly breakdown (0-11)
      const monthlyData = new Array(12).fill(0);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      expenseTransactions.forEach(t => {
        const month = new Date(t.date).getMonth();
        monthlyData[month] += t.amount;
      });
      
      return monthlyData.map((amount, index) => ({
        value: amount,
        label: months[index],
        labelTextStyle: { color: Colors[theme].icon, fontSize: 10 },
        frontColor: Colors[theme].tint,
      }));
    }

    if (filter === 'custom' || filter === 'all') {
      let start: Date, end: Date;

      if (filter === 'custom') {
        start = new Date(dateRange.start);
        end = new Date(dateRange.end);
      } else {
        if (expenseTransactions.length === 0) return [];
        const timestamps = expenseTransactions.map(t => new Date(t.date).getTime());
        start = new Date(Math.min(...timestamps));
        end = new Date(Math.max(...timestamps));
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If range is short (<= 60 days), show daily breakdown
      if (diffDays <= 60) {
        const dailyMap = new Map<string, number>();
        
        // Initialize all days in range
        for (let i = 0; i <= diffDays; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().split('T')[0];
            dailyMap.set(key, 0);
        }

        expenseTransactions.forEach(t => {
            const key = t.date.split('T')[0];
            if (dailyMap.has(key)) {
                dailyMap.set(key, (dailyMap.get(key) || 0) + t.amount);
            }
        });

        return Array.from(dailyMap.entries()).map(([dateStr, amount], index) => {
            const d = new Date(dateStr);
            return {
                value: amount,
                label: (index === 0 || index === diffDays || index % Math.ceil(diffDays / 5) === 0) ? `${d.getDate()}` : '',
                labelTextStyle: { color: Colors[theme].icon, fontSize: 10 },
                frontColor: Colors[theme].tint,
            };
        });
      } else {
        // Monthly breakdown for longer ranges
        const monthlyMap = new Map<string, number>();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        expenseTransactions.forEach(t => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthlyMap.set(key, (monthlyMap.get(key) || 0) + t.amount);
        });

        const sortedKeys = Array.from(monthlyMap.keys()).sort();

        return sortedKeys.map((key) => {
            const [year, month] = key.split('-').map(Number);
            return {
                value: monthlyMap.get(key) || 0,
                label: `${months[month]}`,
                labelTextStyle: { color: Colors[theme].icon, fontSize: 10 },
                frontColor: Colors[theme].tint,
            };
        });
      }
    }
    
    return [];
  };

  const trendData = getTrendData();
  const maxTrendValue = Math.max(...trendData.map(d => d.value), 100); // Default to 100 if no data to avoid scaling issues

  const expensesByCategory = expenseTransactions.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map((category, index) => {
    const colors = ['#f87171', '#fb923c', '#facc15', '#a3e635', '#4ade80', '#22d3ee', '#818cf8', '#c084fc', '#e879f9'];
    return {
      value: expensesByCategory[category],
      color: colors[index % colors.length],
      text: category,
      shiftTextX: 10,
      shiftTextY: 10,
    };
  });

  // Prepare Bar Chart Data (Income vs Expense)
  const barData = [
    { value: income, label: 'Income', frontColor: '#4ade80' },
    { value: expense, label: 'Expense', frontColor: '#f87171' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[theme].text }]}>Analytics</Text>
            
            <DateNavigator />
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: Colors[theme].icon }}>No data to display</Text>
            </View>
          ) : (
            <>
              <View style={[styles.chartContainer, { backgroundColor: theme === 'dark' ? '#1f2937' : '#fff' }]}>
                <Text style={[styles.chartTitle, { color: Colors[theme].text }]}>
                  {filter === 'daily' ? 'Hourly Spending' : filter === 'monthly' ? 'Daily Spending' : 'Monthly Spending'}
                </Text>
                <BarChart
                  data={trendData}
                  barWidth={filter === 'daily' ? 8 : filter === 'monthly' ? 6 : 16}
                  spacing={filter === 'daily' ? 4 : filter === 'monthly' ? 4 : 8}
                  noOfSections={4}
                  barBorderRadius={2}
                  frontColor={Colors[theme].tint}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  yAxisTextStyle={{ color: Colors[theme].icon }}
                  xAxisLabelTextStyle={{ color: Colors[theme].text }}
                  width={300}
                  height={150}
                  maxValue={maxTrendValue * 1.2}
                  hideRules
                  isAnimated
                />
              </View>

              <View style={[styles.chartContainer, { backgroundColor: theme === 'dark' ? '#1f2937' : '#fff' }]}>
                <Text style={[styles.chartTitle, { color: Colors[theme].text }]}>Income vs Expense</Text>
                <BarChart
                  data={barData}
                  barWidth={50}
                  noOfSections={4}
                  barBorderRadius={4}
                  frontColor={Colors[theme].tint}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  yAxisTextStyle={{ color: Colors[theme].icon }}
                  xAxisLabelTextStyle={{ color: Colors[theme].text }}
                  width={300}
                  height={200}
                  isAnimated
                />
              </View>

              {expenseTransactions.length > 0 && (
                <View style={[styles.chartContainer, { backgroundColor: theme === 'dark' ? '#1f2937' : '#fff' }]}>
                  <Text style={[styles.chartTitle, { color: Colors[theme].text }]}>Expenses by Category</Text>
                  <View style={{ alignItems: 'center' }}>
                    <PieChart
                      data={pieData}
                      donut
                      showText
                      textColor={Colors[theme].text}
                      radius={120}
                      innerRadius={60}
                      textSize={12}
                      focusOnPress
                      showValuesAsLabels
                      showTextBackground
                      textBackgroundRadius={20}
                    />
                  </View>
                  <View style={styles.legendContainer}>
                    {Object.keys(expensesByCategory).map((category, index) => {
                       const colors = ['#f87171', '#fb923c', '#facc15', '#a3e635', '#4ade80', '#22d3ee', '#818cf8', '#c084fc', '#e879f9'];
                       const color = colors[index % colors.length];
                       return (
                        <View key={index} style={styles.legendItem}>
                          <View style={[styles.legendColor, { backgroundColor: color }]} />
                          <Text style={[styles.legendText, { color: Colors[theme].text }]}>
                            {category} ({formatCurrency(expensesByCategory[category])})
                          </Text>
                        </View>
                       );
                    })}
                  </View>
                </View>
              )}

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>All Transactions</Text>
              </View>

              {filteredTransactions.map((t) => (
                <TransactionItem key={t.id} transaction={t} />
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
  filterContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  legendContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});
