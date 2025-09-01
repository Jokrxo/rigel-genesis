import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Users, 
  Package, 
  Building, 
  Calculator, 
  BarChart3, 
  Bot, 
  Shield, 
  Truck,
  CreditCard,
  TrendingUp,
  Download,
  Check
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Document Management",
    description: "Create invoices, quotations, and business documents with professional templates",
    benefits: ["Invoice generation", "Quote creation", "Document templates", "PDF export"],
    category: "Core"
  },
  {
    icon: Users,
    title: "Customer Management",
    description: "Manage customer relationships, track payment terms, and maintain detailed records",
    benefits: ["Customer database", "Payment tracking", "Contact management", "Credit limits"],
    category: "Core"
  },
  {
    icon: Truck,
    title: "Supplier Management",
    description: "Track suppliers, manage purchase orders, and monitor supplier performance",
    benefits: ["Supplier database", "Purchase orders", "Payment terms", "Performance tracking"],
    category: "Core"
  },
  {
    icon: Package,
    title: "Inventory Control",
    description: "Monitor stock levels, track product movements, and manage inventory efficiently",
    benefits: ["Stock tracking", "Low stock alerts", "Product catalog", "Inventory reports"],
    category: "Core"
  },
  {
    icon: Building,
    title: "Asset Management",
    description: "Track business assets, monitor depreciation, and maintain asset registers",
    benefits: ["Asset register", "Depreciation tracking", "Asset valuation", "Maintenance logs"],
    category: "Advanced"
  },
  {
    icon: Calculator,
    title: "Tax Calculators",
    description: "Calculate VAT, income tax, and other South African tax obligations accurately",
    benefits: ["VAT calculations", "Income tax", "PAYE calculator", "Tax compliance"],
    category: "Core"
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    description: "Generate comprehensive financial statements and business performance reports",
    benefits: ["P&L statements", "Balance sheets", "Cash flow", "Custom reports"],
    category: "Advanced"
  },
  {
    icon: CreditCard,
    title: "Bank Statement Processing",
    description: "Upload and automatically categorize bank statements for faster reconciliation",
    benefits: ["Automatic categorization", "Transaction matching", "Reconciliation", "Multi-bank support"],
    category: "Core"
  },
  {
    icon: TrendingUp,
    title: "Director Transactions",
    description: "Track director loans, dividend payments, and related party transactions",
    benefits: ["Director loans", "Dividend tracking", "Related parties", "Compliance reports"],
    category: "Advanced"
  },
  {
    icon: Bot,
    title: "AI-Powered Features",
    description: "Leverage artificial intelligence for smarter financial insights and automation",
    benefits: ["Smart categorization", "Predictive analytics", "AI assistant", "Document generation"],
    category: "Premium"
  },
  {
    icon: Shield,
    title: "SARS Compliance",
    description: "Stay compliant with South African Revenue Service requirements and regulations",
    benefits: ["SARS reporting", "Tax submissions", "Compliance alerts", "Audit trails"],
    category: "Advanced"
  },
  {
    icon: Download,
    title: "Data Export & Import",
    description: "Export data to various formats and import from existing systems seamlessly",
    benefits: ["CSV export", "PDF reports", "Data import", "System integration"],
    category: "Core"
  }
];

const Features = () => {
  const coreFeatures = features.filter(f => f.category === "Core");
  const advancedFeatures = features.filter(f => f.category === "Advanced");
  const premiumFeatures = features.filter(f => f.category === "Premium");

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Powerful Features for Your Business</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Rigel provides comprehensive financial management tools designed specifically for South African businesses
          </p>
        </div>

        {/* Core Features */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Core Features</h2>
            <p className="text-muted-foreground">Essential tools for every business</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="secondary">{feature.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{feature.description}</CardDescription>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Advanced Features */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Advanced Features</h2>
            <p className="text-muted-foreground">Professional tools for growing businesses</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {advancedFeatures.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                      <feature.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="outline">{feature.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{feature.description}</CardDescription>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Premium Features */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Premium Features</h2>
            <p className="text-muted-foreground">AI-powered tools for the future of finance</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {premiumFeatures.map((feature) => (
              <Card key={feature.title} className="h-full border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                      <feature.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">{feature.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{feature.description}</CardDescription>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of South African businesses already using Rigel to manage their finances
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Features;