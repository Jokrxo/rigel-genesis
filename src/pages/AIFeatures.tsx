import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileText, BarChart3, TrendingUp, Receipt, ArrowRight, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PredictiveAnalytics } from "@/components/AI/PredictiveAnalytics";
import { SmartDocumentGenerator } from "@/components/AI/SmartDocumentGenerator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Chatbot } from "@/components/Shared/Chatbot";

const summaryFeatures = [
  {
    icon: Bot,
    title: "Smart Financial Assistant",
    description:
      "Ask detailed questions about South African tax, VAT, and SARS compliance. Get immediate expert guidance for your business.",
    action: "assistant",
    link: null
  },
  {
    icon: FileText,
    title: "Document Generation",
    description:
      "Automatically generate invoices, quotes, statements, and other essential documents using AI-powered templates.",
    action: "documents",
    link: null
  },
  {
    icon: Receipt,
    title: "Statement Processing",
    description:
      "Upload PDF or Excel bank statements and let Rigel categorize, analyze, and extract key data for you.",
    action: null,
    link: "/import-statement"
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description:
      "Unlock insights into future income, expenses, and business performance using AI-driven forecasting.",
    action: "predictive",
    link: null
  },
  {
    icon: BarChart3,
    title: "AI Financial Statements",
    description:
      "Generate professional financial statements and business reports at the click of a button, with advanced analysis.",
    action: null,
    link: "/financial-analysis"
  },
];

const AIFeatures = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto py-8 px-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI-Powered Features</h1>
          <p className="text-muted-foreground">
            Leverage advanced artificial intelligence to streamline your business finances and compliance.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
            <TabsTrigger value="documents">Generator</TabsTrigger>
            <TabsTrigger value="assistant">Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summaryFeatures.map((feature, idx) => (
                <Card key={feature.title} className="flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-md font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between gap-4">
                    <CardDescription>{feature.description}</CardDescription>
                    {feature.link ? (
                      <Button variant="outline" className="w-full gap-2" onClick={() => navigate(feature.link!)}>
                        Open Module <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        className="w-full gap-2"
                        onClick={() => {
                          const trigger = document.querySelector(`[value="${feature.action}"]`) as HTMLElement;
                          if (trigger) trigger.click();
                        }}
                      >
                        Try Now <Sparkles className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictive" className="mt-6">
            <PredictiveAnalytics />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <SmartDocumentGenerator />
          </TabsContent>

          <TabsContent value="assistant" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Financial Assistant
                </CardTitle>
                <CardDescription>
                  Your personal expert for tax, compliance, and financial advice.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">How it works</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our AI assistant is trained on South African financial regulations, IFRS standards, and tax laws.
                      It can help you with:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                      <li>Understanding complex tax requirements</li>
                      <li>Navigating the application features</li>
                      <li>Analyzing your financial data in real-time</li>
                      <li>Providing strategic business advice</li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Try asking:
                    </h4>
                    <div className="space-y-3">
                      {[
                        "What is my current bank balance?",
                        "How do I register for VAT?",
                        "Analyze my profitability for this quarter.",
                        "Explain IFRS requirements for small businesses.",
                        "Show me my top expenses."
                      ].map((question, i) => (
                        <div key={i} className="bg-background p-3 rounded-lg text-sm shadow-sm border border-border/50">
                          "{question}"
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center pt-4">
                   <p className="text-sm text-muted-foreground">
                     Click the <Sparkles className="inline h-4 w-4 text-primary" /> icon in the bottom right corner to start chatting.
                   </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Chatbot />
      </div>
    </MainLayout>
  );
};

export default AIFeatures;
