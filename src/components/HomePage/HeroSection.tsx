import React from "react";

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[400px] md:min-h-[600px] bg-gradient-to-br from-blue-800 to-blue-600 text-white px-4 pt-10 pb-24">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          Streamline Your Business Finances with Rigel
        </h1>
        <p className="text-lg md:text-2xl text-center max-w-2xl">
          Take control of your financial future. Automate tasks, gain insights, and grow your business.
        </p>
        <div className="flex items-center gap-4">
          <a href="/register">
            <button className="bg-white text-blue-700 font-bold py-3 px-8 rounded-md hover:bg-blue-50 transition-colors duration-300">
              Get Started Free
            </button>
          </a>
          <a href="/ai-features">
            <button className="bg-transparent border border-white text-white font-bold py-3 px-8 rounded-md hover:bg-blue-500 hover:border-blue-500 transition-colors duration-300">
              Explore AI Features
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};
export { HeroSection };
