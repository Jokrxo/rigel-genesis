
import { IncomeStatementData } from '../types/financialStatementTypes';

interface IncomeStatementRendererProps {
  data: IncomeStatementData;
}

export const IncomeStatementRenderer = ({ data }: IncomeStatementRendererProps) => {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Revenue</span>
          <span className="font-semibold">R {data.revenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Cost of Sales</span>
          <span>R ({data.costOfSales.toLocaleString()})</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-medium">
          <span>Gross Profit</span>
          <span>R {data.grossProfit.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Operating Expenses</h4>
        <div className="ml-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Salaries & Benefits</span>
            <span>R ({data.operatingExpenses.salaries.toLocaleString()})</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Rent</span>
            <span>R ({data.operatingExpenses.rent.toLocaleString()})</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Marketing</span>
            <span>R ({data.operatingExpenses.marketing.toLocaleString()})</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Depreciation</span>
            <span>R ({data.operatingExpenses.depreciation.toLocaleString()})</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-2 space-y-2">
        <div className="flex justify-between font-medium">
          <span>Operating Income</span>
          <span>R {data.operatingIncome.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Interest Expense</span>
          <span>R ({data.interestExpense.toLocaleString()})</span>
        </div>
        <div className="flex justify-between">
          <span>Income Tax</span>
          <span>R ({data.incomeTax.toLocaleString()})</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-bold text-lg">
          <span>Net Income</span>
          <span className="text-green-600">R {data.netIncome.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
