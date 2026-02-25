import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransactionStore, TransactionType } from '@/store/transactionStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/components/ui/Button';
import { X, Calendar as CalendarIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Animated from 'react-native-reanimated';
import { getCategoryIcon } from '@/utils/icons';
import { useTranslation } from 'react-i18next';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];

export default function ModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const isEditing = !!params.id;
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { transactions, addTransaction, updateTransaction } = useTransactionStore();
  const { t } = useTranslation();

  const transaction = isEditing ? transactions.find(t => t.id === params.id) : undefined;

  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState(transaction ? new Date(transaction.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const AnimatedView = Animated.View as any;

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid number for amount');
      return;
    }
    if (!category) {
      Alert.alert('Missing Category', 'Please select a category');
      return;
    }
    if (!description) {
      Alert.alert('Missing Description', 'Please enter a description');
      return;
    }

    if (isEditing && params.id) {
      updateTransaction(params.id, {
        amount: Number(amount),
        category,
        description,
        type,
        date: date.toISOString(),
      });
    } else {
      addTransaction({
        amount: Number(amount),
        category,
        description,
        type,
        date: date.toISOString(),
      });
    }

    Keyboard.dismiss();
    router.back();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {isEditing && (
            <AnimatedView
              sharedTransitionTag={`icon-${params.id}`}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: type === 'income'
                  ? (theme === 'dark' ? '#064e3b' : '#dcfce7') 
                  : (theme === 'dark' ? '#7f1d1d' : '#fee2e2')
              }}
            >
              {getCategoryIcon(category, type === 'income' ? (theme === 'dark' ? '#34d399' : Colors.light.success) : (theme === 'dark' ? '#f87171' : Colors.light.danger))}
            </AnimatedView>
          )}
          <Text style={[styles.title, { color: Colors[theme].text }]}>{isEditing ? t('transactions.editTransaction') : t('transactions.newTransaction')}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <X color={Colors[theme].text} size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && { backgroundColor: Colors[theme].danger },
                type !== 'expense' && { backgroundColor: Colors[theme].border }
              ]}
              onPress={() => {
                setType('expense');
                setCategory('');
              }}
            >
              <Text style={[
                styles.typeText,
                type === 'expense' ? { color: '#fff' } : { color: Colors[theme].text }
              ]}>{t('transactions.expense')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && { backgroundColor: Colors[theme].success },
                type !== 'income' && { backgroundColor: Colors[theme].border }
              ]}
              onPress={() => {
                setType('income');
                setCategory('');
              }}
            >
              <Text style={[
                styles.typeText,
                type === 'income' ? { color: '#fff' } : { color: Colors[theme].text }
              ]}>{t('transactions.income')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[theme].text }]}>{t('transactions.amount')}</Text>
            <TextInput
              style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].border, fontSize: 32 }]}
              placeholder="0.00"
              placeholderTextColor={Colors[theme].icon}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[theme].text }]}>{t('transactions.date')}</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: Colors[theme].border }]}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setShowDatePicker(!showDatePicker);
                } else {
                  setShowDatePicker(true);
                }
              }}
            >
              <Text style={[styles.dateText, { color: Colors[theme].text }]}>
                {format(date, 'MMMM dd, yyyy')}
              </Text>
              <CalendarIcon size={20} color={Colors[theme].icon} />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                textColor={Colors[theme].text}
                themeVariant={theme}
                style={Platform.OS === 'ios' ? { width: '100%', marginTop: 10 } : undefined}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[theme].text }]}>{t('transactions.description')}</Text>
            <TextInput
              style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].border }]}
              placeholder={t('transactions.description')}
              placeholderTextColor={Colors[theme].icon}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[theme].text }]}>{t('transactions.category')}</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat 
                      ? { backgroundColor: type === 'income' ? Colors[theme].success : Colors[theme].danger } 
                      : { backgroundColor: Colors[theme].border }
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.categoryText,
                    category === cat ? { color: '#fff' } : { color: Colors[theme].text }
                  ]}>{t(`categories.${cat}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: Colors[theme].border }]}>
          <Button title={t('common.save')} onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  input: {
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: 18,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
  },
});
