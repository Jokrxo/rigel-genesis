import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-financial.jpg";

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[400px] md:min-h-[600px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(200,30%,15%)] via-[hsl(180,40%,12%)] to-[hsl(160,50%,10%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center gap-6 px-4 pt-10 pb-24">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-primary-foreground">
          Streamline Your Business Finances with Rigel
        </h1>
        <p className="text-lg md:text-2xl text-center max-w-2xl text-primary-foreground">
          Take control of your financial future. Automate tasks, gain insights, and grow your business.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/register">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 font-semibold shadow-lg shadow-primary/20">
              Get Started Free
            </Button>
          </Link>
          <Link to="/ai-features">
            <Button size="lg" variant="outline" className="border-2 border-primary text-primary-foreground bg-transparent hover:bg-primary hover:text-primary-foreground transition-colors duration-300 font-semibold">
              Explore AI Features
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
export { HeroSection };
