import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useTheme, THEMES, ThemeName } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

// Helper function to get theme colors for preview
const getThemeColor = (themeName: ThemeName, colorType: string, opacity = 1) => {
  const themeMap: Record<ThemeName, Record<string, string>> = {
    light: {
      background: '#ffffff',
      foreground: '#0f0f0f',
      primary: '#171717',
      'muted-foreground': '#737373',
      border: '#e4e4e7'
    },
    dark: {
      background: '#0a0a0a',
      foreground: '#fafafa',
      primary: '#fafafa',
      'muted-foreground': '#a3a3a3',
      border: '#262626'
    },
    system: {
      background: '#ffffff',
      foreground: '#0f0f0f',
      primary: '#171717',
      'muted-foreground': '#737373',
      border: '#e4e4e7'
    },
    blue: {
      background: '#f0f8ff',
      foreground: '#1e293b',
      primary: '#3b82f6',
      'muted-foreground': '#64748b',
      border: '#cbd5e1'
    },
    green: {
      background: '#f0fdfa',
      foreground: '#1e293b',
      primary: '#10b981',
      'muted-foreground': '#64748b',
      border: '#d1fae5'
    },
    purple: {
      background: '#faf5ff',
      foreground: '#1e293b',
      primary: '#a855f7',
      'muted-foreground': '#64748b',
      border: '#e9d5ff'
    },
    orange: {
      background: '#fff7ed',
      foreground: '#1e293b',
      primary: '#f97316',
      'muted-foreground': '#64748b',
      border: '#fed7aa'
    },
    red: {
      background: '#fef2f2',
      foreground: '#1e293b',
      primary: '#ef4444',
      'muted-foreground': '#64748b',
      border: '#fecaca'
    },
    pink: {
      background: '#fdf2f8',
      foreground: '#1e293b',
      primary: '#ec4899',
      'muted-foreground': '#64748b',
      border: '#fbcfe8'
    },
    yellow: {
      background: '#fefce8',
      foreground: '#1e293b',
      primary: '#eab308',
      'muted-foreground': '#64748b',
      border: '#fef3c7'
    },
    cyan: {
      background: '#ecfeff',
      foreground: '#1e293b',
      primary: '#06b6d4',
      'muted-foreground': '#64748b',
      border: '#a5f3fc'
    },
    lime: {
      background: '#f7fee7',
      foreground: '#1e293b',
      primary: '#84cc16',
      'muted-foreground': '#64748b',
      border: '#d9f99d'
    },
    slate: {
      background: '#f8fafc',
      foreground: '#1e293b',
      primary: '#334155',
      'muted-foreground': '#64748b',
      border: '#cbd5e1'
    },
    zinc: {
      background: '#fafafa',
      foreground: '#18181b',
      primary: '#27272a',
      'muted-foreground': '#71717a',
      border: '#d4d4d8'
    },
    neutral: {
      background: '#fafafa',
      foreground: '#171717',
      primary: '#404040',
      'muted-foreground': '#737373',
      border: '#d4d4d4'
    },
    stone: {
      background: '#fafaf9',
      foreground: '#1c1917',
      primary: '#44403c',
      'muted-foreground': '#78716c',
      border: '#d6d3d1'
    },
    emerald: {
      background: '#ecfdf5',
      foreground: '#1e293b',
      primary: '#059669',
      'muted-foreground': '#64748b',
      border: '#a7f3d0'
    },
    teal: {
      background: '#f0fdfa',
      foreground: '#1e293b',
      primary: '#0d9488',
      'muted-foreground': '#64748b',
      border: '#99f6e4'
    },
    sky: {
      background: '#f0f9ff',
      foreground: '#1e293b',
      primary: '#0ea5e9',
      'muted-foreground': '#64748b',
      border: '#bae6fd'
    },
    indigo: {
      background: '#f0f4ff',
      foreground: '#1e293b',
      primary: '#6366f1',
      'muted-foreground': '#64748b',
      border: '#c7d2fe'
    },
    violet: {
      background: '#f5f3ff',
      foreground: '#1e293b',
      primary: '#8b5cf6',
      'muted-foreground': '#64748b',
      border: '#ddd6fe'
    },
    fuchsia: {
      background: '#fdf4ff',
      foreground: '#1e293b',
      primary: '#d946ef',
      'muted-foreground': '#64748b',
      border: '#f5d0fe'
    },
    rose: {
      background: '#fff1f2',
      foreground: '#1e293b',
      primary: '#f43f5e',
      'muted-foreground': '#64748b',
      border: '#fecdd3'
    },
    amber: {
      background: '#fffbeb',
      foreground: '#1e293b',
      primary: '#f59e0b',
      'muted-foreground': '#64748b',
      border: '#fde68a'
    }
  };

  const color = themeMap[themeName]?.[colorType] || themeMap.light[colorType] || '#000000';
  
  if (opacity === 1) return color;
  
  // Convert hex to rgba for opacity
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

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
        <div className="aspect-video rounded-md mb-2 relative overflow-hidden border bg-background">
          {/* Simulate theme colors with inline styles */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: getThemeColor(themeName, 'background'),
              color: getThemeColor(themeName, 'foreground')
            }}
          >
            {/* Header simulation */}
            <div 
              className="h-2 border-b"
              style={{
                backgroundColor: getThemeColor(themeName, 'primary', 0.1),
                borderColor: getThemeColor(themeName, 'border')
              }}
            ></div>
            
            {/* Content simulation */}
            <div className="p-2 space-y-1">
              <div 
                className="h-1 rounded w-3/4"
                style={{ backgroundColor: getThemeColor(themeName, 'foreground', 0.8) }}
              ></div>
              <div 
                className="h-1 rounded w-1/2"
                style={{ backgroundColor: getThemeColor(themeName, 'muted-foreground', 0.6) }}
              ></div>
              <div 
                className="h-1 rounded w-2/3"
                style={{ backgroundColor: getThemeColor(themeName, 'muted-foreground', 0.4) }}
              ></div>
            </div>
            
            {/* Button simulation */}
            <div className="absolute bottom-1 right-1">
              <div 
                className="w-3 h-1.5 rounded text-xs"
                style={{ backgroundColor: getThemeColor(themeName, 'primary') }}
              ></div>
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