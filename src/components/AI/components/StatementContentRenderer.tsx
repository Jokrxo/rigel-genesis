
import { GeneratedStatement, statementTypes } from '../types/financialStatementTypes';
import { isBalanceSheetData, isIncomeStatementData } from '../utils/typeGuards';
import { BalanceSheetRenderer } from './BalanceSheetRenderer';
import { IncomeStatementRenderer } from './IncomeStatementRenderer';

interface StatementContentRendererProps {
  statement: GeneratedStatement;
}

export const StatementContentRenderer = ({ statement }: StatementContentRendererProps) => {
  const { type, data } = statement;

  switch (type) {
    case 'balance-sheet':
      if (!isBalanceSheetData(data)) {
        return <div>Invalid balance sheet data.</div>;
      }
      return <BalanceSheetRenderer data={data} />;
    
    case 'income-statement':
      if (!isIncomeStatementData(data)) {
        return <div>Invalid income statement data.</div>;
      }
      return <IncomeStatementRenderer data={data} />;
    
    default:
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Statement generated successfully.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This statement type is being enhanced. More detailed formatting will be available soon.
          </p>
        </div>
      );
  }
};
