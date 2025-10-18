'use client';

import { usePathname } from 'next/navigation';
import { CartProvider } from '@/contexts/CartContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ReactNode } from 'react';

interface PublicLayoutWrapperProps {
  children: ReactNode;
}

/**
 * Conditionally wraps children with public-only providers.
 * Admin routes bypass these providers to maintain complete isolation.
 */
export function PublicLayoutWrapper({ children }: PublicLayoutWrapperProps) {
  const pathname = usePathname();

  // Check if current route is under /admin or /login
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

  // Admin and login routes: render children directly without public providers
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Public routes: wrap with cart, language, and language switcher
  return (
    <LanguageProvider>
      <CartProvider>
        {children}
        <LanguageSwitcher />
      </CartProvider>
    </LanguageProvider>
  );
}
