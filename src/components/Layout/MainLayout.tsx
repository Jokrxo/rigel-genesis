import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mail } from "lucide-react";
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
            <div className="hidden md:block mb-6">
              <div className="relative rounded-xl overflow-hidden border border-border">
                <div className="w-full h-40">
                  <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
                    <defs>
                      <linearGradient id="bannerGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" style={{ stopColor: "hsl(var(--primary))" }} />
                        <stop offset="100%" style={{ stopColor: "hsl(var(--accent))" }} />
                      </linearGradient>
                      <radialGradient id="glow" cx="50%" cy="50%" r="0.8">
                        <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.25 }} />
                        <stop offset="100%" style={{ stopColor: "transparent", stopOpacity: 0 }} />
                      </radialGradient>
                    </defs>
                    <rect x="0" y="0" width="800" height="200" fill="url(#bannerGradient)" />
                    <rect x="0" y="0" width="800" height="200" fill="url(#glow)" />
                    <path d="M0 140 C 100 120, 200 160, 300 130 S 500 110, 600 140 S 700 170, 800 130" fill="none" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.35" strokeWidth="3" />
                    <path d="M0 160 C 120 150, 220 170, 320 150 S 520 140, 620 160 S 720 185, 800 155" fill="none" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.2" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Professional header section - Only show on mobile */}
            <div className="flex justify-center mb-6 md:hidden">
              <img
                src="/lovable-uploads/40097537-cde9-4ba9-86f3-c62f21d8905f.png"
                alt="Financial data visualization"
                className="h-12 w-auto object-cover rounded-lg shadow-lg border border-blue-200 sm:h-16"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
                onLoad={() => {
                }}
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
