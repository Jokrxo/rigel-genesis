import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define all available themes
export const THEMES = {
  // Basic themes
  light: { name: 'Light', description: 'Clean and bright default theme', icon: '☀️', category: 'Basic' },
  dark: { name: 'Dark', description: 'Comfortable dark theme for low-light environments', icon: '🌙', category: 'Basic' },
  system: { name: 'System', description: 'Automatically adapts to your system preference', icon: '🖥️', category: 'Basic' },
  
  // Color themes
  blue: { name: 'Blue', description: 'Professional blue tones for focused work', icon: '💙', category: 'Color' },
  green: { name: 'Green', description: 'Natural green shades for a calming experience', icon: '💚', category: 'Color' },
  purple: { name: 'Purple', description: 'Creative purple hues for inspiration', icon: '💜', category: 'Color' },
  orange: { name: 'Orange', description: 'Vibrant orange tones for energy and warmth', icon: '🧡', category: 'Color' },
  red: { name: 'Red', description: 'Bold red accents for important work', icon: '❤️', category: 'Color' },
  pink: { name: 'Pink', description: 'Soft pink shades for a gentle interface', icon: '💖', category: 'Color' },
  yellow: { name: 'Yellow', description: 'Bright yellow tones for optimism and clarity', icon: '💛', category: 'Color' },
  cyan: { name: 'Cyan', description: 'Fresh cyan colors for modern aesthetics', icon: '💎', category: 'Color' },
  lime: { name: 'Lime', description: 'Vibrant lime green for high energy', icon: '🟢', category: 'Color' },
  
  // Neutral themes
  slate: { name: 'Slate', description: 'Professional slate gray for corporate environments', icon: '⚫', category: 'Neutral' },
  zinc: { name: 'Zinc', description: 'Modern zinc tones for sleek interfaces', icon: '🔘', category: 'Neutral' },
  neutral: { name: 'Neutral', description: 'Balanced neutral colors for universal appeal', icon: '⚪', category: 'Neutral' },
  stone: { name: 'Stone', description: 'Warm stone colors for comfortable reading', icon: '🪨', category: 'Neutral' },
  
  // Nature-inspired themes
  emerald: { name: 'Emerald', description: 'Rich emerald green for luxury feel', icon: '💎', category: 'Nature' },
  teal: { name: 'Teal', description: 'Sophisticated teal for professional work', icon: '🌊', category: 'Nature' },
  sky: { name: 'Sky', description: 'Clear sky blue for open creativity', icon: '🌤️', category: 'Nature' },
  
  // Vibrant themes
  indigo: { name: 'Indigo', description: 'Deep indigo for thoughtful concentration', icon: '🔮', category: 'Vibrant' },
  violet: { name: 'Violet', description: 'Elegant violet for creative work', icon: '🟣', category: 'Vibrant' },
  fuchsia: { name: 'Fuchsia', description: 'Bold fuchsia for dynamic interfaces', icon: '🌺', category: 'Vibrant' },
  rose: { name: 'Rose', description: 'Sophisticated rose tones for elegance', icon: '🌹', category: 'Vibrant' },
  amber: { name: 'Amber', description: 'Warm amber glow for cozy environments', icon: '🟡', category: 'Vibrant' }
} as const;

export type ThemeName = keyof typeof THEMES;
type ThemeMode = 'light' | 'dark' | 'system';
type ThemePalette = Exclude<ThemeName, 'light' | 'dark' | 'system'>;

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
          console.log('Profile not found, will create on theme change');
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

  const applyTheme = (themeName: ThemeName, modeOverride?: ThemeMode, paletteOverride?: ThemePalette | null) => {
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
  };

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
  }, [theme, mode, palette, isLoading]);

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
