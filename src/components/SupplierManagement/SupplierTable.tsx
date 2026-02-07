
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { PermissionGuard } from "@/components/Shared/PermissionGuard";

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  vat_number?: string;
  payment_terms?: number;
  status: string;
}

interface SupplierTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const SupplierTable = ({ suppliers, loading, onView, onEdit, onDelete }: SupplierTableProps) => {
  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusColors = {
      active: "default" as const,
      inactive: "secondary" as const,
      blocked: "destructive" as const,
    };
    return statusColors[status as keyof typeof statusColors] || "default";
  };

  return (
    <div className="overflow-x-auto">
      <Table id="suppliers-table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>VAT Number</TableHead>
            <TableHead>Payment Terms</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="no-print">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Loading suppliers...
              </TableCell>
            </TableRow>
          ) : suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No suppliers found
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.company || "-"}</TableCell>
                <TableCell>{supplier.email || "-"}</TableCell>
                <TableCell>{supplier.phone || "-"}</TableCell>
                <TableCell>{supplier.vat_number || "-"}</TableCell>
                <TableCell>{supplier.payment_terms ? `${supplier.payment_terms} days` : "-"}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadge(supplier.status)}>
                    {supplier.status}
                  </Badge>
                </TableCell>
                <TableCell className="no-print">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="View"
                      onClick={() => onView(supplier)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <PermissionGuard action="edit" resource="suppliers">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Edit"
                        onClick={() => onEdit(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard action="delete" resource="suppliers">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete"
                        onClick={() => onDelete(supplier)}
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
