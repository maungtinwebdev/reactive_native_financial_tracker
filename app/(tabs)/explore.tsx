import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useTransactionStore } from '@/store/transactionStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/format';
import { TransactionItem } from '@/components/ui/TransactionItem';

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { transactions, getIncome, getExpense } = useTransactionStore();

  const income = getIncome();
  const expense = getExpense();

  // Prepare Pie Chart Data (Expenses by Category)
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
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
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: Colors[theme].icon }}>No data to display</Text>
            </View>
          ) : (
            <>
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

              {transactions.map((t) => (
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
