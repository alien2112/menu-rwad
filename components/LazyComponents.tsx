'use client';

import dynamic from 'next/dynamic';
import { ComponentType, useState, useEffect, useRef } from 'react';

/**
 * Lazy-loaded components with loading states
 * Uses dynamic imports with Next.js for code splitting
 */

// Loading placeholder component
const LoadingPlaceholder = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Lazy load admin dashboard components (heavy components)
export const LazyEnhancedAdminDashboard = dynamic(
  () => import('./EnhancedAdminDashboard'),
  {
    loading: () => <LoadingPlaceholder message="Loading dashboard..." />,
    ssr: false, // Admin dashboard doesn't need SSR
  }
);

export const LazyComprehensiveAnalyticsDashboard = dynamic(
  () => import('./ComprehensiveAnalyticsDashboard'),
  {
    loading: () => <LoadingPlaceholder message="Loading analytics..." />,
    ssr: false,
  }
);

export const LazyBulkOperationsPanel = dynamic(
  () => import('./BulkOperationsPanel'),
  {
    loading: () => <LoadingPlaceholder message="Loading operations..." />,
    ssr: false,
  }
);

export const LazyStaffManagementPanel = dynamic(
  () => import('./StaffManagementPanel'),
  {
    loading: () => <LoadingPlaceholder message="Loading staff management..." />,
    ssr: false,
  }
);

export const LazyPrinterManagementPanel = dynamic(
  () => import('./PrinterManagementPanel'),
  {
    loading: () => <LoadingPlaceholder message="Loading printer settings..." />,
    ssr: false,
  }
);

export const LazyTaxComplianceSettings = dynamic(
  () => import('./TaxComplianceSettings'),
  {
    loading: () => <LoadingPlaceholder message="Loading tax settings..." />,
    ssr: false,
  }
);

export const LazyWasteLoggingPanel = dynamic(
  () => import('./WasteLoggingPanel'),
  {
    loading: () => <LoadingPlaceholder message="Loading waste logs..." />,
    ssr: false,
  }
);

export const LazyExportPanel = dynamic(
  () => import('./ExportPanel'),
  {
    loading: () => <LoadingPlaceholder message="Loading export tools..." />,
    ssr: false,
  }
);

// Lazy load modals (only load when needed)
export const LazyReviewModal = dynamic(
  () => import('./ReviewModal').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingPlaceholder message="Loading review form..." />,
    ssr: false,
  }
);

export const LazyMenuItemCustomizationModal = dynamic(
  () => import('./MenuItemCustomizationModal'),
  {
    loading: () => <LoadingPlaceholder message="Loading customization..." />,
    ssr: false,
  }
);

export const LazyOrderConfirmationModal = dynamic(
  () => import('./OrderConfirmationModal'),
  {
    loading: () => <LoadingPlaceholder message="Loading confirmation..." />,
    ssr: false,
  }
);

// Lazy load notification center (not critical for initial render)
export const LazyNotificationCenter = dynamic(
  () => import('./NotificationCenter'),
  {
    loading: () => null, // No loading state for notification center
    ssr: false,
  }
);

export const LazyWebSocketNotificationCenter = dynamic(
  () => import('./WebSocketNotificationCenter'),
  {
    loading: () => null,
    ssr: false,
  }
);

// Lazy load sliders (below the fold content)
export const LazyOffersSlider = dynamic(
  () => import('./OffersSlider'),
  {
    loading: () => <LoadingPlaceholder message="Loading offers..." />,
    ssr: true, // Can be server-rendered
  }
);

export const LazySignatureDrinksSlider = dynamic(
  () => import('./SignatureDrinksSlider'),
  {
    loading: () => <LoadingPlaceholder message="Loading signature drinks..." />,
    ssr: true,
  }
);

export const LazyReviewsSlider = dynamic(
  () => import('./ReviewsSlider'),
  {
    loading: () => <LoadingPlaceholder message="Loading reviews..." />,
    ssr: true,
  }
);

// Lazy load journey section (below the fold)
export const LazyJourneySection = dynamic(
  () => import('./JourneySection'),
  {
    loading: () => <LoadingPlaceholder message="Loading..." />,
    ssr: true,
  }
);

/**
 * Generic lazy component loader
 * Use this for custom components that need lazy loading
 */
export function createLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    loadingMessage?: string;
    ssr?: boolean;
  } = {}
) {
  return dynamic(importFn, {
    loading: () => <LoadingPlaceholder message={options.loadingMessage || 'Loading...'} />,
    ssr: options.ssr !== false,
  });
}

/**
 * Lazy load component only when visible in viewport
 * Useful for below-the-fold content
 */
export function createIntersectionLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const LazyComponent = dynamic(importFn, {
    loading: () => <LoadingPlaceholder />,
    ssr: false,
  });

  return function IntersectionLazyWrapper(props: P) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: options.rootMargin || '100px',
          threshold: options.threshold || 0.01,
        }
      );

      observer.observe(ref.current);

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={ref}>
        {isVisible ? <LazyComponent {...props} /> : <LoadingPlaceholder />}
      </div>
    );
  };
}
