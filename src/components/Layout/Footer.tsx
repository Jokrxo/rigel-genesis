import { Link } from "react-router-dom";
import { Mail, Phone, MessageSquare, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import rigelFullLogo from "@/assets/rigel-full-logo.jpg";

export const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground py-8 mt-auto border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-justify">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={rigelFullLogo}
                alt="Rigel - Financial Management" 
                className="h-16 w-auto object-contain rounded-lg" 
              />
            </div>
            <p className="text-muted-foreground">
              Comprehensive financial management for South African businesses.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Stella Lumen (Pty) Ltd</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-justify">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:0319444635" className="text-muted-foreground hover:text-foreground transition-colors">
                  031 944 4635
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:info@stella-lumen.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  info@stella-lumen.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Stella Lumen (Pty) Ltd</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="flex flex-col space-y-3 text-justify">
              <Button variant="outline" className="gap-2 justify-start" onClick={() => window.open("mailto:info@stella-lumen.com")}>
                <Mail className="h-4 w-4" />
                <span>Email Us</span>
              </Button>
              <Button variant="outline" className="gap-2 justify-start" onClick={() => window.open("https://wa.me/27319444635")}>
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </Button>
              <Button variant="outline" className="gap-2 justify-start" onClick={() => window.open("sms:+27319444635")}>
                <MessageSquare className="h-4 w-4" />
                <span>SMS</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground">
          <div className="flex justify-center mb-4">
            <img 
              src={rigelFullLogo}
              alt="Rigel Logo" 
              className="h-10 object-contain rounded" 
            />
          </div>
          <p>&copy; 2025 Rigel by Stella Lumen (Pty) Ltd - All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
