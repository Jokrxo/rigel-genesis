import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/Layout/ProtectedRoute";
import { ThemeProvider } from "./hooks/useTheme";

// Import pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import VerificationSuccess from "./pages/Auth/VerificationSuccess";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Features from "./pages/Features";
import ImportStatement from "./pages/ImportStatement";
import AssetManagement from "./pages/AssetManagement";
import DocumentManagement from "./pages/DocumentManagement";
import CustomerManagement from "./pages/CustomerManagement";
import InventoryManagement from "./pages/InventoryManagement";
import SupplierManagement from "./pages/SupplierManagement";
import CompanyProfile from "./pages/CompanyProfile";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import TaxCalculators from "./pages/TaxCalculators";
import Reports from "./pages/Reports";
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Profile from "./pages/Profile";
import QRCode from "./pages/QRCode";
import Settings from "./pages/Settings";
import AIFeatures from "./pages/AIFeatures";
import ProjectManagement from "./pages/ProjectManagement";
import BankBalanceMovements from "./pages/BankBalanceMovements";
import DirectorTransactions from "./pages/DirectorTransactions";
import LoanManagement from "./pages/LoanManagement";
import EmployeeManagement from "./pages/EmployeeManagement";
import Investments from "./pages/Investments";
import TransactionProcessing from "./pages/TransactionProcessing";
import PayrollManagement from "./pages/PayrollManagement";
import FinancialAnalysis from "./pages/FinancialAnalysis";
import SignupWizard from "./pages/SignupWizard";
import TaxDashboard from "./pages/TaxDashboard";
import BankReconciliation from "./pages/BankReconciliation";
import BudgetManagement from "./pages/BudgetManagement";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import TrialBalance from "./pages/TrialBalance";
import AccountingCycle from "./pages/AccountingCycle";
import Contact from "./pages/Contact";
import ExportData from "./pages/ExportData";
import CommunityPage from "./pages/Community/Index";
import ImpairmentModule from "./pages/Impairment/Index";
import PayrollReports from "./pages/Reports/PayrollReports";

import BalanceSheet from "./pages/FinancialReports/BalanceSheet";
import IncomeStatement from "./pages/FinancialReports/IncomeStatement";
import CashFlowStatement from "./pages/FinancialReports/CashFlowStatement";
import CashControlMasterfile from "./pages/FinancialReports/CashControlMasterfile";
import DebtorsAgeAnalysis from "./pages/FinancialReports/DebtorsAgeAnalysis";
import EquityStatement from "./pages/FinancialReports/EquityStatement";
import Notes from "./pages/FinancialReports/Notes";
import GeneralLedger from "./pages/GeneralLedger/GeneralLedger";
import LedgerPosting from "./pages/GeneralLedger/LedgerPosting";
import MonthlyReports from "./pages/MonthlyReports";
import JournalEntries from "./pages/JournalEntries";
import AuditLogs from "./pages/AuditLogs";
import BookkeeperDashboard from "./pages/BookkeeperDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

import { Chatbot } from "@/components/Shared/Chatbot";
import { FloatingContactPanel } from "@/components/Shared/FloatingContactPanel";
import { CookieConsent } from "@/components/Shared/CookieConsent";
import { RatingModalProvider } from "@/components/Shared/RatingModal";
import { TutorialProvider } from "@/components/Tutorial/TutorialContext";
import ToolsSupport from "./pages/ToolsSupport";

// Sales Module Pages
import SalesCustomers from "./pages/Sales/Customers";
import SalesCustomerDetail from "./pages/Sales/CustomerDetail";
import SalesQuotations from "./pages/Sales/Quotations";
import SalesOrders from "./pages/Sales/Orders";
import SalesInvoices from "./pages/Sales/Invoices";
import SalesCreditNotes from "./pages/Sales/CreditNotes";
import SalesReceipts from "./pages/Sales/Receipts";

