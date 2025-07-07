
import { Button } from "@/components/ui/button";
import { Building2, Plus, Printer, Download } from "lucide-react";

interface SupplierHeaderProps {
  suppliersCount?: number;
  onPrint?: () => void;
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onNewSupplier?: () => void;
  onCreateSupplier: () => void;
}

export const SupplierHeader = ({ 
  suppliersCount, 
  onPrint, 
  onExportCSV, 
  onExportJSON, 
  onNewSupplier,
  onCreateSupplier
}: SupplierHeaderProps) => {
  const handleCreate = onCreateSupplier || onNewSupplier;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Supplier Management</h1>
        <p className="text-muted-foreground">Manage your suppliers and vendor relationships</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {onPrint && (
          <Button variant="outline" onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        )}
        {onExportCSV && (
          <Button variant="outline" onClick={onExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
        {onExportJSON && (
          <Button variant="outline" onClick={onExportJSON}>
            <Building2 className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        )}
        {handleCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Supplier
          </Button>
        )}
      </div>
    </div>
  );
};
