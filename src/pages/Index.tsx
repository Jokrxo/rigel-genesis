import { HeroSection } from "@/components/HomePage/HeroSection";
import { FeaturesSection } from "@/components/HomePage/FeaturesSection";
import { QRSection } from "@/components/HomePage/QRSection";
import { CTASection } from "@/components/HomePage/CTASection";
import { HomePageFooter } from "@/components/HomePage/HomePageFooter";
import { Chatbot } from "@/components/Shared/Chatbot";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
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
