'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';

interface ThemeRootProps {
  initialTheme: Record<string, string> | null;
  children: React.ReactNode;
}

function ThemeRoot({ initialTheme, children }: ThemeRootProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <CartProvider>
        {children}
      </CartProvider>
    </ThemeProvider>
  );
}

export default ThemeRoot;


