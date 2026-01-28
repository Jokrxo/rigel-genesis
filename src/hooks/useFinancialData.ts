import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  metadata: any;
  user_id: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  depreciation_rate: number;
  useful_life: number;
  location: string;
}

export const useFinancialData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (txError) throw txError;
      setTransactions(txData || []);

      // Assets are managed locally since no assets table exists in DB
      // Use mock data or localStorage
      const storedAssets = localStorage.getItem('rigel_assets');
      if (storedAssets) {
        try {
          setAssets(JSON.parse(storedAssets));
        } catch {
          setAssets([]);
        }
      }

    } catch (err: any) {
      console.error('Error fetching financial data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getDepreciationExpense = (startDate: Date, endDate: Date) => {
    const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const yearFraction = daysInPeriod / 365;

    return assets.reduce((total, asset) => {
       const annualDepreciation = asset.purchase_price * (asset.depreciation_rate / 100);
       return total + (annualDepreciation * yearFraction);
    }, 0);
  };

  const getIncomeStatementData = (startDate: Date, endDate: Date) => {
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= startDate && d <= endDate;
    });

    const revenue = filtered
      .filter(t => ['income', 'donation', 'grant'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const costOfSales = filtered
      .filter(t => ['cost_of_sales'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const otherIncome = filtered
      .filter(t => ['other_income', 'interest_received'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = filtered
      .filter(t => ['expense', 'business_expense', 'other'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const taxExpenses = filtered
      .filter(t => ['tax_payment', 'vat_payment'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expensesByCategory: Record<string, number> = {};
    filtered
      .filter(t => ['expense', 'business_expense', 'other'].includes(t.type))
      .forEach(t => {
        const cat = t.category || 'Uncategorized';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (t.amount || 0);
      });
      
    return {
      revenue,
      costOfSales,
      otherIncome,
      expenses,
      taxExpenses,
      netProfit: revenue + otherIncome - costOfSales - expenses - taxExpenses,
      grossProfit: revenue - costOfSales,
      operatingProfit: revenue + otherIncome - costOfSales - expenses,
      expensesByCategory
    };
  };

  const getBalanceSheetData = (asOfDate: Date) => {
    const historicalTransactions = transactions.filter(t => new Date(t.date) <= asOfDate);
    
    let cashBalance = 0;
    historicalTransactions.forEach(t => {
        if (t.type === 'income') cashBalance += t.amount;
        if (t.type === 'expense') cashBalance -= t.amount;
    });

    const nonCurrentAssets = assets.reduce((sum, asset) => sum + asset.current_value, 0);
    const accountsReceivable = 0; 
    const inventory = 0;

    const totalCurrentAssets = cashBalance + accountsReceivable + inventory;
    const totalAssets = nonCurrentAssets + totalCurrentAssets;

    let retainedEarnings = 0;
    historicalTransactions.forEach(t => {
         if (t.type === 'income') retainedEarnings += t.amount;
         if (t.type === 'expense') retainedEarnings -= t.amount;
    });
    
    const totalDepreciation = assets.reduce((sum, asset) => sum + (asset.purchase_price - asset.current_value), 0);
    retainedEarnings -= totalDepreciation;

    const shareCapital = 100;
    const totalEquity = shareCapital + retainedEarnings;

    const currentLiabilities = 0;
    const nonCurrentLiabilities = 0;
    const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

    return {
      assets: {
        nonCurrent: nonCurrentAssets,
        current: totalCurrentAssets,
        total: totalAssets
      },
      equity: {
        shareCapital,
        retainedEarnings,
        total: totalEquity
      },
      liabilities: {
        nonCurrent: nonCurrentLiabilities,
        current: currentLiabilities,
        total: totalLiabilities
      }
    };
  };

  return { 
      transactions, 
      assets,
      loading, 
      error, 
      refresh: fetchTransactions, 
      getIncomeStatementData, 
      getBalanceSheetData,
      getDepreciationExpense
  };
};
