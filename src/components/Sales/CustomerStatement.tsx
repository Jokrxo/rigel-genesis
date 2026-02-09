import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getCompanyId } from "@/lib/company-auth";
import { format } from "date-fns";
import { Loader2, Printer } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface StatementTransaction {
  id: string;
  date: string;
  type: 'invoice' | 'receipt' | 'credit_note';
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface CustomerStatementProps {
  customerId: string;
  customerName: string;
  customerCode: string;
  address?: string;
  onClose?: () => void;
}

export const CustomerStatement = ({ customerId, customerName, customerCode, address }: CustomerStatementProps) => {
  const [transactions, setTransactions] = useState<StatementTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchStatementData = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = await getCompanyId();
      if (!companyId) return;

      // Fetch Invoices
      const { data: invoices } = await db
        .from('sales_documents')
        .select('*')
        .eq('company_id', companyId)
        .eq('customer_id', customerId)
        .eq('document_type', 'invoice')
        .eq('status', 'posted')
        .gte('issue_date', startDate)
        .lte('issue_date', endDate);

      // Fetch Receipts
      const { data: receipts } = await db
        .from('receipts')
        .select('*')
        .eq('company_id', companyId)
        .eq('customer_id', customerId)
        .gte('receipt_date', startDate)
        .lte('receipt_date', endDate);
        
      // Fetch Credit Notes
      const { data: creditNotes } = await db
        .from('sales_documents')
        .select('*')
        .eq('company_id', companyId)
        .eq('customer_id', customerId)
        .eq('document_type', 'credit_note')
        .eq('status', 'posted')
        .gte('issue_date', startDate)
        .lte('issue_date', endDate);

      const combinedTransactions: StatementTransaction[] = [];

      // Add Invoices
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (invoices || []).forEach((inv: any) => {
        combinedTransactions.push({
          id: inv.id,
          date: inv.issue_date,
          type: 'invoice',
          reference: inv.document_number,
          description: `Invoice #${inv.document_number}`,
          debit: inv.total_amount || 0,
          credit: 0,
          balance: 0
        });
      });

      // Add Receipts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (receipts || []).forEach((rec: any) => {
        combinedTransactions.push({
          id: rec.id,
          date: rec.receipt_date,
          type: 'receipt',
          reference: rec.receipt_number,
          description: `Payment - ${rec.payment_method}`,
          debit: 0,
          credit: rec.amount,
          balance: 0
        });
      });
      
      // Add Credit Notes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (creditNotes || []).forEach((cn: any) => {
        combinedTransactions.push({
          id: cn.id,
          date: cn.issue_date,
          type: 'credit_note',
          reference: cn.document_number,
          description: `Credit Note #${cn.document_number}`,
          debit: 0,
          credit: cn.total_amount || 0,
          balance: 0
        });
      });

      // Sort by date
      combinedTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Fetch opening balance
      const { data: prevInvoices } = await db
        .from('sales_documents')
        .select('total_amount')
        .eq('company_id', companyId)
        .eq('customer_id', customerId)
        .eq('document_type', 'invoice')
        .eq('status', 'posted')
        .lt('issue_date', startDate);
        
      const { data: prevReceipts } = await db
        .from('receipts')
        .select('amount')
        .eq('company_id', companyId)
        .eq('customer_id', customerId)
        .lt('receipt_date', startDate);
        
      const { data: prevCN } = await db
        .from('sales_documents')
        .select('total_amount')
        .eq('company_id', companyId)
        .eq('customer_id', customerId)
        .eq('document_type', 'credit_note')
        .eq('status', 'posted')
        .lt('issue_date', startDate);
        
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prevDebit = (prevInvoices || []).reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prevCredit = (prevReceipts || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0) + 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prevCN || []).reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0);
      
      let runningBalance = prevDebit - prevCredit;
      
      const finalTransactions = [
        {
          id: 'opening',
          date: startDate,
          type: 'invoice' as const,
          reference: '-',
          description: 'Opening Balance',
          debit: runningBalance > 0 ? runningBalance : 0,
          credit: runningBalance < 0 ? Math.abs(runningBalance) : 0,
          balance: runningBalance
        },
        ...combinedTransactions.map(t => {
          runningBalance += (t.debit - t.credit);
          return { ...t, balance: runningBalance };
        })
      ];

      setTransactions(finalTransactions);
    } catch (error) {
      console.error("Error fetching statement:", error);
    } finally {
      setLoading(false);
    }
  }, [customerId, startDate, endDate]);

  useEffect(() => {
    fetchStatementData();
  }, [fetchStatementData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex gap-4 items-center">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2"
          />
          <span>to</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2"
          />
          <Button onClick={fetchStatementData} variant="outline" size="sm">Refresh</Button>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Statement
        </Button>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-2xl font-bold">Customer Statement</CardTitle>
          <div className="text-muted-foreground mt-2">
            Statement Period: {format(new Date(startDate), 'dd MMM yyyy')} - {format(new Date(endDate), 'dd MMM yyyy')}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">To:</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{customerName}</p>
                <p>{customerCode}</p>
                {address && <p className="whitespace-pre-wrap">{address}</p>}
              </div>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-lg mb-2">From:</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">My Company Name</p>
                <p>123 Business Street</p>
                <p>Johannesburg, 2000</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Date</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">
                        {format(new Date(t.date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3">{t.reference}</td>
                      <td className="px-4 py-3">{t.description}</td>
                      <td className="px-4 py-3 text-right">
                        {t.debit > 0 ? formatCurrency(t.debit) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {t.credit > 0 ? formatCurrency(t.credit) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(t.balance)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/20 font-bold">
                    <td colSpan={3} className="px-4 py-3 text-right">Total Outstanding</td>
                    <td className="px-4 py-3 text-right"></td>
                    <td className="px-4 py-3 text-right"></td>
                    <td className="px-4 py-3 text-right text-lg">
                      {transactions.length > 0 ? formatCurrency(transactions[transactions.length - 1].balance) : formatCurrency(0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-8 text-center text-xs text-muted-foreground print:mt-16">
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
