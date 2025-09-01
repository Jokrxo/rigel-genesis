import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useTheme, THEMES, ThemeName } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  // Group themes by category
  const themeGroups = Object.entries(themes).reduce((acc, [key, themeData]) => {
    const category = themeData.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push([key as ThemeName, themeData]);
    return acc;
  }, {} as Record<string, Array<[ThemeName, typeof themes[ThemeName]]>>);

  const isSelected = (themeName: ThemeName) => theme === themeName;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Theme</h3>
        <p className="text-sm text-muted-foreground">
          Select from {Object.keys(themes).length} carefully crafted themes with optimized contrast for better readability.
        </p>
      </div>

      {Object.entries(themeGroups).map(([category, categoryThemes]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-foreground">{category}</h4>
            <Badge variant="secondary" className="text-xs">
              {categoryThemes.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {categoryThemes.map(([themeName, themeData]) => (
              <ThemeCard
                key={themeName}
                themeName={themeName}
                themeData={themeData}
                isSelected={isSelected(themeName)}
                onSelect={setTheme}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ThemeCardProps {
  themeName: ThemeName;
  themeData: typeof THEMES[ThemeName];
  isSelected: boolean;
  onSelect: (theme: ThemeName) => void;
}

function ThemeCard({ themeName, themeData, isSelected, onSelect }: ThemeCardProps) {
  return (
    <Card 
      className={cn(
        "relative cursor-pointer transition-all duration-200 hover:scale-105",
        "border-2 hover:border-primary/50",
        isSelected && "border-primary shadow-md ring-2 ring-primary/20"
      )}
      onClick={() => onSelect(themeName)}
    >
      <CardContent className="p-3">
        {/* Theme Preview */}
        <div className={cn(
          "aspect-video rounded-md mb-2 relative overflow-hidden border",
          `theme-${themeName === 'system' ? 'light' : themeName}`
        )}>
          <div className="absolute inset-0 bg-background">
            {/* Header simulation */}
            <div className="h-2 bg-primary/10 border-b border-border"></div>
            
            {/* Content simulation */}
            <div className="p-2 space-y-1">
              <div className="h-1 bg-foreground/80 rounded w-3/4"></div>
              <div className="h-1 bg-muted-foreground/60 rounded w-1/2"></div>
              <div className="h-1 bg-muted-foreground/40 rounded w-2/3"></div>
            </div>
            
            {/* Button simulation */}
            <div className="absolute bottom-1 right-1">
              <div className="w-3 h-1.5 bg-primary rounded text-xs"></div>
            </div>
          </div>
        </div>

        {/* Theme Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm">{themeData.icon}</span>
              <span className="font-medium text-sm">{themeData.name}</span>
            </div>
            {isSelected && (
              <Check className="h-3 w-3 text-primary" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {themeData.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}