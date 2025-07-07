
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

interface Document {
  id: string;
  document_number: string;
  document_type: string;
  customer_name?: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface DocumentTableProps {
  documents: Document[];
  loading: boolean;
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
}

export const DocumentTable = ({ documents, loading, onEdit, onDelete }: DocumentTableProps) => {
  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusColors = {
      draft: "secondary" as const,
      sent: "default" as const,
      paid: "default" as const,
      overdue: "destructive" as const,
    };
    return statusColors[status as keyof typeof statusColors] || "secondary";
  };

  return (
    <div className="overflow-x-auto">
      <Table id="documents-table">
        <TableHeader>
          <TableRow>
            <TableHead>Document #</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="no-print">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Loading documents...
              </TableCell>
            </TableRow>
          ) : documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No documents found
              </TableCell>
            </TableRow>
          ) : (
            documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">{document.document_number}</TableCell>
                <TableCell className="capitalize">{document.document_type}</TableCell>
                <TableCell>{document.customer_name || "-"}</TableCell>
                <TableCell>R {document.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadge(document.status)}>
                    {document.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(document.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="no-print">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Edit"
                      onClick={() => onEdit(document)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Delete"
                      onClick={() => onDelete(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
