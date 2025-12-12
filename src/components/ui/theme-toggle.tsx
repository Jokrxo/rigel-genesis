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
  const { setMode, setPalette, theme, themes, isLoading, mode } = useTheme();

  const curatedBasic: [string, any][] = [['light', themes.light], ['dark', themes.dark], ['system', themes.system]];
  const colorGroup: [string, any][] = [
    ['blue', themes.blue], ['green', themes.green], ['purple', themes.purple],
    ['orange', themes.orange], ['red', themes.red], ['pink', themes.pink],
    ['yellow', themes.yellow], ['cyan', themes.cyan], ['lime', themes.lime],
  ];
  const neutralGroup: [string, any][] = [
    ['slate', themes.slate], ['zinc', themes.zinc], ['neutral', themes.neutral], ['stone', themes.stone]
  ];
  const natureGroup: [string, any][] = [
    ['emerald', themes.emerald], ['teal', themes.teal], ['sky', themes.sky]
  ];
  const vibrantGroup: [string, any][] = [
    ['indigo', themes.indigo], ['violet', themes.violet], ['fuchsia', themes.fuchsia], ['rose', themes.rose], ['amber', themes.amber]
  ];

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
            onClick={() => {
              if (['light','dark','system'].includes(themeKey)) setMode(themeKey as any)
              else setPalette(themeKey as any)
            }} 
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {getThemeIcon(themeKey)}
              <span>{themeInfo.name}</span>
              <span className="text-sm opacity-70">{themeInfo.icon}</span>
            </div>
            {(theme === themeKey || (['light','dark','system'].includes(themeKey) && mode === themeKey)) && <span className="text-xs">✓</span>}
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
        // Cycle through basic modes: light -> dark -> system
        if (mode === 'light') setMode('dark' as any);
        else if (mode === 'dark') setMode('system' as any);
        else setMode('light' as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, setMode]);

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
          {mode === 'light' && (
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
          )}
          {mode === 'dark' && (
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
          )}
          {mode === 'system' && (
            <Monitor className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
        {renderThemeGroup(curatedBasic, 'Basic')}
        {renderThemeGroup(colorGroup, 'Colors')}
        {renderThemeGroup(neutralGroup, 'Neutral')}
        {renderThemeGroup(natureGroup, 'Nature')}
        {renderThemeGroup(vibrantGroup, 'Vibrant')}
        <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
          Press ⌘J (Ctrl+J) to cycle basic themes
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
