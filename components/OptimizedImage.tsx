'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image component with lazy loading and placeholder
 * Features:
 * - Lazy loading with Intersection Observer
 * - Placeholder while loading
 * - Smooth fade-in transition
 * - Reserved space to prevent layout shift (CLS)
 * - Error handling with fallback
 */
export function OptimizedImage({
  src,
  alt,
  width = '100%',
  height = '100%',
  className = '',
  style = {},
  priority = false,
  objectFit = 'cover',
  placeholderColor = '#e5e7eb',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Optimize GridFS images with query params
  const optimizedSrc = (() => {
    if (!src.startsWith('/api/images/')) return src;

    const params = new URLSearchParams();

    // Convert width/height to numbers if provided
    const w = typeof width === 'number' ? width : parseInt(width as string, 10);
    const h = typeof height === 'number' ? height : parseInt(height as string, 10);

    if (w > 0) params.set('w', Math.round(w).toString());
    if (h > 0) params.set('h', Math.round(h).toString());
    params.set('q', '85'); // Quality
    params.set('f', 'webp'); // Default to WebP format for better compression

    return `${src}?${params.toString()}`;
  })();

  const containerStyle: CSSProperties = {
    position: 'relative',
    width,
    height,
    backgroundColor: placeholderColor,
    overflow: 'hidden',
    ...style,
  };

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
  };

  const placeholderStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: placeholderColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 0 : 1,
    pointerEvents: 'none',
  };

  return (
    <div ref={imgRef} className={className} style={containerStyle}>
      {/* Placeholder */}
      <div style={placeholderStyle}>
        {!hasError && (
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0,0,0,0.1)',
              borderTopColor: 'rgba(0,0,0,0.3)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        )}
        {hasError && (
          <div
            style={{
              color: 'rgba(0,0,0,0.4)',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            Failed to load
          </div>
        )}
      </div>

      {/* Actual Image */}
      {isInView && !hasError && (
        <img
          src={optimizedSrc}
          alt={alt}
          style={imgStyle}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Simple skeleton loader component
 */
export function ImageSkeleton({
  width = '100%',
  height = '100%',
  className = '',
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        backgroundColor: '#e5e7eb',
        backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
