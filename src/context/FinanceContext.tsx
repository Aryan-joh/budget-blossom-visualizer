
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Transaction, Category, Budget } from '@/types/finance';

// Default categories with colors
export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', color: '#EF4444', budget: 15000 },
  { id: '2', name: 'Transport', color: '#F59E0B', budget: 5000 },
  { id: '3', name: 'Entertainment', color: '#10B981', budget: 3000 },
  { id: '4', name: 'Rent', color: '#3B82F6', budget: 20000 },
  { id: '5', name: 'Utilities', color: '#8B5CF6', budget: 5000 },
  { id: '6', name: 'Shopping', color: '#EC4899', budget: 10000 },
  { id: '7', name: 'Health', color: '#14B8A6', budget: 6000 },
  { id: '8', name: 'Salary', color: '#22C55E' },
  { id: '9', name: 'Others', color: '#6B7280', budget: 2000 },
];

// Sample transactions for demonstration
export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 45000,
    type: 'income',
    date: new Date('2025-04-01'),
    description: 'Monthly Salary',
    category: 'Salary',
  },
  {
    id: '2',
    amount: 1200,
    type: 'expense',
    date: new Date('2025-04-12'),
    description: 'Lunch at Restaurant',
    category: 'Food',
  },
  {
    id: '3',
    amount: 3500,
    type: 'expense',
    date: new Date('2025-04-10'),
    description: 'Uber rides for week',
    category: 'Transport',
  },
  {
    id: '4',
    amount: 1800,
    type: 'expense',
    date: new Date('2025-04-15'),
    description: 'Movie tickets',
    category: 'Entertainment',
  },
  {
    id: '5',
    amount: 18000,
    type: 'expense',
    date: new Date('2025-04-05'),
    description: 'Monthly rent',
    category: 'Rent',
  },
  {
    id: '6',
    amount: 2500,
    type: 'expense',
    date: new Date('2025-04-09'),
    description: 'Electricity bill',
    category: 'Utilities',
  },
  {
    id: '7',
    amount: 7500,
    type: 'expense',
    date: new Date('2025-04-08'),
    description: 'New shirt and pants',
    category: 'Shopping',
  },
  {
    id: '8',
    amount: 1200,
    type: 'expense',
    date: new Date('2025-04-04'),
    description: 'Medicines',
    category: 'Health',
  },
  {
    id: '9',
    amount: 5000,
    type: 'income',
    date: new Date('2025-04-16'),
    description: 'Freelance work',
    category: 'Others',
  },
];

interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'LOAD_DATA'; payload: FinanceState };

const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        ),
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: [
          ...state.budgets.filter((budget) => budget.categoryId !== action.payload.categoryId),
          action.payload,
        ],
      };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
};

interface FinanceContextType {
  state: FinanceState;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateBudget: (categoryId: string, amount: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const initialState: FinanceState = {
  transactions: SAMPLE_TRANSACTIONS,
  categories: DEFAULT_CATEGORIES,
  budgets: [],
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Load saved data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('financeData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData, (key, value) => {
          if (key === 'date' && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        });
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('financeData', JSON.stringify(state));
  }, [state]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  };

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
  };

  const updateBudget = (categoryId: string, amount: number) => {
    dispatch({
      type: 'UPDATE_BUDGET',
      payload: { categoryId, amount },
    });
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateBudget,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
