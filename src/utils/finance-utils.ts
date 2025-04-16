
import { 
  Transaction, 
  Category, 
  CategoryTotal, 
  MonthlyTotal, 
  TransactionType 
} from '@/types/finance';

// Format amount as currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date to display format
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Get current month's transactions
export const getCurrentMonthTransactions = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });
};

// Calculate total income and expense
export const calculateTotals = (transactions: Transaction[]): { income: number; expense: number } => {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );
};

// Calculate monthly totals for graph
export const calculateMonthlyTotals = (
  transactions: Transaction[],
  monthsToShow = 6
): MonthlyTotal[] => {
  const result: Record<string, MonthlyTotal> = {};
  const today = new Date();
  
  // Initialize with past months
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    result[monthStr] = { month: monthStr, income: 0, expense: 0 };
  }
  
  // Populate with actual data
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    // Only consider transactions within our display range
    const monthDiff = (today.getFullYear() - date.getFullYear()) * 12 + today.getMonth() - date.getMonth();
    
    if (monthDiff >= 0 && monthDiff < monthsToShow) {
      const monthStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!result[monthStr]) {
        result[monthStr] = { month: monthStr, income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        result[monthStr].income += transaction.amount;
      } else {
        result[monthStr].expense += transaction.amount;
      }
    }
  });
  
  return Object.values(result);
};

// Calculate category totals for current month
export const calculateCategoryTotals = (
  transactions: Transaction[],
  categories: Category[],
  type: TransactionType = 'expense'
): CategoryTotal[] => {
  // Get current month transactions
  const currentMonthTransactions = getCurrentMonthTransactions(transactions);
  
  // Filter by transaction type
  const filteredTransactions = currentMonthTransactions.filter(
    transaction => transaction.type === type
  );
  
  const categoryMap = new Map<string, { total: number; categoryName: string; color: string; budget?: number }>();
  
  // Initialize map with all categories
  categories.forEach(category => {
    categoryMap.set(category.name, {
      total: 0,
      categoryName: category.name,
      color: category.color,
      budget: category.budget,
    });
  });
  
  // Calculate totals
  filteredTransactions.forEach(transaction => {
    const categoryInfo = categoryMap.get(transaction.category);
    if (categoryInfo) {
      categoryInfo.total += transaction.amount;
      categoryMap.set(transaction.category, categoryInfo);
    }
  });
  
  // Convert map to array
  return Array.from(categoryMap.entries())
    .filter(([_, { total }]) => total > 0) // Only include categories with transactions
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.categoryName,
      total: data.total,
      color: data.color,
      budget: data.budget,
    }));
};

// Get the category with the highest spending
export const getHighestSpendingCategory = (categoryTotals: CategoryTotal[]): CategoryTotal | null => {
  if (categoryTotals.length === 0) return null;
  
  return categoryTotals.reduce((max, category) => 
    category.total > max.total ? category : max
  , categoryTotals[0]);
};

// Calculate budget insights
export const calculateBudgetInsights = (
  categoryTotals: CategoryTotal[]
): { overBudget: CategoryTotal[]; underBudget: CategoryTotal[] } => {
  const overBudget: CategoryTotal[] = [];
  const underBudget: CategoryTotal[] = [];
  
  categoryTotals.forEach(category => {
    if (category.budget && category.total > category.budget) {
      overBudget.push({
        ...category,
        // Calculate how much over budget
        overAmount: category.total - category.budget,
      } as CategoryTotal & { overAmount: number });
    } else if (category.budget && category.total < category.budget) {
      underBudget.push({
        ...category,
        // Calculate how much under budget
        underAmount: category.budget - category.total,
      } as CategoryTotal & { underAmount: number });
    }
  });
  
  // Sort by the amount over/under budget
  overBudget.sort((a, b) => (b as any).overAmount - (a as any).overAmount);
  underBudget.sort((a, b) => (b as any).underAmount - (a as any).underAmount);
  
  return { overBudget, underBudget };
};
