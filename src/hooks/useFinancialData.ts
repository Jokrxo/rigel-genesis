import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { journalApi, JournalEntry } from '@/lib/journal-api';
import { fixedAssetsApi, FixedAsset } from '@/lib/fixed-assets-api';

export interface FinancialDataResult {
  revenue: number;
  costOfSales: number;
  otherIncome: number;
  expenses: number;
  taxExpenses: number;
  netProfit: number;
  grossProfit: number;
  operatingProfit: number;
  expensesByCategory: Record<string, number>;
}

export interface BalanceSheetResult {
  assets: {
    nonCurrent: number;
    current: number;
    total: number;
  };
  equity: {
    shareCapital: number;
    retainedEarnings: number;
    total: number;
  };
  liabilities: {
    nonCurrent: number;
    current: number;
    total: number;
  };
}

export const useFinancialData = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [journalData, assetsData] = await Promise.all([
        journalApi.getEntries(),
        fixedAssetsApi.getAll()
      ]);

      setEntries(journalData);
      setAssets(assetsData);

    } catch (err: unknown) {
      console.error('Error fetching financial data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialData();

    const channel = supabase
      .channel('financial-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries'
        },
        () => {
          fetchFinancialData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFinancialData]);

  const getAccountType = (code: string) => {
    const prefix = code.substring(0, 1);
    switch(prefix) {
      case '1': return 'asset';
      case '2': return 'liability';
      case '3': return 'equity';
      case '4': return 'revenue';
      case '5': return 'cogs';
      case '6': return 'expense';
      default: return 'other';
    }
  };

  const getIncomeStatementData = (startDate: Date, endDate: Date): FinancialDataResult => {
    let revenue = 0;
    let costOfSales = 0;
    const otherIncome = 0;
    let expenses = 0;
    const taxExpenses = 0;
    const expensesByCategory: Record<string, number> = {};

    entries.forEach(entry => {
      // Only include posted entries for financial reports
      if (entry.status !== 'posted') return;

      const entryDate = new Date(entry.date);
      if (entryDate >= startDate && entryDate <= endDate) {
        entry.lines.forEach(line => {
          const type = getAccountType(line.accountId);
          const amount = Number(line.credit) - Number(line.debit); // Revenue is Credit normal

          if (type === 'revenue') revenue += amount;
          if (type === 'cogs') costOfSales += (Number(line.debit) - Number(line.credit)); // Expense is Debit normal
          if (type === 'expense') {
            const expAmount = Number(line.debit) - Number(line.credit);
            expenses += expAmount;
            // Simple categorization by account code for now
            const cat = line.description || 'General';
            expensesByCategory[cat] = (expensesByCategory[cat] || 0) + expAmount;
          }
        });
      }
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

  const getBalanceSheetData = (asOfDate: Date): BalanceSheetResult => {
    let currentAssets = 0;
    let nonCurrentAssets = 0;
    let currentLiabilities = 0;
    let nonCurrentLiabilities = 0;
    let shareCapital = 0;
    let retainedEarnings = 0;

    // Calculate from Journal Entries
    entries.forEach(entry => {
      // Only include posted entries
      if (entry.status !== 'posted') return;

      const entryDate = new Date(entry.date);
      if (entryDate <= asOfDate) {
        entry.lines.forEach(line => {
          const type = getAccountType(line.accountId);
          const debit = Number(line.debit);
          const credit = Number(line.credit);
          const netDebit = debit - credit;
          const netCredit = credit - debit;

          // 1xxx Assets
          if (type === 'asset') {
             // Heuristic: 1000-1499 Current, 1500-1999 Non-Current
             if (Number(line.accountId) < 1500) {
                 currentAssets += netDebit;
             } else {
                 nonCurrentAssets += netDebit;
             }
          }
          // 2xxx Liabilities
          else if (type === 'liability') {
              // Heuristic: 2000-2499 Current, 2500-2999 Non-Current
              if (Number(line.accountId) < 2500) {
                  currentLiabilities += netCredit;
              } else {
                  nonCurrentLiabilities += netCredit;
              }
          }
          // 3xxx Equity
          else if (type === 'equity') {
              shareCapital += netCredit;
          }
          // P&L items flow to Retained Earnings
          else if (['revenue', 'cogs', 'expense'].includes(type)) {
              retainedEarnings += netCredit; // Revenue increases Equity, Expenses decrease it
          }
        });
      }
    });

    // Fallback/Augment with Fixed Assets module if GL is empty for assets
    // This is a hybrid approach to ensure data shows up even if GL isn't fully populated manually
    if (nonCurrentAssets === 0 && assets.length > 0) {
        nonCurrentAssets = assets.reduce((sum, a) => sum + (a.cost_price - (a.accum_depr || 0)), 0);
    }

    return {
      assets: {
        nonCurrent: nonCurrentAssets,
        current: currentAssets,
        total: nonCurrentAssets + currentAssets
      },
      equity: {
        shareCapital,
        retainedEarnings,
        total: shareCapital + retainedEarnings
      },
      liabilities: {
        nonCurrent: nonCurrentLiabilities,
        current: currentLiabilities,
        total: nonCurrentLiabilities + currentLiabilities
      }
    };
  };

  const getDepreciationExpense = (startDate: Date, endDate: Date) => {
    // Calculate from Fixed Assets module
     const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
     const yearFraction = daysInPeriod / 365;
 
     return assets.reduce((total, asset) => {
        const annualDepreciation = asset.cost_price * (asset.depreciation_rate / 100);
        return total + (annualDepreciation * yearFraction);
     }, 0);
  };

  const getBankBalance = (): number => {
    let bankBalance = 0;
    entries.forEach(entry => {
      if (entry.status !== 'posted') return;
      entry.lines.forEach(line => {
        // Assuming 1000 is the main Bank account
        if (line.accountId === '1000') {
          bankBalance += (Number(line.debit) - Number(line.credit));
        }
      });
    });
    return bankBalance;
  };

  return { 
    entries, 
    assets,
    loading, 
    error, 
    refresh: fetchFinancialData, 
    getIncomeStatementData, 
    getBalanceSheetData,
    getDepreciationExpense,
    getBankBalance
  };
};
