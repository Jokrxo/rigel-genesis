
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
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePalette = Exclude<ThemeName, 'light' | 'dark' | 'system'>;
