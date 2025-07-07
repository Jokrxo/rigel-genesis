import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileText, BarChart3, TrendingUp, Receipt } from "lucide-react";

const summaryFeatures = [
  {
    icon: Bot,
    title: "Smart Financial Assistant",
    description:
      "Ask detailed questions about South African tax, VAT, and SARS compliance. Get immediate expert guidance for your business.",
  },
  {
    icon: FileText,
    title: "Document Generation",
    description:
      "Automatically generate invoices, quotes, statements, and other essential documents using AI-powered templates.",
  },
  {
    icon: Receipt,
    title: "Statement Processing",
    description:
      "Upload PDF or Excel bank statements and let Rigel categorize, analyze, and extract key data for you.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description:
      "Unlock insights into future income, expenses, and business performance using AI-driven forecasting.",
  },
  {
    icon: BarChart3,
    title: "AI Financial Statements",
    description:
      "Generate professional financial statements and business reports at the click of a button, with advanced analysis.",
  },
];

const AIFeatures = () => {
  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-2">AI-Powered Features</h1>
        <p className="text-muted-foreground mb-6">
          Discover how Rigel leverages advanced artificial intelligence to streamline your business finances and compliance.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {summaryFeatures.map((feature, idx) => (
            <Card key={feature.title}>
              <CardHeader className="flex flex-row items-center gap-3 pb-1">
                <feature.icon className="h-6 w-6 text-blue-700" />
                <CardTitle className="text-md font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Interested in using these features? Please contact support for access.
        </div>
      </div>
    </MainLayout>
  );
};

export default AIFeatures;
