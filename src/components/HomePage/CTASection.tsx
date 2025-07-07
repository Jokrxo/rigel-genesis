
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 relative overflow-hidden">
      {/* Enhanced background with financial chart image */}
      <div className="absolute inset-0 bg-financial-hero bg-cover bg-center opacity-25"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/85"></div>
      
      <div className="relative container mx-auto px-6 text-white">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Ready to Transform Your Financial Management?
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Join thousands of South African businesses who trust Rigel for their comprehensive financial needs and regulatory compliance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 my-12">
            <div className="flex items-center gap-3 bg-blue-800/50 p-4 rounded-lg border border-blue-600">
              <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0" />
              <span className="text-blue-100">Free 30-day trial</span>
            </div>
            <div className="flex items-center gap-3 bg-blue-800/50 p-4 rounded-lg border border-blue-600">
              <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0" />
              <span className="text-blue-100">No credit card required</span>
            </div>
            <div className="flex items-center gap-3 bg-blue-800/50 p-4 rounded-lg border border-blue-600">
              <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0" />
              <span className="text-blue-100">Expert support included</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold group">
              <Link to="/register" className="flex items-center gap-2">
                Get Started for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 transition-all duration-300 font-semibold">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
