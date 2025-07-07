
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Download, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "warning";
  category: "setup" | "security" | "content" | "testing";
}

const checklistItems: ChecklistItem[] = [
  {
    id: "auth-setup",
    title: "Authentication Setup",
    description: "Supabase authentication is configured and working",
    status: "completed",
    category: "setup"
  },
  {
    id: "database-setup",
    title: "Database Configuration",
    description: "All required tables and RLS policies are in place",
    status: "completed",
    category: "setup"
  },
  {
    id: "company-profile",
    title: "Company Profile",
    description: "Complete your company information and branding",
    status: "pending",
    category: "content"
  },
  {
    id: "tax-settings",
    title: "Tax Configuration",
    description: "Configure VAT rates and tax settings for your region",
    status: "warning",
    category: "setup"
  },
  {
    id: "customer-data",
    title: "Customer Information",
    description: "Add your first customers to the system",
    status: "pending",
    category: "content"
  },
  {
    id: "product-catalog",
    title: "Product/Service Catalog",
    description: "Set up your inventory or service offerings",
    status: "pending",
    category: "content"
  },
  {
    id: "bank-integration",
    title: "Bank Statement Import",
    description: "Test importing bank statements",
    status: "pending",
    category: "testing"
  },
  {
    id: "document-templates",
    title: "Document Templates",
    description: "Customize invoice and document templates",
    status: "pending",
    category: "content"
  },
  {
    id: "backup-strategy",
    title: "Data Backup Strategy",
    description: "Understand your data backup and recovery options",
    status: "warning",
    category: "security"
  },
  {
    id: "user-training",
    title: "User Training",
    description: "Ensure all users are trained on the system",
    status: "pending",
    category: "testing"
  }
];

export const LaunchReadinessChecklist = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleItemToggle = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const exportChecklist = () => {
    const checklistData = checklistItems.map(item => ({
      title: item.title,
      description: item.description,
      status: item.status,
      category: item.category,
      completed: checkedItems.has(item.id)
    }));

    const jsonContent = JSON.stringify(checklistData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'launch-readiness-checklist.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Checklist Exported",
      description: "Your launch readiness checklist has been downloaded",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
      case "warning":
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">Attention</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const completedCount = checklistItems.filter(item => item.status === "completed").length;
  const warningCount = checklistItems.filter(item => item.status === "warning").length;
  const progress = (completedCount / checklistItems.length) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Launch Readiness Checklist
            </CardTitle>
            <CardDescription>
              Complete these tasks before going live with your financial system
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportChecklist}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        
        <div className="flex items-center gap-4 pt-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-financial-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
        </div>
        
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">{completedCount} Completed</span>
          <span className="text-yellow-600">{warningCount} Need Attention</span>
          <span className="text-gray-600">{checklistItems.length - completedCount - warningCount} Pending</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <button
                onClick={() => handleItemToggle(item.id)}
                className="mt-0.5"
              >
                {checkedItems.has(item.id) ? (
                  <CheckCircle className="h-5 w-5 text-financial-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{item.title}</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    {getStatusBadge(item.status)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <Badge variant="outline" className="text-xs">
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
