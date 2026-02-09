import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, HelpCircle, LogOut, Menu, Search, User, Phone, Wrench, MessageCircle, FileText, Calculator, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useTutorial } from "@/components/Tutorial/TutorialContext";
import { useRatingModal } from "@/components/Shared/RatingModal";

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { startTutorial } = useTutorial();
  const { showRatingModal } = useRatingModal();

  const handleStartTour = () => {
    startTutorial([
      { target: 'header', content: 'This is the command center. Access search, notifications, and profile settings here.', position: 'bottom' },
      { target: '#main-sidebar', content: 'Navigate through all Rigel modules using this sidebar. Hover over icons to see more.', position: 'right' },
      { target: '[role="search"]', content: 'Search for anything in the system - invoices, contacts, or reports.', position: 'bottom' },
    ]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  const openChatbot = () => {
    // Dispatch a custom event that Chatbot component listens to
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  const handleLogoutClick = async () => {
    if (!user) {
      logout();
      return;
    }

    try {
      // Check if user has already rated in the database
      const { data, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('user_ratings' as any)
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error("Error checking rating status:", error);
        // If error, just logout to be safe
        logout();
        return;
      }

      if (data && data.length > 0) {
        // Already rated, just logout directly
        logout();
      } else {
        // Show rating modal first
        showRatingModal();
      }
    } catch (err) {
      console.error("Unexpected error in logout flow:", err);
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        {/* Financial logo in header */}
        <div className="hidden md:flex items-center">
          <img
            src="/lovable-uploads/b1f574c8-f027-467a-a92b-e556560a94cc.png"
            alt="Financial workspace"
            className="h-8 w-12 mr-4 object-cover rounded-lg border border-border"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <span className="font-semibold">Rigel</span>
        </div>
        
        <form onSubmit={handleSearch} className="hidden md:block" role="search" aria-label="Site search">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] pl-8 md:w-[300px] lg:w-[400px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search the site"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-2">
        {/* Contact Information */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>Contact: Luthando Zulu</span>
        </div>
        
        {/* Tools and Support Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Wrench className="h-4 w-4" />
              Tools & Support
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Support</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleStartTour}>
              <Sparkles className="mr-2 h-4 w-4" /> Take a Tour
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/help")}>
              <HelpCircle className="mr-2 h-4 w-4" /> Help Documentation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openChatbot}>
              <MessageCircle className="mr-2 h-4 w-4" /> Live Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/help#faq")}>
              <FileText className="mr-2 h-4 w-4" /> FAQ
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => navigate("/contact")}>
              <Phone className="mr-2 h-4 w-4" /> Contact Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Quick Tools</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate("/tax-calculators")}>
              <Calculator className="mr-2 h-4 w-4" /> Calculators
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/reports")}>
              <Download className="mr-2 h-4 w-4" /> Export Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogoutClick}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};