import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useTheme, THEMES, ThemeName, ThemeMode, ThemePalette } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function ThemeSelector() {
  const { theme, mode, setMode, setPalette, themes } = useTheme();
  const { toast } = useToast();

  const basic: ThemeName[] = ['light', 'dark', 'system'];
  const color: ThemeName[] = ['blue','green','purple','orange','red','pink','yellow','cyan','lime'];
  const neutral: ThemeName[] = ['slate','zinc','neutral','stone'];
  const nature: ThemeName[] = ['emerald','teal','sky'];
  const vibrant: ThemeName[] = ['indigo','violet','fuchsia','rose','amber'];

  const groups: Array<{ title: string; keys: ThemeName[] }> = [
    { title: 'Basic', keys: basic },
    { title: 'Colors', keys: color },
    { title: 'Neutral', keys: neutral },
    { title: 'Nature', keys: nature },
    { title: 'Vibrant', keys: vibrant },
  ];

  const handleThemeSelect = (themeName: ThemeName) => {
    if (['light', 'dark', 'system'].includes(themeName)) {
      setMode(themeName as ThemeMode);
      toast({ title: 'Mode Changed', description: `Switched to ${themes[themeName].name}` });
    } else {
      setPalette(themeName as ThemePalette);
      const variant = mode === 'dark' ? 'dark' : 'light';
      toast({ title: 'Theme Changed', description: `Switched to ${themes[themeName].name} (${variant})` });
    }
  };

  const isSelected = (themeName: ThemeName) => theme === themeName;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Theme</h3>
        <p className="text-sm text-muted-foreground">Trimmed, curated selection for clarity and consistency.</p>
      </div>

      {groups.map(({ title, keys }) => (
        <div key={title} className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-foreground">{title}</h4>
            <Badge variant="secondary" className="text-xs">{keys.length}</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {keys.map((themeName) => (
              <ThemeCard
                key={themeName}
                themeName={themeName}
                themeData={themes[themeName]}
                isSelected={isSelected(themeName)}
                onSelect={handleThemeSelect}
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
  const getPreviewColors = (theme: ThemeName) => {
    const colors = {
      light: { bg: '#ffffff', fg: '#0f0f0f', primary: '#171717', muted: '#737373', border: '#e4e4e7' },
      dark: { bg: '#0a0a0a', fg: '#fafafa', primary: '#fafafa', muted: '#a3a3a3', border: '#262626' },
      blue: { bg: '#f0f8ff', fg: '#1e293b', primary: '#3b82f6', muted: '#64748b', border: '#cbd5e1' },
      green: { bg: '#f0fdfa', fg: '#1e293b', primary: '#10b981', muted: '#64748b', border: '#d1fae5' },
      purple: { bg: '#faf5ff', fg: '#1e293b', primary: '#a855f7', muted: '#64748b', border: '#e9d5ff' },
      orange: { bg: '#fff7ed', fg: '#1e293b', primary: '#f97316', muted: '#64748b', border: '#fed7aa' },
      red: { bg: '#fef2f2', fg: '#1e293b', primary: '#ef4444', muted: '#64748b', border: '#fecaca' },
      pink: { bg: '#fdf2f8', fg: '#1e293b', primary: '#ec4899', muted: '#64748b', border: '#fbcfe8' },
      yellow: { bg: '#fefce8', fg: '#1e293b', primary: '#eab308', muted: '#64748b', border: '#fef3c7' },
      cyan: { bg: '#ecfeff', fg: '#1e293b', primary: '#06b6d4', muted: '#64748b', border: '#a5f3fc' },
      lime: { bg: '#f7fee7', fg: '#1e293b', primary: '#84cc16', muted: '#64748b', border: '#d9f99d' },
      slate: { bg: '#f8fafc', fg: '#1e293b', primary: '#334155', muted: '#64748b', border: '#cbd5e1' },
      zinc: { bg: '#fafafa', fg: '#18181b', primary: '#27272a', muted: '#71717a', border: '#d4d4d8' },
      neutral: { bg: '#fafafa', fg: '#171717', primary: '#404040', muted: '#737373', border: '#d4d4d4' },
      stone: { bg: '#fafaf9', fg: '#1c1917', primary: '#44403c', muted: '#78716c', border: '#d6d3d1' },
      emerald: { bg: '#ecfdf5', fg: '#1e293b', primary: '#059669', muted: '#64748b', border: '#a7f3d0' },
      teal: { bg: '#f0fdfa', fg: '#1e293b', primary: '#0d9488', muted: '#64748b', border: '#99f6e4' },
      sky: { bg: '#f0f9ff', fg: '#1e293b', primary: '#0ea5e9', muted: '#64748b', border: '#bae6fd' },
      indigo: { bg: '#f0f4ff', fg: '#1e293b', primary: '#6366f1', muted: '#64748b', border: '#c7d2fe' },
      violet: { bg: '#f5f3ff', fg: '#1e293b', primary: '#8b5cf6', muted: '#64748b', border: '#ddd6fe' },
      fuchsia: { bg: '#fdf4ff', fg: '#1e293b', primary: '#d946ef', muted: '#64748b', border: '#f5d0fe' },
      rose: { bg: '#fff1f2', fg: '#1e293b', primary: '#f43f5e', muted: '#64748b', border: '#fecdd3' },
      amber: { bg: '#fffbeb', fg: '#1e293b', primary: '#f59e0b', muted: '#64748b', border: '#fde68a' },
      system: { bg: '#ffffff', fg: '#0f0f0f', primary: '#171717', muted: '#737373', border: '#e4e4e7' }
    };
    return colors[theme] || colors.light;
  };

  const colors = getPreviewColors(themeName);

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
        <div 
          className="aspect-video rounded-md mb-2 relative overflow-hidden border"
          style={{ backgroundColor: colors.bg, borderColor: colors.border }}
        >
          <div className="absolute inset-0" style={{ color: colors.fg }}>
            {/* Header simulation */}
            <div 
              className="h-2 border-b"
              style={{ 
                backgroundColor: colors.primary + '1A', 
                borderColor: colors.border 
              }}
            ></div>
            
            {/* Content simulation */}
            <div className="p-2 space-y-1">
              <div 
                className="h-1 rounded w-3/4"
                style={{ backgroundColor: colors.fg }}
              ></div>
              <div 
                className="h-1 rounded w-1/2"
                style={{ backgroundColor: colors.muted }}
              ></div>
              <div 
                className="h-1 rounded w-2/3"
                style={{ backgroundColor: colors.muted + '80' }}
              ></div>
            </div>
            
            {/* Button simulation */}
            <div className="absolute bottom-1 right-1">
              <div 
                className="w-3 h-1.5 rounded"
                style={{ backgroundColor: colors.primary }}
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
