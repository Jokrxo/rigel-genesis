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
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        
        // Scroll to element if needed
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    // Give time for UI to settle
    const timer = setTimeout(updatePosition, 500);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearTimeout(timer);
    };
  }, [active, currentStepIndex, steps]);

  const currentStep = steps[currentStepIndex];
  const placement = currentStep?.position || 'bottom';

  // Calculate popover styles based on placement
  const getPopoverStyles = () => {
    const baseStyles: React.CSSProperties = { position: 'absolute' };
    
    switch (placement) {
      case 'top':
        return {
          ...baseStyles,
          bottom: window.innerHeight - position.top + 12,
          left: position.left + position.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: position.top + position.height + 12,
          left: position.left + position.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          ...baseStyles,
          top: position.top + position.height / 2,
          right: window.innerWidth - position.left + 12,
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          ...baseStyles,
          top: position.top + 100, // Offset from top instead of centering for sidebar
          left: position.left + position.width + 12,
          transform: 'translateY(0)'
        };
      default:
        return {
          ...baseStyles,
          top: position.top + position.height + 12,
          left: position.left
        };
    }
  };

  return (
    <TutorialContext.Provider value={{ startTutorial, active, currentStepIndex, nextStep, stopTutorial }}>
      {children}
      {active && steps[currentStepIndex] && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* 4-div Mask Approach */}
          <div className="absolute top-0 left-0 w-full bg-black/50 transition-all duration-300" 
               style={{ height: position.top }} />
          <div className="absolute left-0 w-full bg-black/50 transition-all duration-300" 
               style={{ top: position.top + position.height, bottom: 0 }} />
          <div className="absolute left-0 bg-black/50 transition-all duration-300" 
               style={{ top: position.top, height: position.height, width: position.left }} />
          <div className="absolute right-0 bg-black/50 transition-all duration-300" 
               style={{ top: position.top, height: position.height, left: position.left + position.width }} />
          
          {/* Highlight Box */}
          <div 
            className="absolute border-2 border-primary rounded-md transition-all duration-300 shadow-[0_0_0_4px_rgba(var(--primary),0.2)]"
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
             className="pointer-events-auto bg-card text-card-foreground p-4 rounded-lg shadow-lg border border-border w-80 animate-in zoom-in-95 duration-200"
             style={getPopoverStyles()}
          >
             <div className="flex justify-between items-start mb-2">
                 <h4 className="font-semibold text-sm">Step {currentStepIndex + 1}/{steps.length}</h4>
                 <button onClick={stopTutorial} className="text-muted-foreground hover:text-foreground">
                     <X className="h-4 w-4" />
                 </button>
             </div>
             <p className="text-sm mb-4">{steps[currentStepIndex].content}</p>
             <div className="flex justify-end gap-2">
                 <Button variant="outline" size="sm" onClick={stopTutorial}>
                     Skip
                 </Button>
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
