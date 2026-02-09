/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { THEMES } from '@/constants/theme';
import type { ThemeName, ThemeMode, ThemePalette } from '@/constants/theme';

// Re-export for consumers
export { THEMES };
export type { ThemeName, ThemeMode, ThemePalette };

interface ThemeContextType {
  theme: ThemeName;
  mode: ThemeMode;
  palette: ThemePalette | null;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette | null) => void;
  themes: typeof THEMES;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('system');
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [palette, setPaletteState] = useState<ThemePalette | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize theme from localStorage or user profile
  const initializeTheme = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch theme from user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('theme')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          const localTheme = (localStorage.getItem('financial-theme') as ThemeName) || 'system';
          const localMode = (localStorage.getItem('financial-mode') as ThemeMode) || (localTheme === 'dark' ? 'dark' : 'system');
          const localPalette = (localStorage.getItem('financial-palette') as ThemePalette | null) || (['light','dark','system'].includes(localTheme) ? null : (localTheme as ThemePalette));
          setThemeState(localTheme);
          setModeState(localMode);
          setPaletteState(localPalette);
        } else {
          const userTheme = (profile.theme as ThemeName) || 'system';
          const derivedMode: ThemeMode = ['light','dark','system'].includes(userTheme) ? (userTheme as ThemeMode) : 'system';
          const derivedPalette: ThemePalette | null = ['light','dark','system'].includes(userTheme) ? null : (userTheme as ThemePalette);
          setThemeState(userTheme);
          setModeState(derivedMode);
          setPaletteState(derivedPalette);
          localStorage.setItem('financial-theme', userTheme);
          localStorage.setItem('financial-mode', derivedMode);
          if (derivedPalette) localStorage.setItem('financial-palette', derivedPalette);
          else localStorage.removeItem('financial-palette');
        }
      } else {
        // Use localStorage for guests
        const localTheme = (localStorage.getItem('financial-theme') as ThemeName) || 'system';
        const localMode = (localStorage.getItem('financial-mode') as ThemeMode) || (localTheme === 'dark' ? 'dark' : 'system');
        const localPalette = (localStorage.getItem('financial-palette') as ThemePalette | null) || (['light','dark','system'].includes(localTheme) ? null : (localTheme as ThemePalette));
        setThemeState(localTheme);
        setModeState(localMode);
        setPaletteState(localPalette);
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      const fallbackTheme = (localStorage.getItem('financial-theme') as ThemeName) || 'system';
      const fallbackMode = (localStorage.getItem('financial-mode') as ThemeMode) || (fallbackTheme === 'dark' ? 'dark' : 'system');
      const fallbackPalette = (localStorage.getItem('financial-palette') as ThemePalette | null) || (['light','dark','system'].includes(fallbackTheme) ? null : (fallbackTheme as ThemePalette));
      setThemeState(fallbackTheme);
      setModeState(fallbackMode);
      setPaletteState(fallbackPalette);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = useCallback((themeName: ThemeName, modeOverride?: ThemeMode, paletteOverride?: ThemePalette | null) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    const classList = Array.from(root.classList);
    classList.forEach(className => {
      if (className.startsWith('theme-') || className === 'dark') {
        root.classList.remove(className);
      }
    });
    
    const effectiveMode: ThemeMode = modeOverride ?? (['light','dark','system'].includes(themeName) ? (themeName as ThemeMode) : mode);
    const effectivePalette: ThemePalette | null = paletteOverride ?? (['light','dark','system'].includes(themeName) ? null : (themeName as ThemePalette)) ?? palette;

    if (effectiveMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
    } else if (effectiveMode === 'dark') {
      root.classList.add('dark');
    }

    if (effectivePalette) {
      root.classList.add(`theme-${effectivePalette}`);
    }
  }, [mode, palette]);

  const setTheme = async (newTheme: ThemeName) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem('financial-theme', newTheme);
      if (['light','dark','system'].includes(newTheme)) {
        const m = newTheme as ThemeMode;
        setModeState(m);
        localStorage.setItem('financial-mode', m);
        setPaletteState(null);
        localStorage.removeItem('financial-palette');
        applyTheme(newTheme, m, null);
      } else {
        const p = newTheme as ThemePalette;
        setPaletteState(p);
        localStorage.setItem('financial-palette', p);
        applyTheme(newTheme, mode, p);
      }
      
      // Update user profile if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            user_id: user.id, 
            theme: newTheme 
          }, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });
          
        if (error) {
          console.error('Error updating theme preference:', error);
          toast({
            title: "Theme saved locally",
            description: "Your theme preference couldn't be synced but has been saved locally.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error setting theme:', error);
      toast({
        title: "Error",
        description: "Failed to save theme preference.",
        variant: "destructive"
      });
    }
  };

  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      localStorage.setItem('financial-mode', newMode);
      const savedPalette = palette;
      const derivedTheme: ThemeName = savedPalette ? (savedPalette as ThemeName) : newMode;
      setThemeState(derivedTheme);
      localStorage.setItem('financial-theme', derivedTheme);
      applyTheme(derivedTheme, newMode, savedPalette ?? null);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .upsert({ user_id: user.id, theme: derivedTheme }, { onConflict: 'user_id', ignoreDuplicates: false });
      }
    } catch (error) {
      console.error('Error setting mode:', error);
      toast({ title: "Error", description: "Failed to save theme mode.", variant: "destructive" });
    }
  };

  const setPalette = async (newPalette: ThemePalette | null) => {
    try {
      setPaletteState(newPalette);
      if (newPalette) localStorage.setItem('financial-palette', newPalette);
      else localStorage.removeItem('financial-palette');
      const derivedTheme: ThemeName = newPalette ? (newPalette as ThemeName) : mode;
      setThemeState(derivedTheme);
      localStorage.setItem('financial-theme', derivedTheme);
      applyTheme(derivedTheme, mode, newPalette ?? null);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .upsert({ user_id: user.id, theme: derivedTheme }, { onConflict: 'user_id', ignoreDuplicates: false });
      }
    } catch (error) {
      console.error('Error setting palette:', error);
      toast({ title: "Error", description: "Failed to save theme palette.", variant: "destructive" });
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (!isLoading) {
      applyTheme(theme, mode, palette);
      
      // Listen for system theme changes if system theme is selected
      if (mode === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme(theme, 'system', palette);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, [theme, mode, palette, isLoading, applyTheme]);

  // Listen for auth state changes to reinitialize theme
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setTimeout(() => initializeTheme(), 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    theme,
    mode,
    palette,
    setTheme,
    setMode,
    setPalette,
    themes: THEMES,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
