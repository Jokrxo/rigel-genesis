
import { MainLayout } from "@/components/Layout/MainLayout";
import { FinancialOverview } from "@/components/Dashboard/FinancialOverview";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
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
      color: "bg-blue-500"
    },
    {
      title: "Generate Documents",
      description: "Create invoices, quotes, and reports",
      icon: FileText,
      href: "/documents",
      color: "bg-green-500"
    },
    {
      title: "Manage Customers",
      description: "Add and manage customer information",
      icon: Users,
      href: "/customers",
      color: "bg-purple-500"
    },
    {
      title: "Manage Suppliers",
      description: "Add and manage supplier information",
      icon: Truck,
      href: "/suppliers",
      color: "bg-yellow-500"
    },
    {
      title: "Inventory Control",
      description: "Track products and stock levels",
      icon: Package,
      href: "/inventory",
      color: "bg-orange-500"
    },
    {
      title: "Director Transactions",
      description: "Manage director loans and transactions",
      icon: UserCheck,
      href: "/director-transactions",
      color: "bg-emerald-500"
    },
    {
      title: "Asset Management",
      description: "Monitor business assets and depreciation",
      icon: Building,
      href: "/asset-management",
      color: "bg-teal-500"
    },
    {
      title: "Tax Calculators",
      description: "Calculate VAT, income tax, and deferred tax",
      icon: Calculator,
      href: "/tax-calculators",
      color: "bg-red-500"
    },
    {
      title: "Financial Reports",
      description: "Generate comprehensive business reports",
      icon: FileBarChart,
      href: "/reports",
      color: "bg-indigo-500"
    },
    {
      title: "AI Features",
      description: "Leverage AI for financial insights",
      icon: Building2,
      href: "/ai-features",
      color: "bg-pink-500"
    },
  ];

  const masterRecords = [
    {
      title: "Project Management",
      description: "Track and manage business projects",
      icon: FolderOpen,
      href: "/projects",
      color: "bg-slate-500"
    },
    {
      title: "Bank Movements",
      description: "Monitor bank balance movements",
      icon: DollarSign,
      href: "/bank-movements",
      color: "bg-cyan-500"
    },
  ];

  const advancedFeatures = [
    {
      title: "Loan Management",
      description: "Manage loans and repayment schedules",
      icon: ScrollText,
      href: "/loan-management",
      color: "bg-violet-500"
    },
    {
      title: "Employee Management",
      description: "Manage payroll and employee records",
      icon: UserCog,
      href: "/employee-management",
      color: "bg-rose-500"
    },
    {
      title: "Investments",
      description: "Track investment portfolios and returns",
      icon: TrendingUp,
      href: "/investments",
      color: "bg-amber-500"
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

        {/* Master Records Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Master Records</h2>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {masterRecords.map((action, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-200 border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`${action.color} p-2 rounded-lg text-white`}>
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
                <Card key={index} className="hover:shadow-md transition-shadow duration-200 border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`${action.color} p-2 rounded-lg text-white`}>
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
                <Card key={index} className="hover:shadow-md transition-shadow duration-200 border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`${action.color} p-2 rounded-lg text-white`}>
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
          <RecentActivity />
        </div>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default Dashboard;
