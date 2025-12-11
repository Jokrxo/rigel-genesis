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

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: typeof THEMES;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('system');
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
          setThemeState(localTheme);
        } else {
          const userTheme = (profile.theme as ThemeName) || 'system';
          setThemeState(userTheme);
          localStorage.setItem('financial-theme', userTheme);
        }
      } else {
        // Use localStorage for guests
        const localTheme = (localStorage.getItem('financial-theme') as ThemeName) || 'system';
        setThemeState(localTheme);
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      const fallbackTheme = (localStorage.getItem('financial-theme') as ThemeName) || 'system';
      setThemeState(fallbackTheme);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (themeName: ThemeName) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    const classList = Array.from(root.classList);
    classList.forEach(className => {
      if (className.startsWith('theme-') || className === 'dark') {
        root.classList.remove(className);
      }
    });
    
    // Handle system theme - converts to light or dark
    if (themeName === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      }
      // Light is default (no class needed)
      return;
    }
    
    // Handle basic dark/light themes
    if (themeName === 'dark') {
      root.classList.add('dark');
      return;
    }
    
    if (themeName === 'light') {
      // Light is default (no class needed)
      return;
    }
    
    // For color themes, check system preference for dark mode variant
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    }
    root.classList.add(`theme-${themeName}`);
  };

  const setTheme = async (newTheme: ThemeName) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem('financial-theme', newTheme);
      applyTheme(newTheme);
      
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

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (!isLoading) {
      applyTheme(theme);
      
      // Listen for system theme changes if system theme is selected
      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system');
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, [theme, isLoading]);

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
    setTheme,
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