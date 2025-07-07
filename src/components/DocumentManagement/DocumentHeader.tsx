
import { Button } from "@/components/ui/button";
import { FileText, Plus, Printer, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentHeaderProps {
  documentsCount?: number;
  onPrint?: () => void;
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onNewDocument?: () => void;
  onCreateDocument: () => void;
  onDocumentTypeChange: (value: string) => void;
  selectedDocumentType: string;
}

export const DocumentHeader = ({ 
  documentsCount, 
  onPrint, 
  onExportCSV, 
  onExportJSON, 
  onNewDocument,
  onCreateDocument,
  onDocumentTypeChange,
  selectedDocumentType
}: DocumentHeaderProps) => {
  const handleCreate = onCreateDocument || onNewDocument;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Document Management</h1>
        <p className="text-muted-foreground">Create and manage invoices, quotes, and other documents</p>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <Select value={selectedDocumentType} onValueChange={onDocumentTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="quotation">Quotation</SelectItem>
            <SelectItem value="receipt">Receipt</SelectItem>
            <SelectItem value="credit_note">Credit Note</SelectItem>
          </SelectContent>
        </Select>
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
            <FileText className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        )}
        {handleCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        )}
      </div>
    </div>
  );
};
