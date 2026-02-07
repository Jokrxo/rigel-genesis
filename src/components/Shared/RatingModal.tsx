import { useState, createContext, useContext, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RatingModalContextType {
  showRatingModal: () => void;
  isOpen: boolean;
}

const RatingModalContext = createContext<RatingModalContextType | null>(null);

export const useRatingModal = () => {
  const context = useContext(RatingModalContext);
  if (!context) {
    throw new Error("useRatingModal must be used within RatingModalProvider");
  }
  return context;
};

export const RatingModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const showRatingModal = () => {
    setIsOpen(true);
  };

  return (
    <RatingModalContext.Provider value={{ showRatingModal, isOpen }}>
      {children}
      <RatingModalContent isOpen={isOpen} onOpenChange={setIsOpen} />
    </RatingModalContext.Provider>
  );
};

interface RatingModalContentProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RatingModalContent = ({ isOpen, onOpenChange }: RatingModalContentProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRate = (value: number) => {
    setRating(value);
  };

  const performLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Rating required", description: "Please select a star rating", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Try to save to Supabase 'user_ratings' table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('user_ratings' as any).insert({
        user_id: user?.id,
        rating,
        feedback,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.warn("Could not save rating to backend:", error);
      }

      toast({ title: "Thank you!", description: "We appreciate your feedback." });
      onOpenChange(false);
      
      // Reset form and logout
      setRating(0);
      setFeedback("");
      
      // Perform logout after submitting rating
      await performLogout();
    } catch (err) {
      console.error("Error submitting rating:", err);
      onOpenChange(false);
      await performLogout();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    onOpenChange(false);
    setRating(0);
    setFeedback("");
    // Logout anyway when skipping
    await performLogout();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // If closing without action, still logout
        handleSkip();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">How's your experience?</DialogTitle>
          <DialogDescription className="text-center">
            Rate your experience with Rigel Genesis before you go. Your feedback helps us improve!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center gap-2 py-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRate(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star 
                className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} 
              />
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <Textarea 
            placeholder="Tell us what you think (optional)..." 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="resize-none"
          />
          
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
              Skip & Logout
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Submitting..." : "Submit & Logout"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Legacy export for backwards compatibility - now just a placeholder
export const RatingModal = () => null;