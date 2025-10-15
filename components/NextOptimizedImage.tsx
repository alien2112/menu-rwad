'use client';

import Image from 'next/image';
import { useState, CSSProperties } from 'react';

interface NextOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Next.js Optimized Image Component
 *
 * Uses Next.js built-in Image component for:
 * - Automatic WebP/AVIF conversion
 * - Responsive images with srcset
 * - Lazy loading by default
 * - Blur placeholder support
 * - Automatic size optimization
 *
 * Usage:
 * ```tsx
 * // Fixed size
 * <NextOptimizedImage src="/image.jpg" alt="My image" width={400} height={300} />
 *
 * // Fill container
 * <NextOptimizedImage src="/image.jpg" alt="My image" fill objectFit="cover" />
 *
 * // Responsive
 * <NextOptimizedImage
 *   src="/image.jpg"
 *   alt="My image"
 *   width={800}
 *   height={600}
 *   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 * />
 * ```
 */
export function NextOptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  style = {},
  priority = false,
  quality = 85,
  sizes,
  objectFit = 'cover',
  placeholderColor = '#e5e7eb',
  onLoad,
  onError,
}: NextOptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // For external URLs or GridFS images, use unoptimized mode
  const isExternal = src.startsWith('http') || src.startsWith('/api/images/');

  // Determine if we should use fill or fixed dimensions
  const useFill = fill || (!width && !height);

  const imageProps = {
    src,
    alt,
    quality,
    priority,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    onLoad: handleLoad,
    onError: handleError,
    unoptimized: isExternal,
    className: `${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`,
    style: {
      ...style,
      objectFit: useFill ? objectFit : undefined,
    },
    sizes: sizes || (useFill ? '100vw' : undefined),
  };

  const containerStyle: CSSProperties = {
    position: useFill ? 'relative' : undefined,
    backgroundColor: placeholderColor,
    overflow: 'hidden',
    ...(useFill ? style : {}),
  };

  if (hasError) {
    return (
      <div className={className} style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: '14px' }}>Image not available</span>
      </div>
    );
  }

  if (useFill) {
    return (
      <div className={className} style={containerStyle}>
        <Image
          {...imageProps}
          fill
          className={imageProps.className}
        />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      width={width!}
      height={height!}
    />
  );
}

/**
 * Optimized Avatar Image Component
 * Pre-configured for profile pictures and avatars
 */
export function OptimizedAvatar({
  src,
  alt = 'Avatar',
  size = 40,
  className = '',
  priority = false,
}: {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <NextOptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      objectFit="cover"
      priority={priority}
      quality={80}
    />
  );
}

/**
 * Optimized Product Image Component
 * Pre-configured for menu items and products
 */
export function OptimizedProductImage({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <NextOptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      objectFit="cover"
      priority={priority}
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

/**
 * Optimized Hero Image Component
 * Pre-configured for hero banners and large images
 */
export function OptimizedHeroImage({
  src,
  alt,
  className = '',
  priority = true,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <NextOptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      objectFit="cover"
      priority={priority}
      quality={90}
      sizes="100vw"
    />
  );
}
