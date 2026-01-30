
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ExportData = () => {
  const navigate = useNavigate();

  const exportOptions = [
    {
      title: "Financial Reports",
      description: "Export Balance Sheet, Income Statement, and Cash Flow Statement.",
      icon: FileText,
      format: "PDF, CSV",
      action: () => navigate("/reports"),
      buttonText: "Go to Reports"
    },
    {
      title: "Transaction History",
      description: "Download a complete log of all processed transactions.",
      icon: Table,
      format: "CSV, Excel",
      action: () => navigate("/reports/transactions"), // Assuming this exists or falls back to reports
      buttonText: "Export Transactions"
    },
    {
      title: "Customer Data",
      description: "Export your full customer database including contact details and balances.",
      icon: FileSpreadsheet,
      format: "CSV",
      action: () => navigate("/customers"),
      buttonText: "Manage Customers"
    },
    {
      title: "Supplier Data",
      description: "Export supplier lists, payment terms, and purchase history.",
      icon: FileSpreadsheet,
      format: "CSV",
      action: () => navigate("/suppliers"),
      buttonText: "Manage Suppliers"
    }
  ];

  return (
    <MainLayout>
      <div className="container max-w-5xl mx-auto space-y-8 py-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Data Export Center</h1>
          <p className="text-muted-foreground max-w-2xl">
            Securely export your business data for external analysis, backups, or regulatory compliance. 
            Select a category below to proceed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exportOptions.map((option, index) => (
            <Card key={index} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <option.icon className="h-5 w-5 text-primary" />
                  </div>
                  {option.title}
                </CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium text-foreground mr-2">Available Formats:</span>
                  {option.format}
                </div>
                <Button onClick={option.action} className="w-full sm:w-auto" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  {option.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Need a custom data dump?</CardTitle>
            <CardDescription>
              For full database backups or specific data requests not listed here, please contact our support team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" onClick={() => navigate("/contact")} className="px-0">
              Contact Support &rarr;
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ExportData;
