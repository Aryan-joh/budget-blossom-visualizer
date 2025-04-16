
import React from 'react';
import { CategoryTotal } from '@/types/finance';
import { formatCurrency } from '@/utils/finance-utils';
import { Progress } from '@/components/ui/progress';

interface BudgetListProps {
  categoryTotals: CategoryTotal[];
}

const BudgetList: React.FC<BudgetListProps> = ({ categoryTotals }) => {
  // Filter categories with budgets
  const categories = categoryTotals.filter(
    (category) => category.budget !== undefined && category.budget > 0
  );

  // Sort by percentage used (highest first)
  categories.sort((a, b) => {
    const aPercentage = a.budget ? (a.total / a.budget) * 100 : 0;
    const bPercentage = b.budget ? (b.total / b.budget) * 100 : 0;
    return bPercentage - aPercentage;
  });

  // If no categories have budgets
  if (categories.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-muted-foreground text-sm">No budgets set</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const percentage = category.budget ? (category.total / category.budget) * 100 : 0;
        let statusColor = 'bg-primary';
        
        if (percentage >= 100) {
          statusColor = 'bg-finance-expense';
        } else if (percentage >= 75) {
          statusColor = 'bg-orange-500';
        } else if (percentage >= 50) {
          statusColor = 'bg-yellow-500';
        } else {
          statusColor = 'bg-finance-income';
        }
        
        return (
          <div key={category.categoryId} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium">{category.categoryName}</span>
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(category.total)} / {formatCurrency(category.budget!)}
              </div>
            </div>
            <div className="relative pt-1">
              <Progress 
                value={Math.min(percentage, 100)} 
                max={100}
                className="h-2"
                indicatorClassName={statusColor}
              />
              <span className="absolute right-0 -top-1 text-xs text-muted-foreground">
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetList;
