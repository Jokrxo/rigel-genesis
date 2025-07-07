import { Link } from "react-router-dom";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";

const logoSrc = "/photo-1461749280684-dccba630e2f6";

export const HomePageFooter = () => {
  return (
    <footer className="bg-financial-950 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-financial-100">Rigel</h3>
              <p className="text-financial-300 leading-relaxed max-w-md">
                Comprehensive financial management platform designed specifically for South African businesses. Streamline your operations with intelligent automation and regulatory compliance.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <img 
                src={logoSrc} 
                alt="Professional financial solutions" 
                className="h-20 w-24 rounded-lg border-2 border-financial-700 object-cover shadow-lg" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/lovable-uploads/globe.png";
                }}
              />
              <div>
                <div className="text-sm font-medium text-financial-200">
                  Professional Financial Solutions
                </div>
                <div className="text-xs text-financial-400 mt-1">
                  Trusted by businesses across South Africa
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-financial-100">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-financial-300 hover:text-financial-100 transition-colors duration-200">Features</Link></li>
              <li><Link to="/pricing" className="text-financial-300 hover:text-financial-100 transition-colors duration-200">Pricing</Link></li>
              <li><Link to="/help" className="text-financial-300 hover:text-financial-100 transition-colors duration-200">Help Center</Link></li>
              <li><Link to="/dashboard" className="text-financial-300 hover:text-financial-100 transition-colors duration-200">Dashboard</Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-financial-100">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-financial-400 flex-shrink-0" />
                <a href="tel:0739882190" className="text-financial-300 hover:text-financial-100 transition-colors duration-200">
                  073 988 2190
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-financial-400 flex-shrink-0" />
                <a href="mailto:luthando@stella-lumen.com" className="text-financial-300 hover:text-financial-100 transition-colors duration-200">
                  luthando@stella-lumen.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-financial-400 flex-shrink-0 mt-0.5" />
                <div className="text-financial-300">
                  <div className="font-medium">Luthando Zulu</div>
                  <div className="text-sm text-financial-400">Business Development</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-financial-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-financial-400 text-sm">
              &copy; 2025 Rigel - Professional Financial Management Solutions. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/terms" className="text-financial-400 hover:text-financial-200 text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-financial-400 hover:text-financial-200 text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
