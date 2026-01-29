
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Bot, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useBudgetData } from "@/hooks/useBudgetData";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  action?: {
    label: string;
    handler: () => void;
  };
}

const initialMessages: Message[] = [
  {
    text: "Hello! I'm Rigel AI, your financial assistant. I can help you navigate the app, check your financial status, or take feature suggestions. Try asking 'What is my bank balance?' or 'Go to dashboard'.",
    isUser: false,
    timestamp: new Date(),
  },
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      try {
        return JSON.parse(saved, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
      } catch (e) {
        return initialMessages;
      }
    }
    return initialMessages;
  });

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getBankBalance, getBalanceSheetData, getIncomeStatementData } = useFinancialData();
  const { budgets } = useBudgetData();

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const processLocalQuery = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();

    // Navigation
    if (lowerQuery.includes("dashboard") || lowerQuery.includes("home")) {
      navigate("/dashboard");
      return "I've navigated you to the Dashboard.";
    }
    if (lowerQuery.includes("tools") || lowerQuery.includes("support") || lowerQuery.includes("help")) {
      navigate("/tools-support");
      return "Opening Tools & Support page.";
    }
    if (lowerQuery.includes("login") || lowerQuery.includes("sign in")) {
      navigate("/login");
      return "Redirecting to Login.";
    }
    if (lowerQuery.includes("journal") || lowerQuery.includes("entry")) {
        navigate("/journals");
        return "Opening Journal Entries module.";
    }
    if (lowerQuery.includes("budget")) {
        navigate("/budget");
        return "Opening Budget Management module.";
    }
    if (lowerQuery.includes("bank") && lowerQuery.includes("reconciliation")) {
        navigate("/bank-reconciliation");
        return "Opening Bank Reconciliation module.";
    }
    if (lowerQuery.includes("report") || lowerQuery.includes("statement")) {
        navigate("/financial-overview");
        return "Opening Financial Reports.";
    }

    // User Data
    if (lowerQuery.includes("who am i") || lowerQuery.includes("profile") || lowerQuery.includes("user")) {
        if (user) {
            return `You are logged in as ${user.email} (${(user as { role?: string }).role || 'User'}).`;
        }
        return "You are currently not logged in.";
    }

    // Financial Data (Entity Specific)
    if (lowerQuery.includes("bank balance") || lowerQuery.includes("cash")) {
      const balance = getBankBalance();
      return `Your current calculated bank balance is R ${balance.toLocaleString()}.`;
    }
    if (lowerQuery.includes("assets")) {
      const data = getBalanceSheetData(new Date());
      return `Your Total Assets are R ${data.assets.total.toLocaleString()}.`;
    }
    if (lowerQuery.includes("liabilities")) {
        const data = getBalanceSheetData(new Date());
        return `Your Total Liabilities are R ${data.liabilities.total.toLocaleString()}.`;
    }
    if (lowerQuery.includes("equity")) {
        const data = getBalanceSheetData(new Date());
        return `Your Total Equity is R ${data.equity.total.toLocaleString()}.`;
    }
    if (lowerQuery.includes("net profit") || lowerQuery.includes("profit") || lowerQuery.includes("income")) {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const { netProfit, revenue, expenses } = getIncomeStatementData(startOfYear, today);
        
        if (lowerQuery.includes("revenue") || lowerQuery.includes("sales")) {
            return `Total Revenue YTD is R ${revenue.toLocaleString()}.`;
        }
        if (lowerQuery.includes("expense")) {
             // Check specific GL expense category
             const { expensesByCategory } = getIncomeStatementData(startOfYear, today);
             const matchedCategory = Object.keys(expensesByCategory).find(cat => lowerQuery.includes(cat.toLowerCase()));
             
             if (matchedCategory) {
                 return `YTD Expenses for ${matchedCategory}: R ${expensesByCategory[matchedCategory].toLocaleString()}.`;
             }
             return `Total Expenses YTD are R ${expenses.toLocaleString()}.`;
        }
        return `Your Net Profit YTD is R ${netProfit.toLocaleString()}.`;
    }

    // Feature Suggestions
    if (lowerQuery.includes("feature") || lowerQuery.includes("suggest") || lowerQuery.includes("add")) {
      return "I've noted your suggestion! Our team reviews these daily. Anything else you'd like to improve?";
    }

    // Budget Queries
    if (lowerQuery.includes("budget") || lowerQuery.includes("spending")) {
        // Check for specific category mention
        const matchedBudget = budgets.find(b => lowerQuery.includes(b.category.toLowerCase()));
        if (matchedBudget) {
            const variance = matchedBudget.amount - matchedBudget.spent;
            const status = variance < 0 ? "over budget" : "under budget";
            return `Budget for ${matchedBudget.category}: R ${matchedBudget.amount.toLocaleString()}. Spent: R ${matchedBudget.spent.toLocaleString()} (${status}).`;
        }

        // Check for department mention
        const matchedDepartment = budgets.find(b => lowerQuery.includes(b.department.toLowerCase()));
        if (matchedDepartment) {
             const deptBudgets = budgets.filter(b => b.department.toLowerCase() === matchedDepartment.department.toLowerCase());
             const totalDeptBudget = deptBudgets.reduce((sum, b) => sum + b.amount, 0);
             const totalDeptSpent = deptBudgets.reduce((sum, b) => sum + b.spent, 0);
             return `Budget for ${matchedDepartment.department} Department: R ${totalDeptBudget.toLocaleString()}. Spent: R ${totalDeptSpent.toLocaleString()}.`;
        }
        
        // General Budget Status
        if (lowerQuery.includes("status") || lowerQuery.includes("overview") || lowerQuery.includes("total")) {
             const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
             const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
             return `Total Budget: R ${totalBudget.toLocaleString()}. Total Spent: R ${totalSpent.toLocaleString()}.`;
        }
    }

    return null;
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

    // Simulate thinking delay
    setTimeout(async () => {
        try {
            // 1. Try Local Logic first
            const localResponse = processLocalQuery(currentInput);
            if (localResponse) {
                const botMessage: Message = {
                    text: localResponse,
                    isUser: false,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMessage]);
                setIsLoading(false);
                return;
            }

            // 2. Try Supabase Edge Function (Mocked/Real)
            // If we had a real OpenAI key, we would call it here.
            // For now, we fall back to a generic helpful response if local logic fails.
            
            /* 
            // Uncomment when Edge Function is ready
            const { data, error } = await supabase.functions.invoke('ai-financial-assistant', {
                body: { 
                message: currentInput,
                context: { ... }
                }
            });
            */
           
            const fallbackResponse = "I can help with financial data (ask about assets, bank balance) or navigation (ask to go to dashboard). For complex queries, please contact support.";
            
            const botMessage: Message = {
                text: fallbackResponse,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);

        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                text: "I'm having trouble connecting right now. Please try again.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat window */}
      {isOpen && (
        <Card className="w-[350px] shadow-2xl border-primary/20 animate-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="p-3 border-b bg-primary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Bot className="h-4 w-4" />
                Rigel AI Assistant
              </CardTitle>
              <div className="flex gap-1">
                 <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/20" title="Suggest Feature">
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive" onClick={toggleChat}>
                    <X className="h-3 w-3" />
                 </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 h-[350px] overflow-y-auto bg-background/50 scrollbar-thin scrollbar-thumb-primary/10">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "mb-3 max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
                  message.isUser
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                <p>{message.text}</p>
                <span className={cn(
                  "text-[10px] opacity-70 block mt-1",
                  message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="mb-3 max-w-[80%] rounded-2xl p-3 bg-muted rounded-bl-sm">
                <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-3 border-t bg-background">
            <div className="flex w-full gap-2">
              <Input
                placeholder="Ask Rigel AI..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 focus-visible:ring-primary"
              />
              <Button size="icon" onClick={sendMessage} disabled={isLoading || !inputMessage.trim()} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
            onClick={toggleChat}
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-110 hover:shadow-primary/25 border-4 border-background"
        >
            <Sparkles className="h-6 w-6 animate-pulse" />
        </Button>
      )}
    </div>
  );
};
