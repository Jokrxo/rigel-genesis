
import { StatementData, BalanceSheetData, IncomeStatementData } from '../types/financialStatementTypes';

export function isBalanceSheetData(data: StatementData): data is BalanceSheetData {
  return (
    typeof data === "object" &&
    data !== null &&
    "assets" in data &&
    "liabilities" in data &&
    "equity" in data
  );
}

export function isIncomeStatementData(data: StatementData): data is IncomeStatementData {
  return (
    typeof data === "object" &&
    data !== null &&
    "revenue" in data &&
    "costOfSales" in data &&
    "grossProfit" in data &&
    "operatingExpenses" in data &&
    "operatingIncome" in data &&
    "interestExpense" in data &&
    "incomeTax" in data &&
    "netIncome" in data
  );
}
