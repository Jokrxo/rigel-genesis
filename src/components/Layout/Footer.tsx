import { Link } from "react-router-dom";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import globeImage from "@/assets/globe.jpg";

export const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground py-8 mt-auto border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-justify">
            <h3 className="text-lg font-semibold mb-4">Rigel</h3>
            <p className="text-muted-foreground">
              Comprehensive financial management for South African businesses.
            </p>
            <div className="mt-4">
              <img 
                src="/photo-1461749280684-dccba630e2f6"
                alt="Financial technology" 
                className="h-20 w-auto rounded shadow border-4 border-primary object-cover" 
                style={{ minWidth: "120px", minHeight: "80px" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = globeImage;
                }}
              />
              <div className="text-xs text-muted-foreground mt-2">
                Professional Financial Management Solutions
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-justify">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:0739882190" className="text-muted-foreground hover:text-foreground transition-colors">
                  073 988 2190
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:luthando@stella-lumen.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  luthando@stella-lumen.com
                </a>
              </div>
              <div>
                <p className="text-muted-foreground">Luthando Zulu</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="flex flex-col space-y-3 text-justify">
              <Button variant="outline" className="gap-2 justify-start" onClick={() => window.open("mailto:luthando@stella-lumen.com")}>
                <Mail className="h-4 w-4" />
                <span>Email Us</span>
              </Button>
              <Button variant="outline" className="gap-2 justify-start" onClick={() => window.open("https://wa.me/27739882190")}>
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </Button>
              <Button variant="outline" className="gap-2 justify-start" onClick={() => window.open("sms:+27739882190")}>
                <MessageSquare className="h-4 w-4" />
                <span>SMS</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground">
          <div className="flex justify-center mb-4">
            <img 
              src="/photo-1531297484001-80022131f5a1" 
              alt="Financial workspace" 
              className="h-10 object-cover rounded border border-border" 
            />
          </div>
          <p>&copy; 2025 Rigel - All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
