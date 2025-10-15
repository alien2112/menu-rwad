'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Theme {
  background?: string;
  foreground?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  card?: string;
  'card-foreground'?: string;
  muted?: string;
  'muted-foreground'?: string;
  ring?: string;
  'scroll-thumb-start'?: string;
  'scroll-thumb-end'?: string;
  'scroll-track'?: string;
}

interface ThemeContextType {
  theme: Theme | null;
  loading: boolean;
  error: string | null;
  updateTheme: (newTheme: Theme) => Promise<boolean>;
  resetTheme: () => Promise<boolean>;
  refetchTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme | null;
}

/**
 * ThemeProvider component that manages theme state and provides theme operations
 *
 * Usage:
 * ```tsx
 * import { ThemeProvider } from '@/contexts/ThemeContext';
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme | null>(initialTheme || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch the current theme from the API
   */
  const refetchTheme = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/theme', { cache: 'no-store' });
      const data = await response.json();

      if (response.ok && data.success) {
        setTheme(data.theme || null);
      } else {
        throw new Error(data.error || 'Failed to fetch theme');
      }
    } catch (err: any) {
      console.error('[ThemeContext] Error fetching theme:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update the theme with new values
   */
  const updateTheme = useCallback(async (newTheme: Theme): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: newTheme }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTheme(data.theme || null);
        // Apply theme immediately to DOM
        applyThemeToDOM(data.theme);
        return true;
      } else {
        throw new Error(data.error || 'Failed to update theme');
      }
    } catch (err: any) {
      console.error('[ThemeContext] Error updating theme:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset the theme to default values
   */
  const resetTheme = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetTheme: true }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTheme(null);
        // Remove theme overrides from DOM
        clearThemeFromDOM();
        return true;
      } else {
        throw new Error(data.error || 'Failed to reset theme');
      }
    } catch (err: any) {
      console.error('[ThemeContext] Error resetting theme:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch theme on mount
  useEffect(() => {
    if (!initialTheme) {
      refetchTheme();
    }
  }, [initialTheme, refetchTheme]);

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    if (theme) {
      applyThemeToDOM(theme);
    }
    return () => {
      // Cleanup on unmount
      if (theme) {
        clearThemeFromDOM();
      }
    };
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    loading,
    error,
    updateTheme,
    resetTheme,
    refetchTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to use the theme context
 *
 * Usage:
 * ```tsx
 * import { useTheme } from '@/contexts/ThemeContext';
 *
 * function MyComponent() {
 *   const { theme, updateTheme, resetTheme, loading } = useTheme();
 *
 *   const handleUpdateTheme = async () => {
 *     await updateTheme({ primary: '#FF0000' });
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Apply theme colors to the DOM as CSS variables
 */
function applyThemeToDOM(theme: Theme | null) {
  if (!theme || typeof window === 'undefined') return;

  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      // Convert HEX to HSL triplet if needed
      const hslValue = convertToHSL(value.trim());
      root.style.setProperty(`--${key}`, hslValue);
    }
  });
}

/**
 * Clear theme CSS variables from the DOM
 */
function clearThemeFromDOM() {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const themeKeys = [
    'background',
    'foreground',
    'primary',
    'secondary',
    'accent',
    'card',
    'card-foreground',
    'muted',
    'muted-foreground',
    'ring',
    'scroll-thumb-start',
    'scroll-thumb-end',
    'scroll-track',
  ];

  themeKeys.forEach((key) => {
    root.style.removeProperty(`--${key}`);
  });
}

/**
 * Convert HEX color to HSL triplet format (e.g., "240 100% 50%")
 * If the input is already in HSL format, return it as-is
 */
function convertToHSL(value: string): string {
  // If it's already an HSL triplet or contains spaces/%, return as-is
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value;
  }

  // Convert HEX to HSL
  const hex = value.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  const H = Math.round(h * 360);
  const S = Math.round(s * 100);
  const L = Math.round(l * 100);

  return `${H} ${S}% ${L}%`;
}
