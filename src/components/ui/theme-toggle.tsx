import * as React from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme, themes, isLoading } = useTheme();

  // Group themes by category
  const basicThemes = Object.entries(themes).filter(([_, info]) => info.category === 'Basic');
  const colorThemes = Object.entries(themes).filter(([_, info]) => info.category === 'Color');
  const neutralThemes = Object.entries(themes).filter(([_, info]) => info.category === 'Neutral');
  const natureThemes = Object.entries(themes).filter(([_, info]) => info.category === 'Nature');
  const vibrantThemes = Object.entries(themes).filter(([_, info]) => info.category === 'Vibrant');

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  const renderThemeGroup = (themeEntries: [string, any][], title: string) => {
    if (themeEntries.length === 0) return null;
    
    return (
      <div key={title}>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
          {title}
        </DropdownMenuLabel>
        {themeEntries.map(([themeKey, themeInfo]) => (
          <DropdownMenuItem 
            key={themeKey}
            onClick={() => setTheme(themeKey as any)} 
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {getThemeIcon(themeKey)}
              <span>{themeInfo.name}</span>
              <span className="text-sm opacity-70">{themeInfo.icon}</span>
            </div>
            {theme === themeKey && <span className="text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
      </div>
    );
  };

  // Add keyboard shortcut for quick toggle
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'j') {
        event.preventDefault();
        // Cycle through basic themes: light -> dark -> system
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [theme, setTheme]);

  if (isLoading) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Monitor className="h-[1.2rem] w-[1.2rem] animate-pulse" />
        <span className="sr-only">Loading theme...</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {theme === 'light' && (
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
          )}
          {theme === 'dark' && (
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
          )}
          {theme === 'system' && (
            <Monitor className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
          )}
          {!['light', 'dark', 'system'].includes(theme) && (
            <Palette className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
        {renderThemeGroup(basicThemes, 'Basic')}
        {renderThemeGroup(colorThemes, 'Colors')}
        {renderThemeGroup(neutralThemes, 'Neutral')}
        {renderThemeGroup(natureThemes, 'Nature')}
        {renderThemeGroup(vibrantThemes, 'Vibrant')}
        <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
          Press ⌘J (Ctrl+J) to cycle basic themes
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}