
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '@/types/finance';
import { calculateMonthlyTotals, formatCurrency } from '@/utils/finance-utils';
import { Card } from '@/components/ui/card';

interface MonthlyChartProps {
  transactions: Transaction[];
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions }) => {
  const monthlyData = calculateMonthlyTotals(transactions);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 border shadow-sm bg-background">
          <p className="font-medium">{label}</p>
          <p className="text-finance-income">
            Income: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-finance-expense">
            Expense: {formatCurrency(payload[1].value)}
          </p>
          <p className="font-medium">
            Balance: {formatCurrency(payload[0].value - payload[1].value)}
          </p>
        </Card>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={monthlyData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barGap={0}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis dataKey="month" />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value).replace('₹', '')}
          width={60}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
        />
        <Legend />
        <Bar 
          dataKey="income" 
          name="Income" 
          fill="#10B981" 
          radius={[4, 4, 0, 0]} 
        />
        <Bar 
          dataKey="expense" 
          name="Expense" 
          fill="#EF4444" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyChart;
