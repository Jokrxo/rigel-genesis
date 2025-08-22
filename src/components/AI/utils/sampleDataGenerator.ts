
import { BalanceSheetData, IncomeStatementData, MessageData } from '../types/financialStatementTypes';

export const generateSampleStatement = (type: string): BalanceSheetData | IncomeStatementData | MessageData => {
  switch (type) {
    case 'balance-sheet':
      return {
        assets: {
          current: {
            cash: 0,
            accountsReceivable: 0,
            inventory: 0,
            prepaidExpenses: 0,
            total: 0
          },
          nonCurrent: {
            propertyPlantEquipment: 0,
            intangibleAssets: 0,
            investments: 0,
            total: 0
          },
          totalAssets: 0
        },
        liabilities: {
          current: {
            accountsPayable: 0,
            shortTermDebt: 0,
            accruedExpenses: 0,
            total: 0
          },
          nonCurrent: {
            longTermDebt: 0,
            deferredTax: 0,
            total: 0
          },
          totalLiabilities: 0
        },
        equity: {
          shareCapital: 0,
          retainedEarnings: 0,
          totalEquity: 0
        }
      };
    case 'income-statement':
      return {
        revenue: 0,
        costOfSales: 0,
        grossProfit: 0,
        operatingExpenses: {
          salaries: 0,
          rent: 0,
          marketing: 0,
          utilities: 0,
          depreciation: 0,
          other: 0,
          total: 0
        },
        operatingIncome: 0,
        otherIncome: 0,
        interestExpense: 0,
        netIncomeBeforeTax: 0,
        incomeTax: 0,
        netIncome: 0
      };
    default:
      return { message: 'No data available. Please import financial data first.' };
  }
};
