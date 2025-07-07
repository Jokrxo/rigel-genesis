
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, exportToJSON, exportToPDF, ExportData } from "@/utils/exportUtils";

interface ExportControlsProps {
  data: unknown;
  filename: string;
  csvData?: ExportData;
  elementId?: string;
}

export const ExportControls = ({ data, filename, csvData, elementId }: ExportControlsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleCSVExport = () => {
    try {
      if (csvData) {
        exportToCSV(csvData);
      } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        // Fallback: convert data to CSV format
        const headers = Object.keys(data[0] as Record<string, unknown>);
        const rows = data.map((item) => {
          const record = item as Record<string, unknown>;
          return headers.map(header => {
            const value = record[header];
            return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
          });
        });
        exportToCSV({
          headers,
          rows,
          filename: `${filename}.csv`
        });
      } else {
        throw new Error('Data is not in a valid format for CSV export');
      }
      toast({
        title: "Export Successful",
        description: `Data exported as CSV file`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export CSV file",
        variant: "destructive",
      });
    }
  };

  const handleJSONExport = () => {
    try {
      exportToJSON(data, `${filename}.json`);
      toast({
        title: "Export Successful",
        description: `Data exported as JSON file`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export JSON file",
        variant: "destructive",
      });
    }
  };

  const handlePDFExport = async () => {
    if (!elementId) {
      toast({
        title: "Export Failed",
        description: "PDF export not available for this component",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(elementId, `${filename}.pdf`);
      toast({
        title: "Export Successful",
        description: `Report opened in print dialog`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export PDF file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "Use your browser's print function to print this page",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSVExport}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleJSONExport}>
          <FileText className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        {elementId && (
          <DropdownMenuItem onClick={handlePDFExport}>
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
