
export interface BalanceSheetData {
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      total: number;
    };
    nonCurrent: {
      propertyPlantEquipment: number;
      intangibleAssets: number;
      investments: number;
      total: number;
    };
    totalAssets: number;
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      total: number;
    };
    nonCurrent: {
      longTermDebt: number;
      deferredTax: number;
      total: number;
    };
    totalLiabilities: number;
  };
  equity: {
    shareCapital: number;
    retainedEarnings: number;
    totalEquity: number;
  };
}

export interface IncomeStatementData {
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: {
    salaries: number;
    rent: number;
    marketing: number;
    utilities: number;
    depreciation: number;
    other: number;
    total: number;
  };
  operatingIncome: number;
  otherIncome: number;
  interestExpense: number;
  netIncomeBeforeTax: number;
  incomeTax: number;
  netIncome: number;
}

export interface MessageData {
  message: string;
}

export type StatementData = BalanceSheetData | IncomeStatementData | MessageData | unknown;

export interface GeneratedStatement {
  type: string;
  generatedDate: string;
  periodFrom: string;
  periodTo: string;
  data: StatementData;
}

export const statementTypes = [
  { value: 'balance-sheet', label: 'Balance Sheet' },
  { value: 'income-statement', label: 'Income Statement' },
  { value: 'cash-flow', label: 'Cash Flow Statement' },
  { value: 'equity-changes', label: 'Statement of Changes in Equity' },
  { value: 'comprehensive-package', label: 'Complete Financial Package' },
];
