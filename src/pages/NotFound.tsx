
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, HelpCircle, LayoutDashboard, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <div className="space-y-6 max-w-2xl">
          {/* Visual Element */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-30" />
            <h1 className="relative text-9xl font-black text-primary/10 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xl text-muted-foreground">
              We couldn't find the page you're looking for.
            </p>
            <p className="text-sm text-muted-foreground">
              The requested URL <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{location.pathname}</code> might have been moved or doesn't exist.
            </p>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mt-8">
            <Link to="/dashboard">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Dashboard</h3>
                    <p className="text-xs text-muted-foreground">Return to overview</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/help">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Help Center</h3>
                    <p className="text-xs text-muted-foreground">Get assistance</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/reports">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Reports</h3>
                    <p className="text-xs text-muted-foreground">View financial reports</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/contact">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Contact Support</h3>
                    <p className="text-xs text-muted-foreground">Report a broken link</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button variant="default" size="lg" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
