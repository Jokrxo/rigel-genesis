import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { journalApi, JournalEntry } from '@/lib/journal-api';
import { fixedAssetsApi, FixedAsset } from '@/lib/fixed-assets-api';

export interface AccountBalance {
  account_id: string;
  code: string;
  name: string;
  type: string;
  subtype: string;
  current_balance: number;
}

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
    nonCurrent: {
      propertyPlantEquipment: number;
      intangibleAssets: number;
      investments: number;
      total: number;
    };
    current: {
      inventories: number;
      tradeReceivables: number;
      cashAndEquivalents: number;
      total: number;
    };
    total: number;
  };
  equity: {
    shareCapital: number;
    retainedEarnings: number;
    drawings: number;
    total: number;
  };
  liabilities: {
    nonCurrent: {
      longTermBorrowings: number;
      total: number;
    };
    current: {
      tradePayables: number;
      shortTermBorrowings: number;
      taxLiabilities: number;
      total: number;
    };
    total: number;
  };
}

export const useFinancialData = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [journalData, assetsData, balancesData] = await Promise.all([
        supabase
          .from('journal_entries')
          .select(`
            *,
            lines:journal_entry_lines (
              id,
              account_id,
              description,
              debit,
              credit
            )
          `)
          .order('date', { ascending: false }),
        fixedAssetsApi.getAll(),
        supabase.from('account_balances').select('*')
      ]);

      if (journalData.error) throw journalData.error;

      // Transform Supabase data to match JournalEntry interface if needed, 
      // or just use the returned structure. 
      // The current JournalEntry interface expects 'accountId', but Supabase returns 'account_id'.
      // We'll map it.
      const mappedEntries = (journalData.data || []).map((entry: any) => ({
        ...entry,
        lines: entry.lines.map((line: any) => ({
          ...line,
          accountId: line.account_id // Map snake_case to camelCase
        }))
      }));

      setEntries(mappedEntries);
      setAssets(assetsData);
      if (balancesData.data) {
        setAccountBalances(balancesData.data as any as AccountBalance[]);
      }

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
    let otherIncome = 0;
    let expenses = 0;
    const taxExpenses = 0;
    const expensesByCategory: Record<string, number> = {};

    // Create lookup map for accounts
    const accountMap = new Map(accountBalances.map(b => [b.account_id, b]));

    entries.forEach(entry => {
      // Only include posted entries for financial reports
      if (entry.status !== 'posted') return;

      const entryDate = new Date(entry.date);
      if (entryDate >= startDate && entryDate <= endDate) {
        entry.lines.forEach(line => {
          const account = accountMap.get(line.accountId);
          if (!account) return;

          const type = getAccountType(account.code);
          const amount = Number(line.credit) - Number(line.debit); // Revenue is Credit normal

          if (type === 'revenue') {
             // Check if it's other income based on code or subtype
             if (account.subtype === 'other_income' || account.code.startsWith('42')) {
                 otherIncome += amount;
             } else {
                 revenue += amount;
             }
          }
          
          if (type === 'cogs') {
              costOfSales += (Number(line.debit) - Number(line.credit)); // Expense is Debit normal
          }

          if (type === 'expense') {
            const expAmount = Number(line.debit) - Number(line.credit);
            expenses += expAmount;
            
            // Categorize
            let cat = 'Other';
            if (account.subtype) {
                // capitalize first letter
                cat = account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1).replace(/_/g, ' ');
            } else {
                cat = line.description || account.name || 'General';
            }
            
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
    // Use real-time account balances for current state
    const balances = accountBalances;
    
    // Initialize totals
    let ppe = 0;
    let inventory = 0;
    let tradeReceivables = 0;
    let cash = 0;
    
    let shareCapital = 0;
    let retainedEarningsAccount = 0;
    let drawings = 0;
    let currentYearProfit = 0;
    
    let longTermLiabilities = 0;
    let tradePayables = 0;
    let taxLiabilities = 0;
    let otherCurrentLiabilities = 0;

    balances.forEach(b => {
        const bal = Number(b.current_balance);
        const code = Number(b.code);
        
        if (b.type === 'asset') {
            if (b.subtype === 'fixed_asset') ppe += bal;
            else if (code >= 1100 && code < 1200) inventory += bal;
            else if (code >= 1200 && code < 1300) tradeReceivables += bal;
            else if (code >= 1300 && code < 1400) cash += bal;
            else if (code >= 1400 && code < 1500) tradeReceivables += bal; // VAT Receivable treated as receivable
            else if (b.subtype === 'current_asset') cash += bal; // Fallback
            else ppe += bal; // Fallback to non-current
        }
        else if (b.type === 'equity') {
            if (code === 2000) shareCapital += bal;
            else if (code === 2100) retainedEarningsAccount += bal;
            else if (code === 2200) drawings += bal;
        }
        else if (b.type === 'liability') {
            if (b.subtype === 'long_term_liability') longTermLiabilities += bal;
            else if (code >= 3100 && code < 3200) tradePayables += bal;
            else if (code >= 3200 && code < 3300) taxLiabilities += bal; // VAT Payable
            else if (code >= 3300 && code < 3500) otherCurrentLiabilities += bal; // Payroll, Accrued
            else otherCurrentLiabilities += bal;
        }
        else if (b.type === 'income' || b.type === 'revenue') {
            currentYearProfit += bal;
        }
        else if (b.type === 'expense' || b.type === 'cogs') {
            currentYearProfit -= bal;
        }
    });

    const totalRetainedEarnings = retainedEarningsAccount + currentYearProfit + drawings;

    return {
      assets: {
        nonCurrent: {
            propertyPlantEquipment: ppe,
            intangibleAssets: 0,
            investments: 0,
            total: ppe
        },
        current: {
            inventories: inventory,
            tradeReceivables: tradeReceivables,
            cashAndEquivalents: cash,
            total: inventory + tradeReceivables + cash
        },
        total: ppe + inventory + tradeReceivables + cash
      },
      equity: {
        shareCapital,
        retainedEarnings: totalRetainedEarnings,
        drawings,
        total: shareCapital + totalRetainedEarnings + drawings
      },
      liabilities: {
        nonCurrent: {
            longTermBorrowings: longTermLiabilities,
            total: longTermLiabilities
        },
        current: {
            tradePayables: tradePayables,
            shortTermBorrowings: 0,
            taxLiabilities: taxLiabilities,
            total: tradePayables + taxLiabilities + otherCurrentLiabilities
        },
        total: longTermLiabilities + tradePayables + taxLiabilities + otherCurrentLiabilities
      }
    };
  };

  const getCashFlowStatementData = (startDate: Date, endDate: Date) => {
    let netProfit = 0;
    let depreciation = 0;
    let increaseInventory = 0;
    let increaseReceivables = 0;
    let increasePayables = 0;
    let purchasePPE = 0;
    let loansReceived = 0;
    let loansRepaid = 0;
    let capitalIssued = 0;
    let dividendsPaid = 0;

    const accountMap = new Map(accountBalances.map(b => [b.account_id, b]));

    // Calculate Net Profit for the period first (Income - Expenses)
    // And calculate movements in balance sheet accounts
    entries.forEach(entry => {
        if (entry.status !== 'posted') return;
        const entryDate = new Date(entry.date);
        if (entryDate < startDate || entryDate > endDate) return;

        entry.lines.forEach(line => {
            const account = accountMap.get(line.accountId);
            if (!account) return;
            
            const debit = Number(line.debit);
            const credit = Number(line.credit);
            const netDebit = debit - credit;
            const netCredit = credit - debit;

            // Income Statement items
            if (account.type === 'revenue' || account.type === 'income') {
                netProfit += netCredit;
            } else if (account.type === 'expense' || account.type === 'cogs') {
                netProfit -= netDebit;
                
                // Add back depreciation
                if (account.name.toLowerCase().includes('depreciation') || 
                    account.subtype === 'depreciation') {
                    depreciation += netDebit;
                }
            }
            
            // Working Capital Changes
            else if (account.type === 'asset') {
                const code = Number(account.code);
                // Inventory (1100 range)
                if (code >= 1100 && code < 1200) {
                    increaseInventory += netDebit; // Increase is outflow
                }
                // Receivables (1200 range)
                else if (code >= 1200 && code < 1300) {
                    increaseReceivables += netDebit; // Increase is outflow
                }
                // Fixed Assets (PPE)
                else if (account.subtype === 'fixed_asset') {
                    purchasePPE += netDebit; // Purchase is outflow
                }
            }
            else if (account.type === 'liability') {
                const code = Number(account.code);
                // Trade Payables (3100 range)
                if (code >= 3100 && code < 3200) {
                    increasePayables += netCredit; // Increase is inflow
                }
                // Loans
                else if (account.subtype === 'long_term_liability' || account.subtype === 'liability') {
                    if (netCredit > 0) loansReceived += netCredit;
                    if (netDebit > 0) loansRepaid += netDebit;
                }
            }
            else if (account.type === 'equity') {
                const code = Number(account.code);
                if (code === 2000) capitalIssued += netCredit;
                else if (code === 2200) dividendsPaid += netDebit;
            }
        });
    });

    const cashFromOperations = netProfit + depreciation - increaseInventory - increaseReceivables + increasePayables;
    const cashFromInvesting = -purchasePPE;
    const cashFromFinancing = loansReceived - loansRepaid + capitalIssued - dividendsPaid;
    const netChangeInCash = cashFromOperations + cashFromInvesting + cashFromFinancing;

    return {
        operatingActivities: {
            netProfit,
            adjustments: {
                depreciation,
                workingCapital: {
                    increaseInventory,
                    increaseReceivables,
                    increasePayables
                }
            },
            total: cashFromOperations
        },
        investingActivities: {
            purchasePPE,
            total: cashFromInvesting
        },
        financingActivities: {
            loansReceived,
            loansRepaid,
            capitalIssued,
            dividendsPaid,
            total: cashFromFinancing
        },
        netChangeInCash
    };
  };

  return {
    entries,
    accountBalances,
    loading,
    error,
    getIncomeStatementData,
    getBalanceSheetData,
    getCashFlowStatementData,
    refresh: fetchFinancialData
  };
};
