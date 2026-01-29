import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cookieConsent, setCookieConsent] = useLocalStorage<boolean | null>("cookie-consent", null);

  useEffect(() => {
    // Show banner if consent hasn't been given/denied yet
    if (cookieConsent === null) {
      // Small delay to not annoy immediately
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [cookieConsent]);

  if (!isVisible) return null;

  const handleAccept = () => {
    setCookieConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setCookieConsent(false);
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-bottom-5 fade-in duration-500">
      <Card className="w-full max-w-4xl shadow-xl border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              🍪 Cookie Notice
            </h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to improve your experience, analyze application performance, and ensure security. 
              By clicking "Accept", you agree to our use of cookies for these purposes. 
              This includes basic analytics to help us understand how you use Rigel Genesis.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
            <Button variant="outline" onClick={handleDecline} className="whitespace-nowrap">
              Decline
            </Button>
            <Button onClick={handleAccept} className="whitespace-nowrap">
              Accept All
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
