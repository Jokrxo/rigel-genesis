
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Phone, Mail, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    text: "Hello! I'm Rigel AI, your South African financial assistant. I can help you with tax questions, VAT calculations, SARS compliance, and using this application. How can I assist you today?",
    isUser: false,
    timestamp: new Date(),
  },
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [contactOptions, setContactOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setContactOptions(false);
  };

  const toggleContactOptions = () => {
    setContactOptions(!contactOptions);
    setIsOpen(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-financial-assistant', {
        body: { 
          message: currentInput,
          context: {
            timestamp: new Date().toISOString(),
            userLocation: 'South Africa'
          }
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        text: "I'm sorry, I'm having trouble connecting right now. For immediate assistance, please contact Luthando at 073 988 2190 or try the contact options below.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "Unable to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Contact options popup */}
      {contactOptions && (
        <div className="mb-4 flex flex-col gap-2">
          <Button 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              window.open("tel:0739882190");
              setContactOptions(false);
            }}
          >
            <Phone size={16} />
            <span>Call</span>
          </Button>
          <Button 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              window.open("https://wa.me/27739882190");
              setContactOptions(false);
            }}
          >
            <MessageSquare size={16} />
            <span>WhatsApp</span>
          </Button>
          <Button 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              window.open("mailto:luthando@stella-lumen.com");
              setContactOptions(false);
            }}
          >
            <Mail size={16} />
            <span>Email</span>
          </Button>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className="mb-4 w-[350px] shadow-lg">
          <CardHeader className="p-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4 text-financial-600" />
                Rigel AI Assistant
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleChat}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 max-h-[300px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "mb-3 max-w-[80%] rounded-lg p-3",
                  message.isUser
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70 block mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="mb-3 max-w-[80%] rounded-lg p-3 bg-muted">
                <Loading size="sm" text="Thinking..." />
              </div>
            )}
          </CardContent>
          <CardFooter className="p-3 border-t">
            <div className="flex w-full gap-2">
              <Input
                placeholder="Ask about taxes, VAT, or financial guidance..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Chat button */}
      <div className="flex gap-2">
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={toggleContactOptions}
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={toggleChat}
        >
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
