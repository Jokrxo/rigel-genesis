
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import React from "react";

interface Transaction {
  id: string;
  statement_id: string;
  user_id: string;
  date: string | null;
  amount: number | null;
  description: string | null;
  type: string | null;
  category: string | null;
  metadata?: any;
}

function getTransactionIcon(type: string) {
  switch (type) {
    case "income":
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    case "expense":
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    case "transfer":
      return <ArrowLeftRight className="h-4 w-4 text-blue-600" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
}

function getTransactionBadge(type: string) {
  switch (type) {
    case "income":
      return <Badge className="bg-green-100 text-green-800">Income</Badge>;
    case "expense":
      return <Badge className="bg-red-100 text-red-800">Expense</Badge>;
    case "transfer":
      return <Badge className="bg-blue-100 text-blue-800">Transfer</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

export function TransactionsTable({
  transactions,
  loading,
}: {
  transactions: Transaction[];
  loading: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading transactions...
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.date ? format(new Date(transaction.date), "dd MMM yyyy") : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type || "")}
                    {getTransactionBadge(transaction.type || "")}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {transaction.description || "-"}
                </TableCell>
                <TableCell>{transaction.category || "-"}</TableCell>
                <TableCell>
                  {transaction.metadata?.party_type ? (
                    <Badge variant="outline">{transaction.metadata.party_type}</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell
                  className={`font-medium ${
                    (transaction.amount || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  R{Math.abs(transaction.amount || 0).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
