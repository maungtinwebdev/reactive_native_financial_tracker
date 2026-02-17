import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionType = 'income' | 'expense';

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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
  getBalance: () => number;
  getIncome: () => number;
  getExpense: () => number;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: Math.random().toString(36).substring(7) };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
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
        const { transactions } = get();
        return transactions.reduce((acc, curr) => {
          return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
        }, 0);
      },
      getIncome: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.type === 'income')
          .reduce((acc, curr) => acc + curr.amount, 0);
      },
      getExpense: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.type === 'expense')
          .reduce((acc, curr) => acc + curr.amount, 0);
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
