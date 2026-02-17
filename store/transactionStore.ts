import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionType = 'income' | 'expense';
export type FilterType = 'daily' | 'monthly' | 'yearly' | 'custom';

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO string
  description: string;
  category: string;
  type: TransactionType;
}

interface TransactionState {
  transactions: Transaction[];
  filter: FilterType;
  selectedDate: string; // ISO string
  dateRange: { start: string; end: string };
  setFilter: (filter: FilterType) => void;
  setSelectedDate: (date: Date) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
  getBalance: () => number;
  getIncome: () => number;
  getExpense: () => number;
  getFilteredTransactions: () => Transaction[];
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      filter: 'monthly',
      selectedDate: new Date().toISOString(),
      dateRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
      setFilter: (filter) => set({ 
        filter,
        selectedDate: new Date().toISOString() 
      }),
      setSelectedDate: (date) => set({ selectedDate: date.toISOString() }),
      setDateRange: (range) => set({ 
        dateRange: { 
          start: range.start.toISOString(), 
          end: range.end.toISOString() 
        } 
      }),
      addTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: Math.random().toString(36).substring(7) };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },
      updateTransaction: (id, updatedFields) => {
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? { ...t, ...updatedFields } : t
          ),
        }));
      },
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      clearTransactions: () => {
        set({ transactions: [] });
      },
      getBalance: () => {
        const { getFilteredTransactions } = get();
        const transactions = getFilteredTransactions();
        return transactions.reduce((acc, curr) => {
          return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
        }, 0);
      },
      getIncome: () => {
        const { getFilteredTransactions } = get();
        const transactions = getFilteredTransactions();
        return transactions
          .filter((t) => t.type === 'income')
          .reduce((acc, curr) => acc + curr.amount, 0);
      },
      getExpense: () => {
        const { getFilteredTransactions } = get();
        const transactions = getFilteredTransactions();
        return transactions
          .filter((t) => t.type === 'expense')
          .reduce((acc, curr) => acc + curr.amount, 0);
      },
      getFilteredTransactions: () => {
        const { transactions, filter, selectedDate, dateRange } = get();
        const now = new Date(selectedDate);
        
        return transactions.filter((t) => {
          const tDate = new Date(t.date);
          
          if (filter === 'daily') {
            return tDate.getDate() === now.getDate() &&
                   tDate.getMonth() === now.getMonth() &&
                   tDate.getFullYear() === now.getFullYear();
          }
          
          if (filter === 'monthly') {
            return tDate.getMonth() === now.getMonth() &&
                   tDate.getFullYear() === now.getFullYear();
          }
          
          if (filter === 'yearly') {
            return tDate.getFullYear() === now.getFullYear();
          }

          if (filter === 'custom') {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return tDate >= start && tDate <= end;
          }
          
          return true;
        });
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
