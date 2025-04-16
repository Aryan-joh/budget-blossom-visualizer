
import React, { useState } from 'react';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, TrendingUp, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import MonthlyChart from './MonthlyChart';
import CategoryChart from './CategoryChart';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/utils/finance-utils';
import { Transaction } from '@/types/finance';
import { 
  calculateTotals, 
  getCurrentMonthTransactions, 
  calculateCategoryTotals,
  getHighestSpendingCategory,
  calculateBudgetInsights
} from '@/utils/finance-utils';
import BudgetList from './BudgetList';

const Dashboard: React.FC = () => {
  const { state } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>(undefined);

  // Get current month transactions
  const currentMonthTransactions = getCurrentMonthTransactions(state.transactions);
  
  // Calculate totals
  const { income, expense } = calculateTotals(currentMonthTransactions);
  const balance = income - expense;
  
  // Calculate category totals
  const categoryTotals = calculateCategoryTotals(state.transactions, state.categories);
  const highestCategory = getHighestSpendingCategory(categoryTotals);
  
  // Budget insights
  const { overBudget, underBudget } = calculateBudgetInsights(categoryTotals);

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditTransaction(undefined);
    }
  };

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Header Section with Add Transaction Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Track, visualize, and manage your personal finances
          </p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle size={18} />
          <span>New Transaction</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Month Balance
            </CardTitle>
            <ArrowUpCircle className={cn(
              "h-4 w-4",
              balance >= 0 ? "text-finance-income" : "text-finance-expense"
            )} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 
                ? `You saved ${formatCurrency(balance)} this month` 
                : `You overspent ${formatCurrency(-balance)} this month`
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animate-delay-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-finance-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-income">
              {formatCurrency(income)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total income for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animate-delay-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-finance-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-expense">
              {formatCurrency(expense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total spending for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Insights */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Monthly Chart */}
        <Card className="lg:col-span-2 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} />
              Monthly Trend
            </CardTitle>
            <CardDescription>Income and expenses over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <MonthlyChart transactions={state.transactions} />
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="animate-fade-in animate-delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart size={18} />
              Category Breakdown
            </CardTitle>
            <CardDescription>Current month expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <CategoryChart categoryTotals={categoryTotals} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Tracking */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 animate-fade-in">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your most recent financial activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionList 
              transactions={state.transactions.slice(0, 5)} 
              categories={state.categories}
              onEdit={handleEditTransaction}
            />
            {state.transactions.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View All Transactions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in animate-delay-100">
          <CardHeader>
            <CardTitle>Budget Tracking</CardTitle>
            <CardDescription>
              Monitor your spending against your budget
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BudgetList categoryTotals={categoryTotals} />
            
            {/* Budget Insights */}
            {overBudget.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-finance-expense mb-2">Budget Alerts</h4>
                {overBudget.slice(0, 2).map((category) => (
                  <p key={category.categoryId} className="text-sm text-finance-expense mb-1">
                    You've exceeded your {category.categoryName} budget by {formatCurrency((category as any).overAmount)}
                  </p>
                ))}
              </div>
            )}
            
            {underBudget.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-finance-income mb-2">Good Job!</h4>
                {underBudget.slice(0, 2).map((category) => (
                  <p key={category.categoryId} className="text-sm text-finance-income mb-1">
                    You're under budget in {category.categoryName} by {formatCurrency((category as any).underAmount)}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form Dialog */}
      <TransactionForm 
        open={isFormOpen} 
        onOpenChange={handleFormClose} 
        editTransaction={editTransaction} 
      />
    </div>
  );
};

const cn = (...args: any[]) => args.filter(Boolean).join(' ');

export default Dashboard;
