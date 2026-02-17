import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTransactionStore, TransactionType } from '@/store/transactionStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react-native';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];

export default function ModalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { addTransaction } = useTransactionStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

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

    addTransaction({
      amount: Number(amount),
      category,
      description,
      type,
      date: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[theme].text }]}>New Transaction</Text>
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
              ]}>Expense</Text>
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
              ]}>Income</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[theme].text }]}>Amount</Text>
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
            <Text style={[styles.label, { color: Colors[theme].text }]}>Description</Text>
            <TextInput
              style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].border }]}
              placeholder="What is this for?"
              placeholderTextColor={Colors[theme].icon}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[theme].text }]}>Category</Text>
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
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: Colors[theme].border }]}>
          <Button title="Save Transaction" onPress={handleSave} />
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
