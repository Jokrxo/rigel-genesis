
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Import pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import VerificationSuccess from "./pages/Auth/VerificationSuccess";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verification-success" element={<VerificationSuccess />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/import-statement" element={<ImportStatement />} />
                <Route path="/asset-management" element={<AssetManagement />} />
                <Route path="/documents" element={<DocumentManagement />} />
                <Route path="/customers" element={<CustomerManagement />} />
                <Route path="/inventory" element={<InventoryManagement />} />
                <Route path="/suppliers" element={<SupplierManagement />} />
                <Route path="/projects" element={<ProjectManagement />} />
                <Route path="/bank-movements" element={<BankBalanceMovements />} />
                <Route path="/director-transactions" element={<DirectorTransactions />} />
                <Route path="/loan-management" element={<LoanManagement />} />
                <Route path="/employee-management" element={<EmployeeManagement />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/transaction-processing" element={<TransactionProcessing />} />
                <Route path="/company-profile" element={<CompanyProfile />} />
                <Route path="/help" element={<Help />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/qr-code" element={<QRCode />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/tax-calculators" element={<TaxCalculators />} />
                <Route path="/ai-features" element={<AIFeatures />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