const __isDev = import.meta.env.DEV;
if (!__isDev) {
  const __noop = () => {};
  console.log = __noop;
  console.info = __noop;
  console.debug = __noop;
  console.warn = __noop;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <TutorialProvider>
          <BrowserRouter>
            <AuthProvider>
              <RatingModalProvider>
              <ErrorBoundary>
                <Toaster />
                <Sonner />
                <FloatingContactPanel />
                <Chatbot />
                <CookieConsent />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/verification-success" element={<VerificationSuccess />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/signup-wizard" element={<SignupWizard />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/qr-code" element={<QRCode />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/import-statement" element={<ProtectedRoute><ImportStatement /></ProtectedRoute>} />
                  <Route path="/asset-management" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><AssetManagement /></ProtectedRoute>} />
                  <Route path="/documents" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><DocumentManagement /></ProtectedRoute>} />
                  <Route path="/customers" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><CustomerManagement /></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><InventoryManagement /></ProtectedRoute>} />
                  <Route path="/suppliers" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><SupplierManagement /></ProtectedRoute>} />
                  <Route path="/projects" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><ProjectManagement /></ProtectedRoute>} />
                  <Route path="/bank-movements" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><BankBalanceMovements /></ProtectedRoute>} />
                  <Route path="/director-transactions" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><DirectorTransactions /></ProtectedRoute>} />
                  <Route path="/loan-management" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><LoanManagement /></ProtectedRoute>} />
                  <Route path="/employee-management" element={<ProtectedRoute roles={['owner', 'admin']}><EmployeeManagement /></ProtectedRoute>} />
                  <Route path="/payroll-management" element={<ProtectedRoute roles={['owner', 'admin']}><PayrollManagement /></ProtectedRoute>} />
                  <Route path="/investments" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><Investments /></ProtectedRoute>} />
                  <Route path="/transaction-processing" element={<ProtectedRoute><TransactionProcessing /></ProtectedRoute>} />
                  <Route path="/company-profile" element={<ProtectedRoute roles={['owner', 'admin']}><CompanyProfile /></ProtectedRoute>} />
                  <Route path="/audit-logs" element={<ProtectedRoute roles={['owner', 'admin']}><AuditLogs /></ProtectedRoute>} />
                  <Route path="/bookkeeper" element={<ProtectedRoute><BookkeeperDashboard /></ProtectedRoute>} />
                  <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><Reports /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute roles={['owner', 'admin']}><Settings /></ProtectedRoute>} />
                  <Route path="/tax-calculators" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><TaxCalculators /></ProtectedRoute>} />
                  <Route path="/ai-features" element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
                  <Route path="/financial-analysis" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><FinancialAnalysis /></ProtectedRoute>} />
                  <Route path="/tax-dashboard" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><TaxDashboard /></ProtectedRoute>} />
                  <Route path="/trial-balance" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><TrialBalance /></ProtectedRoute>} />
                  <Route path="/bank-reconciliation" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><BankReconciliation /></ProtectedRoute>} />
                  <Route path="/budget-management" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><BudgetManagement /></ProtectedRoute>} />
                  <Route path="/chart-of-accounts" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><ChartOfAccounts /></ProtectedRoute>} />
                  <Route path="/accounting-cycle" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><AccountingCycle /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                  <Route path="/impairment" element={<ProtectedRoute><ImpairmentModule /></ProtectedRoute>} />
                  <Route path="/reports/payroll" element={<ProtectedRoute><PayrollReports /></ProtectedRoute>} />
                  <Route path="/tools-support" element={<ProtectedRoute><ToolsSupport /></ProtectedRoute>} />
                  <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
                  <Route path="/export-data" element={<ProtectedRoute><ExportData /></ProtectedRoute>} />
                  <Route path="/reports/balance-sheet" element={<ProtectedRoute><BalanceSheet /></ProtectedRoute>} />
                  <Route path="/reports/income-statement" element={<ProtectedRoute><IncomeStatement /></ProtectedRoute>} />
                  <Route path="/reports/cash-flow" element={<ProtectedRoute><CashFlowStatement /></ProtectedRoute>} />
                  <Route path="/reports/cash-control" element={<ProtectedRoute><CashControlMasterfile /></ProtectedRoute>} />
                  <Route path="/reports/debtors-age-analysis" element={<ProtectedRoute><DebtorsAgeAnalysis /></ProtectedRoute>} />
                  <Route path="/reports/equity" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><EquityStatement /></ProtectedRoute>} />
                  <Route path="/reports/notes" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><Notes /></ProtectedRoute>} />
                  <Route path="/general-ledger" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><GeneralLedger /></ProtectedRoute>} />
                  <Route path="/general-ledger/posting" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><LedgerPosting /></ProtectedRoute>} />
                  <Route path="/monthly-reports" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><MonthlyReports /></ProtectedRoute>} />
                  <Route path="/journal-entries" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><JournalEntries /></ProtectedRoute>} />
                  
                  {/* Sales Module Routes */}
                  <Route path="/sales/customers" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><SalesCustomers /></ProtectedRoute>} />
                  <Route path="/sales/customers/:id" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><SalesCustomerDetail /></ProtectedRoute>} />
                  <Route path="/sales/quotations" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><SalesQuotations /></ProtectedRoute>} />
                  <Route path="/sales/orders" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><SalesOrders /></ProtectedRoute>} />
                  <Route path="/sales/invoices" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><SalesInvoices /></ProtectedRoute>} />
                  <Route path="/sales/credit-notes" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><SalesCreditNotes /></ProtectedRoute>} />
                  <Route path="/sales/receipts" element={<ProtectedRoute roles={['owner', 'admin', 'accountant']}><SalesReceipts /></ProtectedRoute>} />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
              </RatingModalProvider>
            </AuthProvider>
          </BrowserRouter>
          </TutorialProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
