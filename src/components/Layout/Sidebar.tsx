
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  UserCheck,
  CreditCard,
  Briefcase,
  Target,
  PiggyBank,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    title: "Import Statement",
    href: "/import-statement",
    icon: Upload,
  },
  {
    title: "Transaction Processing",
    href: "/transaction-processing",
    icon: CreditCard,
  },
  {
    title: "Master Records",
    icon: FolderOpen,
    children: [
      {
        title: "Company Profile",
        href: "/company-profile",
        icon: Building2,
      },
      {
        title: "Customer Management",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Supplier Management",
        href: "/suppliers",
        icon: Truck,
      },
      {
        title: "Project Management",
        href: "/projects",
        icon: Target,
      },
      {
        title: "Bank Balance Movements",
        href: "/bank-movements",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Document Management",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Inventory Management",
    href: "/inventory",
    icon: Package,
  },
  {
    title: "Director Transactions",
    href: "/director-transactions",
    icon: UserCheck,
  },
  {
    title: "Loan Management",
    href: "/loan-management",
    icon: CreditCard,
  },
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
  {
    title: "Asset Management",
    href: "/asset-management",
    icon: Building2,
  },
  {
    title: "Investments",
    href: "/investments",
    icon: PiggyBank,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Tax Calculators",
    href: "/tax-calculators",
    icon: Calculator,
  },
  {
    title: "Financial Analysis",
    href: "/financial-analysis",
    icon: TrendingUp,
  },
  {
    title: "Trial Balance",
    href: "/trial-balance",
    icon: BarChart3,
  },
  {
    title: "Tax Dashboard",
    href: "/tax-dashboard",
    icon: Calculator,
  },
  {
    title: "Accounting Cycle",
    href: "/accounting-cycle",
    icon: FolderOpen,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
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

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isActive = item.href === location.pathname;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isExpanded} onOpenChange={() => toggleExpanded(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 px-3 py-2.5 text-left font-normal",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors duration-200",
                depth > 0 && "ml-4"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate flex-1">{item.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
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
          "w-full justify-start gap-2 px-3 py-2.5 text-left font-normal",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors duration-200",
          isActive && "bg-accent text-accent-foreground font-medium",
          depth > 0 && "ml-4"
        )}
        asChild
      >
        <Link to={item.href || "#"}>
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.title}</span>
        </Link>
      </Button>
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-sidebar-border">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl text-sidebar-foreground">Rigel</span>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {navItems.map(item => renderNavItem(item))}
            </div>
          </ScrollArea>

          {/* Bottom Navigation */}
          <div className="border-t border-sidebar-border p-3">
            <div className="space-y-1">
              {bottomNavItems.map(item => renderNavItem(item))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
