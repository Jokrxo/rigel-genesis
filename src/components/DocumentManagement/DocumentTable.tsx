
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Send } from "lucide-react";

import { PermissionGuard } from "@/components/Shared/PermissionGuard";

export interface TableDocument {
  id: string;
  document_number: string;
  document_type: string;
  customer_name?: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface DocumentTableProps {
  documents: TableDocument[];
  loading: boolean;
  onEdit: (document: TableDocument) => void;
  onDelete: (id: string) => void;
  onPost?: (document: TableDocument) => void;
}

export const DocumentTable = ({ documents, loading, onEdit, onDelete, onPost }: DocumentTableProps) => {
  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusColors = {
      draft: "secondary" as const,
      sent: "default" as const,
      paid: "default" as const,
      overdue: "destructive" as const,
    };
    return statusColors[status as keyof typeof statusColors] || "secondary";
  };

  const getResourceName = (docType: string) => {
    switch (docType) {
      case 'invoice': return 'invoices';
      case 'quotation': return 'quotes';
      case 'credit_note': return 'credit_notes';
      case 'receipt': return 'invoices'; // Map receipt to invoices for now
      default: return 'invoices';
    }
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
                    {document.status === 'draft' && onPost && (
                      <PermissionGuard action="create" resource={getResourceName(document.document_type)}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Post / Send"
                          onClick={() => onPost(document)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                    )}
                    <Button variant="ghost" size="icon" title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <PermissionGuard action="edit" resource={getResourceName(document.document_type)}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Edit"
                        onClick={() => onEdit(document)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard action="delete" resource={getResourceName(document.document_type)}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete"
                        onClick={() => onDelete(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
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
