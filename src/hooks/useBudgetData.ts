
import { useState, useEffect, useCallback } from 'react';
import { budgetApi, Budget } from '@/lib/budget-api';

export type { Budget };

export const useBudgetData = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await budgetApi.getBudgets();
      setBudgets(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const addBudget = async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent'>) => {
    try {
      await budgetApi.createBudget(budget);
      await fetchBudgets(); // Refresh list
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const getBudgetByCategory = (category: string) => {
    return budgets.find(b => b.category.toLowerCase().includes(category.toLowerCase()));
  };
  
  const getDepartmentBudgets = (department: string) => {
      return budgets.filter(b => b.department.toLowerCase() === department.toLowerCase());
  };

  return {
    budgets,
    loading,
    error,
    addBudget,
    refresh: fetchBudgets,
    getBudgetByCategory,
    getDepartmentBudgets
  };
};
