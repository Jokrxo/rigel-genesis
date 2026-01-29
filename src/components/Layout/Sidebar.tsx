import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Users,
  Package,
  Truck,
  Building2,
  Calculator,
  BarChart3,
  Settings,
  HelpCircle,
  User,
  QrCode,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  UserCheck,
  CreditCard,
  Briefcase,
  Target,
  PiggyBank,
  ChevronDown,
  ChevronRight,
  Calendar,
  BookOpen,
  Sparkles,
  DollarSign,
  Wrench,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import rigelFullLogo from "@/assets/rigel-full-logo.jpg";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tools & Support",
    icon: Wrench,
    children: [
      {
        title: "Tools Overview",
        href: "/tools-support",
        icon: Wrench,
      },
      {
        title: "Community",
        href: "/community",
        icon: Users,
      },
      {
        title: "Help Center",
        href: "/help",
        icon: HelpCircle,
      },
      {
        title: "Tax Calculators",
        href: "/tax-calculators",
        icon: Calculator,
      },
      {
        title: "Impairment Check",
        href: "/impairment",
        icon: TrendingDown,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "Profile",
        icon: User,
        children: [
          {
            title: "Sign-up Wizard",
            href: "/signup-wizard",
            icon: FolderOpen,
          },
          {
            title: "Import Statement",
            href: "/import-statement",
            icon: Upload,
          },
          {
            title: "Company Profile",
            href: "/company-profile",
            icon: Building2,
          },
        ],
      },
      {
        title: "QR Code",
        href: "/qr-code",
        icon: QrCode,
      },
      {
        title: "Help",
        href: "/help",
        icon: HelpCircle,
      },
      {
        title: "App Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "Financial Reports",
    icon: BarChart3,
    children: [
      {
        title: "Financial Dashboard",
        icon: LayoutDashboard,
        children: [
          {
            title: "Bank Balance Movement",
            href: "/bank-movements",
            icon: TrendingUp,
          },
          {
            title: "Tax Dashboard",
            href: "/tax-dashboard",
            icon: LayoutDashboard,
          },
          {
            title: "Financial Analysis",
            href: "/financial-analysis",
            icon: TrendingUp,
          },
        ],
      },
      {
        title: "Reports Summary",
        href: "/reports",
        icon: FileText,
      },
      {
        title: "Balance Sheet",
        href: "/reports/balance-sheet",
        icon: FileText,
      },
      {
        title: "Income Statement",
        href: "/reports/income-statement",
        icon: FileText,
      },
      {
        title: "Cash Flow Statement",
        href: "/reports/cash-flow",
        icon: FileText,
      },
      {
        title: "Statement of Changes in Equity",
        href: "/reports/equity",
        icon: FileText,
      },
      {
        title: "Notes to Financial Statements",
        href: "/reports/notes",
        icon: FileText,
      },
      {
        title: "Trial Balance",
        href: "/trial-balance",
        icon: BarChart3,
      },
      {
        title: "General Ledger",
        icon: BookOpen,
        children: [
          {
            title: "Ledger Posting",
            href: "/general-ledger/posting",
            icon: FileText,
          },
        ],
      },
      {
        title: "Tax Management",
        icon: Calculator,
        children: [
          {
            title: "Tax Calculators",
            href: "/tax-calculators",
            icon: Calculator,
          },
        ],
      },
      {
        title: "Transaction Processing",
        icon: CreditCard,
        children: [
          {
            title: "Supplier Management",
            href: "/suppliers",
            icon: Truck,
          },
          {
            title: "Revenue",
            icon: DollarSign,
            children: [
              {
                title: "Customer Management",
                href: "/customers",
                icon: Users,
              },
              {
                title: "Document Management",
                href: "/documents",
                icon: FileText,
              },
            ],
          },
          {
            title: "Asset Management",
            icon: Building2,
            children: [
                {
                    title: "Assets List",
                    href: "/asset-management",
                    icon: Building2,
                },
                {
                    title: "Impairment",
                    href: "/impairment",
                    icon: TrendingDown,
                }
            ]
          },
          {
            title: "Loan Management",
            href: "/loan-management",
            icon: CreditCard,
          },
          {
            title: "Investments",
            href: "/investments",
            icon: PiggyBank,
          },
          {
            title: "Payroll",
            icon: Briefcase,
            children: [
              {
                title: "Employee Management",
                href: "/employee-management",
                icon: Briefcase,
              },
              {
                title: "Payroll Management",
                href: "/payroll-management",
                icon: Calculator,
              },
            ],
          },
          {
            title: "Director’s Transactions",
            href: "/director-transactions",
            icon: UserCheck,
          },
          {
            title: "Inventory Management",
            href: "/inventory",
            icon: Package,
          },
          {
            title: "Project Management",
            href: "/projects",
            icon: Target,
          },
        ],
      },
    ],
  },
  {
    title: "Monthly Reports",
    href: "/monthly-reports",
    icon: Calendar,
  },
  {
    title: "Trial Balance",
    href: "/trial-balance",
    icon: BarChart3,
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: DollarSign,
  },
  {
    title: "AI Features",
    href: "/ai-features",
    icon: Sparkles,
  },
  {
    title: "Accounting Cycle",
    href: "/accounting-cycle",
    icon: FolderOpen,
  },
  {
    title: "Journal Entries",
    href: "/journal-entries",
    icon: BookOpen,
  },
];

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const checkIsActive = (items: NavItem[]): boolean => {
    return items.some(child => 
      child.href === location.pathname || (child.children && checkIsActive(child.children))
    );
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isActive = item.href === location.pathname;
    const hasChildren = item.children && item.children.length > 0;
    const isGroupActive = hasChildren ? checkIsActive(item.children!) : false;
    const isExpanded = expandedItems.includes(item.title) || isGroupActive;

    if (hasChildren) {
      return (
          <Collapsible key={item.title} open={isExpanded} onOpenChange={() => toggleExpanded(item.title)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5 text-left font-medium",
                  "hover:bg-primary/10 hover:text-primary",
                  "transition-all duration-200",
                  "rounded-lg",
                  depth > 0 && "ml-4",
                  isGroupActive && "bg-primary/10 text-primary border border-primary/20"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate flex-1">{item.title}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 ml-2 mt-1">
              {item.children?.map(child => renderNavItem(child, depth + 1))}
            </CollapsibleContent>
          </Collapsible>
      );
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 px-3 py-2.5 text-left font-medium",
          "hover:bg-primary/10 hover:text-primary",
          "transition-all duration-200",
          "rounded-lg",
          isActive && "bg-primary/15 text-primary font-semibold shadow-sm border border-primary/20",
          depth > 0 && "ml-4"
        )}
        asChild
      >
        <Link to={item.href || "#"} aria-current={isActive ? "page" : undefined}>
          <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
          <span className="truncate">{item.title}</span>
        </Link>
      </Button>
    );
  };

  return (
    <>
      <div
      id="main-sidebar"
      className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex items-center justify-center px-4 py-5 bg-gradient-to-b from-primary/5 to-transparent">
            <img 
              src={rigelFullLogo}
              alt="Rigel - Powered by Stella Lumen" 
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {navItems.map(item => renderNavItem(item))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};
