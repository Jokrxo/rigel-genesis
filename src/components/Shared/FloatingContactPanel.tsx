import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mail, Maximize, Minimize } from "lucide-react";

export const FloatingContactPanel: React.FC = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div 
      className="fixed bottom-6 right-28 z-50"
      aria-label="Contact options panel"
    >
      {/* Minimized: only Get In Touch */}
      {!expanded && (
        <Button
          className="flex items-center gap-1 bg-primary hover:bg-primary/90 shadow-lg min-w-[50px] rounded-lg"
          onClick={() => setExpanded(true)}
          aria-label="Expand contact panel"
        >
          <span className="sr-only">Maximize Contact Panel</span>
          <Maximize className="w-5 h-5" />
          <span className="font-semibold hidden sm:inline">Get In Touch</span>
        </Button>
      )}

      {/* Expanded: all contact options */}
      {expanded && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <Button
            size="sm"
            className="flex items-center gap-2 shadow-lg bg-primary hover:bg-primary/90 min-w-[120px] justify-center font-semibold"
            onClick={() => window.open("tel:0739882190")}
            aria-label="Call Luthando at 073 988 2190"
          >
            <Phone size={16} />
            <span>Call</span>
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-2 shadow-lg bg-success hover:bg-success/90 min-w-[120px] justify-center font-semibold"
            onClick={() => window.open("https://wa.me/27739882190")}
            aria-label="Open WhatsApp chat with Luthando"
          >
            <MessageSquare size={16} />
            <span>WhatsApp</span>
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-2 shadow-lg bg-primary hover:bg-primary/90 min-w-[120px] justify-center font-semibold"
            onClick={() => window.open("mailto:luthando@stella-lumen.com")}
            aria-label="Send email to luthando@stella-lumen.com"
          >
            <Mail size={16} />
            <span>Email</span>
          </Button>
          <Button
            variant="ghost"
            className="justify-center items-center w-8 h-8 mx-auto mt-2 rounded-full"
            onClick={() => setExpanded(false)}
            aria-label="Minimize contact panel"
          >
            <Minimize className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};
