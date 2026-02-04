
import { MainLayout } from "@/components/Layout/MainLayout";
import { FinancialOverview } from "@/components/Dashboard/FinancialOverview";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { SystemHealthCheck } from "@/components/Dashboard/SystemHealthCheck";
import { DataDashboard } from "@/components/Dashboard/DataDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  FileText, 
  Users, 
  Package, 
  Calculator,
  Building,
  FileBarChart,
  Upload,
  Building2,
  Truck,
  FolderOpen,
  DollarSign,
  UserCheck,
  ScrollText,
  UserCog,
  TrendingUp,
  PiggyBank
} from "lucide-react";
import { Link } from "react-router-dom";
import { Chatbot } from "@/components/Shared/Chatbot";
 

const Dashboard = () => {
  const quickActions = [
    {
      title: "Import Statements",
      description: "Upload and process bank statements",
      icon: Upload,
      href: "/import-statement",
      color: "bg-info"
    },
    {
      title: "Generate Documents",
      description: "Create invoices, quotes, and reports",
      icon: FileText,
      href: "/documents",
      color: "bg-success"
    },
    {
      title: "Manage Customers",
      description: "Add and manage customer information",
      icon: Users,
      href: "/customers",
      color: "bg-secondary"
    },
    {
      title: "Manage Suppliers",
      description: "Add and manage supplier information",
      icon: Truck,
      href: "/suppliers",
      color: "bg-warning"
    },
    {
      title: "Inventory",
      description: "Track products and stock levels",
      icon: Package,
      href: "/inventory?type=inventory",
      color: "bg-accent"
    },
    {
      title: "Services",
      description: "Manage service offerings",
      icon: FileText,
      href: "/inventory?type=service",
      color: "bg-info"
    },
    {
      title: "Director Transactions",
      description: "Manage director loans and transactions",
      icon: UserCheck,
      href: "/director-transactions",
      color: "bg-primary"
    },
    {
      title: "Assets",
      description: "Monitor business assets and depreciation",
      icon: Building,
      href: "/asset-management",
      color: "bg-muted"
    },
    {
      title: "Tax Calculators",
      description: "Calculate VAT, income tax, and deferred tax",
      icon: Calculator,
      href: "/tax-calculators",
      color: "bg-destructive"
    },
    {
      title: "Financial Reports",
      description: "Generate comprehensive business reports",
      icon: FileBarChart,
      href: "/reports",
      color: "bg-primary"
    },
    {
      title: "AI Features",
      description: "Leverage AI for financial insights",
      icon: Building2,
      href: "/ai-features",
      color: "bg-secondary"
    },
  ];

  const masterRecords = [
    {
      title: "Project Management",
      description: "Track and manage business projects",
      icon: FolderOpen,
      href: "/projects",
      color: "bg-muted"
    },
    {
      title: "Bank Movements",
      description: "Monitor bank balance movements",
      icon: DollarSign,
      href: "/bank-movements",
      color: "bg-info"
    },
  ];

  const advancedFeatures = [
    {
      title: "Loan Management",
      description: "Manage loans and repayment schedules",
      icon: ScrollText,
      href: "/loan-management",
      color: "bg-secondary"
    },
    {
      title: "Employee Management",
      description: "Manage payroll and employee records",
      icon: UserCog,
      href: "/employee-management",
      color: "bg-accent"
    },
    {
      title: "Investments",
      description: "Track investment portfolios and returns",
      icon: TrendingUp,
      href: "/investments",
      color: "bg-warning"
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Monitor your business performance and access key financial tools
          </p>
        </div>

        <div className="space-y-6">
          <FinancialOverview />
        </div>

        {/* Data Dashboard - Customer, Product, Document Stats */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Business Overview</h2>
            <DataDashboard />
          </div>
        </div>

        {/* Master Records Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Master Records</h2>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {masterRecords.map((action, index) => (
                <Card key={index} className="hover:shadow-lg hover:border-primary/20 transition-all duration-300 border border-border/50 shadow-sm bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`${action.color} ${action.color.replace('bg-', 'text-')}-foreground p-2 rounded-lg shadow-sm`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {action.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs leading-relaxed mb-4">
                      {action.description}
                    </CardDescription>
                    <Link to={action.href}>
                      <Button variant="outline" size="sm" className="w-full h-8">
                        Open
                        <ArrowUpRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-lg hover:border-primary/20 transition-all duration-300 border border-border/50 shadow-sm bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`${action.color} ${action.color.replace('bg-', 'text-')}-foreground p-2 rounded-lg shadow-sm`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {action.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs leading-relaxed mb-4">
                      {action.description}
                    </CardDescription>
                    <Link to={action.href}>
                      <Button variant="outline" size="sm" className="w-full h-8">
                        Open
                        <ArrowUpRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Features Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Advanced Features</h2>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {advancedFeatures.map((action, index) => (
                <Card key={index} className="hover:shadow-lg hover:border-primary/20 transition-all duration-300 border border-border/50 shadow-sm bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`${action.color} ${action.color.replace('bg-', 'text-')}-foreground p-2 rounded-lg shadow-sm`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {action.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs leading-relaxed mb-4">
                      {action.description}
                    </CardDescription>
                    <Link to={action.href}>
                      <Button variant="outline" size="sm" className="w-full h-8">
                        Open
                        <ArrowUpRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SystemHealthCheck />
          <RecentActivity />
        </div>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default Dashboard;
