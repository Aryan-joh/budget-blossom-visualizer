
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: Date;
  description: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  budget?: number;
}

export interface Budget {
  categoryId: string;
  amount: number;
}

export interface MonthlyTotal {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  total: number;
  color: string;
  budget?: number;
}
