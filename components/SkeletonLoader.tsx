import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full', 
  rounded = true 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200/30 ${height} ${width} ${
        rounded ? 'rounded' : ''
      } ${className}`}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-effect rounded-3xl p-6 ${className}`}>
    <Skeleton height="h-48" className="mb-4" />
    <Skeleton height="h-6" width="w-3/4" className="mb-2" />
    <Skeleton height="h-4" width="w-1/2" />
  </div>
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index}
        height="h-4" 
        width={index === lines - 1 ? 'w-3/4' : 'w-full'}
        className="mb-2"
      />
    ))}
  </div>
);

export const SkeletonImage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Skeleton height="h-64" className={`rounded-2xl ${className}`} />
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Skeleton height="h-12" width="w-32" className={`rounded-full ${className}`} />
);

// Journey skeleton (restored for JourneySection fallback)
export const JourneySkeleton: React.FC = () => (
  <div className="px-6 space-y-8 md:px-8 lg:px-12">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="glass-notification rounded-3xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <SkeletonImage className="w-full md:w-80 h-64 md:h-80" />
          <div className="flex-1 space-y-4">
            <SkeletonText lines={3} />
            <SkeletonButton />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Loading states for specific components
export const SignatureDrinksSkeleton: React.FC = () => (
  <div className="w-full">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  </div>
);

export const OffersSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="glass-effect rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <SkeletonImage className="w-24 h-24 flex-shrink-0" />
          <div className="flex-1">
            <SkeletonText lines={2} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Menu-specific skeleton components
export const MenuPageSkeleton: React.FC = () => (
  <div className="relative z-10 px-6 pb-8 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
    {/* Menu Header Skeleton */}
    <div className="glass-effect rounded-3xl p-6 mb-8">
      <Skeleton height="h-8" width="w-48" className="mb-4 mx-auto" />
      <Skeleton height="h-4" width="w-64" className="mx-auto" />
    </div>
    
    {/* Menu Grid Skeleton */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <MenuCategorySkeleton key={index} />
      ))}
    </div>
  </div>
);

export const MenuCategorySkeleton: React.FC = () => (
  <div className="glass-effect rounded-3xl p-6 text-center hover:scale-105 transition-transform duration-300">
    <div className="w-16 h-16 mx-auto mb-4">
      <Skeleton height="h-16" width="w-16" className="rounded-full" />
    </div>
    <Skeleton height="h-6" width="w-24" className="mx-auto mb-2" />
    <Skeleton height="h-4" width="w-20" className="mx-auto" />
  </div>
);

// Menu items skeleton for category pages
export const MenuItemsSkeleton: React.FC = () => (
  <div className="px-6 py-8 md:px-8 lg:px-12">
    {/* Category Header Skeleton */}
    <div className="glass-effect rounded-3xl p-6 mb-8">
      <Skeleton height="h-8" width="w-48" className="mb-4 mx-auto" />
      <Skeleton height="h-4" width="w-64" className="mx-auto" />
    </div>
    
    {/* Menu Items Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <MenuItemSkeleton key={index} />
      ))}
    </div>
  </div>
);

export const MenuItemSkeleton: React.FC = () => (
  <div className="glass-effect rounded-3xl overflow-hidden">
    {/* Image Skeleton */}
    <Skeleton height="h-48" className="w-full" />
    
    {/* Content Skeleton */}
    <div className="p-6">
      <Skeleton height="h-6" width="w-3/4" className="mb-3" />
      <Skeleton height="h-4" width="w-full" className="mb-2" />
      <Skeleton height="h-4" width="w-2/3" className="mb-4" />
      
      {/* Price Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton height="h-5" width="w-16" />
        <Skeleton height="h-8" width="w-8" className="rounded-full" />
      </div>
    </div>
  </div>
);
