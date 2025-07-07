
import { BalanceSheetData, IncomeStatementData, MessageData } from '../types/financialStatementTypes';

export const generateSampleStatement = (type: string): BalanceSheetData | IncomeStatementData | MessageData => {
  switch (type) {
    case 'balance-sheet':
      return {
        assets: {
          current: {
            cash: 250000,
            accountsReceivable: 180000,
            inventory: 95000,
            prepaidExpenses: 12000,
            total: 537000
          },
          nonCurrent: {
            propertyPlantEquipment: 850000,
            intangibleAssets: 45000,
            investments: 120000,
            total: 1015000
          },
          totalAssets: 1552000
        },
        liabilities: {
          current: {
            accountsPayable: 95000,
            shortTermDebt: 75000,
            accruedExpenses: 35000,
            total: 205000
          },
          nonCurrent: {
            longTermDebt: 400000,
            deferredTax: 28000,
            total: 428000
          },
          totalLiabilities: 633000
        },
        equity: {
          shareCapital: 500000,
          retainedEarnings: 419000,
          totalEquity: 919000
        }
      };
    case 'income-statement':
      return {
        revenue: 1850000,
        costOfSales: 925000,
        grossProfit: 925000,
        operatingExpenses: {
          salaries: 320000,
          rent: 96000,
          marketing: 85000,
          utilities: 24000,
          depreciation: 65000,
          other: 45000,
          total: 635000
        },
        operatingIncome: 290000,
        otherIncome: 15000,
        interestExpense: 35000,
        netIncomeBeforeTax: 270000,
        incomeTax: 81000,
        netIncome: 189000
      };
    default:
      return { message: 'Statement type not yet implemented in sample data' };
  }
};
