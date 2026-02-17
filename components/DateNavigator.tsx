import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactionStore } from '@/store/transactionStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';

export function DateNavigator() {
  const { filter, selectedDate, setSelectedDate, dateRange, setDateRange } = useTransactionStore();
  const date = new Date(selectedDate);
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  const toggleStartPicker = () => {
    if (showStartPicker) {
      setShowStartPicker(false);
    } else {
      setShowEndPicker(false);
      setShowStartPicker(true);
    }
  };

  const toggleEndPicker = () => {
    if (showEndPicker) {
      setShowEndPicker(false);
    } else {
      setShowStartPicker(false);
      setShowEndPicker(true);
    }
  };

  const onStartChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    
    if (selectedDate) {
      if (selectedDate > endDate) {
        setDateRange({ start: selectedDate, end: selectedDate });
      } else {
        setDateRange({ start: selectedDate, end: endDate });
      }
    }
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }

    if (selectedDate) {
      if (selectedDate < startDate) {
        setDateRange({ start: selectedDate, end: selectedDate });
      } else {
        setDateRange({ start: startDate, end: selectedDate });
      }
    }
  };

  const navigate = (direction: -1 | 1) => {
    if (filter === 'custom') return;
    
    const newDate = new Date(date);
    if (filter === 'daily') {
      newDate.setDate(date.getDate() + direction);
    } else if (filter === 'monthly') {
      newDate.setMonth(date.getMonth() + direction);
    } else if (filter === 'yearly') {
      newDate.setFullYear(date.getFullYear() + direction);
    }
    setSelectedDate(newDate);
  };

  const formatDate = () => {
    try {
      if (filter === 'daily') return format(date, 'MMM d, yyyy');
      if (filter === 'monthly') return format(date, 'MMMM yyyy');
      if (filter === 'yearly') return format(date, 'yyyy');
    } catch (e) {
      return date.toLocaleDateString();
    }
    return '';
  };

  if (filter !== 'custom') {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleStartPicker} style={[styles.dateContainer, { backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6', minWidth: 120 }]}>
        <Text style={[styles.dateLabel, { color: Colors[theme].icon }]}>Start</Text>
        <Text style={[styles.dateText, { color: Colors[theme].text }]}>{format(startDate, 'MMM d, yyyy')}</Text>
      </TouchableOpacity>

      <Text style={{ color: Colors[theme].text }}>-</Text>

      <TouchableOpacity onPress={toggleEndPicker} style={[styles.dateContainer, { backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6', minWidth: 120 }]}>
        <Text style={[styles.dateLabel, { color: Colors[theme].icon }]}>End</Text>
        <Text style={[styles.dateText, { color: Colors[theme].text }]}>{format(endDate, 'MMM d, yyyy')}</Text>
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode={'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartChange}
          themeVariant={theme}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode={'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndChange}
          themeVariant={theme}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    gap: 12,
  },
  button: {
    padding: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 160,
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 10,
    marginRight: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
