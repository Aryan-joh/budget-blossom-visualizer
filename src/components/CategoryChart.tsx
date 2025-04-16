
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryTotal } from '@/types/finance';
import { formatCurrency } from '@/utils/finance-utils';
import { Card } from '@/components/ui/card';

interface CategoryChartProps {
  categoryTotals: CategoryTotal[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ categoryTotals }) => {
  // Filter out categories with no transactions
  const data = categoryTotals.filter(cat => cat.total > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <Card className="p-3 border shadow-sm bg-background">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <p className="font-medium">{item.categoryName}</p>
          </div>
          <p>{formatCurrency(item.total)}</p>
          {item.budget && (
            <>
              <p className="text-xs text-muted-foreground mt-1">
                Budget: {formatCurrency(item.budget)}
              </p>
              <p className={`text-xs ${item.total > item.budget ? 'text-finance-expense' : 'text-finance-income'}`}>
                {item.total > item.budget
                  ? `Over by ${formatCurrency(item.total - item.budget)}`
                  : `Under by ${formatCurrency(item.budget - item.total)}`}
              </p>
            </>
          )}
        </Card>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 text-xs mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Empty state
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-center">
          No expenses recorded this month
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            dataKey="total"
            nameKey="categoryName"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={<CustomLegend />}
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
