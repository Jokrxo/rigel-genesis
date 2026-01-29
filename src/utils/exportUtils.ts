
import { format } from "date-fns";

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export const exportToCSV = (data: ExportData) => {
  try {
    const csvContent = [
      data.headers.join(","),
      ...data.rows.map(row => 
        row.map(cell => {
          // Handle values that might contain commas or quotes
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", data.filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('CSV export failed:', error);
    throw error;
  }
};

export const exportToJSON = (data: unknown, filename: string) => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('JSON export failed:', error);
    throw error;
  }
};

export const exportToPDF = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error('Element not found for PDF export');
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000;
              background: white;
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .print-date { 
              text-align: right; 
              margin-bottom: 20px; 
              color: #666; 
              font-size: 12px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            .no-print { 
              display: none !important; 
            }
            button { 
              display: none !important; 
            }
            .print\\:hidden {
              display: none !important;
            }
            @media print {
              body { margin: 0; }
              .print-only { display: block; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Rigel Financial Report</h1>
            <h2>${filename.replace('.pdf', '').replace(/[-_]/g, ' ')}</h2>
          </div>
          <div class="print-date">
            Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
          </div>
          <div class="content">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Close window after a delay to allow printing
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd');
};
