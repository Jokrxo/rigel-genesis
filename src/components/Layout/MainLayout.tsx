import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mail } from "lucide-react";
import { FloatingContactPanel } from "@/components/Shared/FloatingContactPanel";
import { SkipToMain } from "@/components/Shared/SkipToMain";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen w-full bg-background flex-col">
      <SkipToMain />
      {/* Main background pattern with professional gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/30 pointer-events-none z-0" />
      
      {/* Floating contact panel */}
      <FloatingContactPanel />

      <div className="flex flex-1 relative z-10">
        <Sidebar isOpen={sidebarOpen} />
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300 ease-in-out min-w-0",
            "md:ml-64"
          )}
        >
          <Header toggleSidebar={toggleSidebar} />
          <main id="main-content" role="main" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 overflow-x-auto focus:outline-none">
            {/* Professional header section - Only show on mobile */}
            <div className="flex justify-center mb-6 md:hidden">
              <img
                src="/lovable-uploads/40097537-cde9-4ba9-86f3-c62f21d8905f.png"
                alt="Financial data visualization"
                className="h-12 w-auto object-cover rounded-lg shadow-lg border border-blue-200 sm:h-16"
                onError={(e) => {
                  console.log("Header image failed to load");
                  e.currentTarget.src = "/placeholder.svg";
                }}
                onLoad={() => console.log("Header image loaded successfully")}
              />
            </div>
            
            <div className="max-w-full mx-auto space-y-6 md:space-y-8 pb-20">
              {/* Enhanced spacing and typography */}
              <div className="relative">
                <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-primary to-primary/50 pointer-events-none rounded-xl" />
                <div className="relative z-10">
                  {children}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};
