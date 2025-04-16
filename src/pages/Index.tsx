
import React from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FinanceProvider } from '@/context/FinanceContext';

const Index: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <FinanceProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Dashboard />
          </main>
        </div>
      </FinanceProvider>
    </ThemeProvider>
  );
};

export default Index;
