import React from "react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[400px] md:min-h-[600px] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-10 pb-24">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          Streamline Your Business Finances with Rigel
        </h1>
        <p className="text-lg md:text-2xl text-center max-w-2xl">
          Take control of your financial future. Automate tasks, gain insights, and grow your business.
        </p>
        <div className="flex items-center gap-4">
          <a href="/register">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 transition-colors duration-300 font-semibold">
              Get Started Free
            </Button>
          </a>
          <a href="/ai-features">
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors duration-300 font-semibold">
              Explore AI Features
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
export { HeroSection };
