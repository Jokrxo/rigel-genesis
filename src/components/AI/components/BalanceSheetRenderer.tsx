
import { BalanceSheetData } from '../types/financialStatementTypes';

interface BalanceSheetRendererProps {
  data: BalanceSheetData;
}

export const BalanceSheetRenderer = ({ data }: BalanceSheetRendererProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">ASSETS</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Current Assets</h4>
              <div className="space-y-1 ml-4">
                <div className="flex justify-between text-sm">
                  <span>Cash and Cash Equivalents</span>
                  <span>R {data.assets.current.cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Accounts Receivable</span>
                  <span>R {data.assets.current.accountsReceivable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Inventory</span>
                  <span>R {data.assets.current.inventory.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-1 font-medium">
                  <span>Total Current Assets</span>
                  <span>R {data.assets.current.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Non-Current Assets</h4>
              <div className="space-y-1 ml-4">
                <div className="flex justify-between text-sm">
                  <span>Property, Plant & Equipment</span>
                  <span>R {data.assets.nonCurrent.propertyPlantEquipment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Intangible Assets</span>
                  <span>R {data.assets.nonCurrent.intangibleAssets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-1 font-medium">
                  <span>Total Non-Current Assets</span>
                  <span>R {data.assets.nonCurrent.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold">
                <span>TOTAL ASSETS</span>
                <span>R {data.assets.totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">LIABILITIES & EQUITY</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Current Liabilities</h4>
              <div className="space-y-1 ml-4">
                <div className="flex justify-between text-sm">
                  <span>Accounts Payable</span>
                  <span>R {data.liabilities.current.accountsPayable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Short-term Debt</span>
                  <span>R {data.liabilities.current.shortTermDebt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-1 font-medium">
                  <span>Total Current Liabilities</span>
                  <span>R {data.liabilities.current.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Non-Current Liabilities</h4>
              <div className="space-y-1 ml-4">
                <div className="flex justify-between text-sm">
                  <span>Long-term Debt</span>
                  <span>R {data.liabilities.nonCurrent.longTermDebt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-1 font-medium">
                  <span>Total Non-Current Liabilities</span>
                  <span>R {data.liabilities.nonCurrent.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Equity</h4>
              <div className="space-y-1 ml-4">
                <div className="flex justify-between text-sm">
                  <span>Share Capital</span>
                  <span>R {data.equity.shareCapital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Retained Earnings</span>
                  <span>R {data.equity.retainedEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-1 font-medium">
                  <span>Total Equity</span>
                  <span>R {data.equity.totalEquity.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span>R {(data.liabilities.totalLiabilities + data.equity.totalEquity).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
