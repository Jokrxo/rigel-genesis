
import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HomePage/HeroSection";
import { FeaturesSection } from "@/components/HomePage/FeaturesSection";
import { QRSection } from "@/components/HomePage/QRSection";
import { CTASection } from "@/components/HomePage/CTASection";
import { HomePageFooter } from "@/components/HomePage/HomePageFooter";
import { Chatbot } from "@/components/Shared/Chatbot";
import { InstallationWizard } from "@/components/Onboarding/InstallationWizard";

const Index = () => {
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Check if setup is complete
    const isSetup = localStorage.getItem("rigel_setup_complete");
    if (!isSetup) {
      const timer = setTimeout(() => setShowWizard(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <InstallationWizard 
        open={showWizard} 
        onOpenChange={(open) => {
          setShowWizard(open);
          if (!open) {
            localStorage.setItem("rigel_setup_complete", "true");
          }
        }} 
      />
      <HeroSection />
      <FeaturesSection />
      <QRSection />
      <CTASection />
      <HomePageFooter />
      <Chatbot />
    </div>
  );
};

export default Index;
