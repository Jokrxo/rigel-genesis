import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Bookmark, Video, HelpCircle } from "lucide-react";

interface Resource {
  title: string;
  description: string;
  type: "pdf" | "video" | "guide";
  icon: React.ReactNode;
  url: string;
}

const resources: Resource[] = [
  {
    title: "Getting Started Guide",
    description: "A comprehensive guide to help you get started with Rigel",
    type: "pdf",
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    url: "/docs/getting-started-guide.pdf"
  },
  {
    title: "Financial Statements Guide",
    description: "Learn how to generate and interpret financial statements",
    type: "pdf",
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    url: "/docs/financial-statements-guide.pdf"
  },
  {
    title: "Tax Calculation Tutorial",
    description: "Step-by-step tutorial on calculating taxes with Rigel",
    type: "pdf",
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    url: "/docs/tax-calculation-tutorial.pdf"
  },
  {
    title: "Asset Management Guide",
    description: "Best practices for managing your business assets",
    type: "pdf",
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    url: "/docs/asset-management-guide.pdf"
  },
  {
    title: "SARS Compliance Checklist",
    description: "Ensure your financial records meet SARS requirements",
    type: "pdf",
    icon: <Bookmark className="h-8 w-8 text-green-500" />,
    url: "/docs/sars-compliance-checklist.pdf"
  },
  {
    title: "VAT Registration Process",
    description: "Step-by-step guide to VAT registration in South Africa",
    type: "pdf",
    icon: <HelpCircle className="h-8 w-8 text-purple-500" />,
    url: "/docs/vat-registration-process.pdf"
  },
  {
    title: "Import Statement Tutorial",
    description: "Learn how to import your bank statements correctly",
    type: "pdf",
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    url: "/docs/import-statement-tutorial.pdf"
  },
  {
    title: "Company Profile Setup Guide",
    description: "Configure your company profile for accurate reporting",
    type: "pdf",
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    url: "/docs/company-profile-setup-guide.pdf"
  }
];

export const HelpResources = () => {
  const handleDownload = (resource: Resource) => {
    // For PDFs and guides, trigger download
    if (resource.type === "pdf" || resource.type === "guide") {
      const link = document.createElement("a");
      link.href = resource.url;
      link.download = resource.title + ".pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Resources & Documentation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {resources.map((resource, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-center mb-4">
                {resource.icon}
              </div>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <CardDescription className="text-justify">{resource.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn btn-primary flex items-center justify-center border rounded px-2 py-1 hover:bg-blue-50"
                style={{ textDecoration: 'none' }}
              >
                View
              </a>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleDownload(resource)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
