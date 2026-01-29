import { createContext, useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X } from "lucide-react";

interface TutorialStep {
  target: string; // CSS selector
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TutorialContextType {
  startTutorial: (steps: TutorialStep[]) => void;
  active: boolean;
  currentStepIndex: number;
  nextStep: () => void;
  stopTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) throw new Error("useTutorial must be used within a TutorialProvider");
  return context;
};

export const TutorialProvider = ({ children }: { children: React.ReactNode }) => {
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const startTutorial = (newSteps: TutorialStep[]) => {
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setActive(true);
  };

  const stopTutorial = () => {
    setActive(false);
    setSteps([]);
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      stopTutorial();
    }
  };

  // Update position based on target
  useEffect(() => {
    if (!active || !steps[currentStepIndex]) return;

    const updatePosition = () => {
      const targetEl = document.querySelector(steps[currentStepIndex].target);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
        
        // Scroll to element if needed
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    // Give time for UI to settle
    const timer = setTimeout(updatePosition, 500);

    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timer);
    };
  }, [active, currentStepIndex, steps]);

  return (
    <TutorialContext.Provider value={{ startTutorial, active, currentStepIndex, nextStep, stopTutorial }}>
      {children}
      {active && steps[currentStepIndex] && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Backdrop with hole */}
          <div className="absolute inset-0 bg-black/50 transition-all duration-300" style={{
            clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              0% ${position.top}px, 
              ${position.left}px ${position.top}px, 
              ${position.left}px ${position.top + position.height}px, 
              ${position.left + position.width}px ${position.top + position.height}px, 
              ${position.left + position.width}px ${position.top}px, 
              100% ${position.top}px, 
              100% 100%, 
              100% 0%
            )`
            // Note: Clip-path approach for "hole" is tricky with complex shapes, 
            // simpler approach is using 4 divs around the target or a massive box-shadow.
            // For simplicity in this prototype, we'll just use a floating card and no dark backdrop 
            // or a simple semi-transparent overlay that doesn't block clicks on target (pointer-events-none)
          }}></div>
          
          {/* Highlight Box */}
          <div 
            className="absolute border-2 border-primary rounded-md transition-all duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
            style={{
              top: position.top - 4,
              left: position.left - 4,
              width: position.width + 8,
              height: position.height + 8,
              pointerEvents: 'none'
            }}
          />

          {/* Pointer/Popover */}
          <div 
             className="absolute pointer-events-auto bg-card text-card-foreground p-4 rounded-lg shadow-lg border border-border w-64 animate-in zoom-in-95 duration-200"
             style={{
                 top: position.top + position.height + 12,
                 left: position.left
             }}
          >
             <div className="flex justify-between items-start mb-2">
                 <h4 className="font-semibold text-sm">Step {currentStepIndex + 1}/{steps.length}</h4>
                 <button onClick={stopTutorial} className="text-muted-foreground hover:text-foreground">
                     <X className="h-4 w-4" />
                 </button>
             </div>
             <p className="text-sm mb-4">{steps[currentStepIndex].content}</p>
             <div className="flex justify-end">
                 <Button size="sm" onClick={nextStep}>
                     {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                 </Button>
             </div>
          </div>
        </div>
      )}
    </TutorialContext.Provider>
  );
};
