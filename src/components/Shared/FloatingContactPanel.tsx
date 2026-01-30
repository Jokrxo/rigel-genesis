import * as React from "react";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mail } from "lucide-react";

export const FloatingContactPanel: React.FC = () => {
  return (
    <div 
      className="fixed bottom-7 right-24 z-40 flex items-center gap-3"
      aria-label="Contact options panel"
    >
      <Button
        size="icon"
        className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-110"
        onClick={() => window.open("tel:0739882190")}
        aria-label="Call Luthando at 073 988 2190"
        title="Call"
      >
        <Phone size={20} />
      </Button>
      
      <Button
        size="icon"
        className="rounded-full w-12 h-12 shadow-lg bg-success hover:bg-success/90 transition-transform hover:scale-110 text-white"
        onClick={() => window.open("https://wa.me/27739882190")}
        aria-label="Open WhatsApp chat with Luthando"
        title="WhatsApp"
      >
        <MessageSquare size={20} />
      </Button>

      <Button
        size="icon"
        className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-110"
        onClick={() => window.open("mailto:luthando@stella-lumen.com")}
        aria-label="Send email to luthando@stella-lumen.com"
        title="Email"
      >
        <Mail size={20} />
      </Button>
    </div>
  );
};
