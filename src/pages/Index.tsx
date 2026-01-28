import { Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cosmic">
      {/* Nebula gradient overlay */}
      <div className="absolute inset-0 bg-nebula pointer-events-none" />
      
      {/* Decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="star w-1 h-1 top-[15%] left-[10%]" style={{ animationDelay: '0s' }} />
        <div className="star w-0.5 h-0.5 top-[25%] left-[25%]" style={{ animationDelay: '1s' }} />
        <div className="star w-1 h-1 top-[10%] left-[45%]" style={{ animationDelay: '0.5s' }} />
        <div className="star w-0.5 h-0.5 top-[35%] left-[70%]" style={{ animationDelay: '2s' }} />
        <div className="star w-1 h-1 top-[20%] left-[85%]" style={{ animationDelay: '1.5s' }} />
        <div className="star w-0.5 h-0.5 top-[50%] left-[15%]" style={{ animationDelay: '2.5s' }} />
        <div className="star w-1 h-1 top-[60%] left-[80%]" style={{ animationDelay: '0.8s' }} />
        <div className="star w-0.5 h-0.5 top-[75%] left-[35%]" style={{ animationDelay: '1.8s' }} />
        <div className="star w-1 h-1 top-[85%] left-[60%]" style={{ animationDelay: '0.3s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="animate-float">
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full" />
              <Sparkles className="relative h-16 w-16 text-primary animate-pulse-slow" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-gradient-cosmic text-center mb-4">
          Rigel Application Genesis
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground text-center max-w-md mb-8">
          Your blank canvas awaits. Start building something extraordinary.
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
          <span>Ready for liftoff</span>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
