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
      className={`animate-pulse ${height} ${width} ${
        rounded ? 'rounded' : ''
      } ${className}`}
      style={{
        backgroundColor: 'var(--accent)',
        backgroundImage: 'linear-gradient(90deg, var(--accent) 0%, rgba(215, 107, 62, 0.1) 50%, var(--accent) 100%)',
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
  <div className="relative z-10 min-h-screen pb-24">
    {/* Restaurant Menu Header Skeleton */}
    <div className="px-4 py-6">
      <div className="glass-effect rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton height="h-12" width="w-12" className="rounded-full" />
            <div>
              <Skeleton height="h-6" width="w-32" className="mb-2" />
              <Skeleton height="h-4" width="w-24" />
            </div>
          </div>
          <Skeleton height="h-8" width="w-20" className="rounded-full" />
        </div>
      </div>
    </div>

    {/* Search Bar Skeleton */}
    <div className="px-4 mb-6">
      <div className="glass-effect rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Skeleton height="h-5" width="w-5" className="rounded" />
          <Skeleton height="h-5" width="w-full" className="rounded-full" />
        </div>
      </div>
    </div>

    {/* Categories Section Skeleton */}
    <CategoriesSectionSkeleton />

    {/* Menu Items Skeleton */}
    <MenuItemsSkeleton />
  </div>
);

// Categories Section Skeleton (horizontal scrollable)
export const CategoriesSectionSkeleton: React.FC = () => (
  <div className="px-4 mb-6">
    <Skeleton height="h-6" width="w-24" className="mb-4 mx-auto" />
    <div className="flex gap-4 overflow-x-auto pb-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden backdrop-blur-sm border border-white/20 bg-white/10">
            <Skeleton height="h-full" width="w-full" className="rounded-full" />
          </div>
          <Skeleton height="h-3" width="w-16" className="mt-2 mx-auto" />
        </div>
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
  <div className="px-4 space-y-4 pb-24">
    {Array.from({ length: 6 }).map((_, index) => (
      <MenuItemCardSkeleton key={index} />
    ))}
  </div>
);

export const MenuItemCardSkeleton: React.FC = () => (
  <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20">
    <div className="flex flex-col gap-4">
      {/* Top Section: Image and Info */}
      <div className="flex items-start gap-4">
        {/* Circular Image */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/30 shadow-lg">
            <Skeleton height="h-full" width="w-full" className="rounded-full" />
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <Skeleton height="h-6" width="w-3/4" className="mb-1" />
          <Skeleton height="h-3" width="w-1/2" className="mb-1" />
          <Skeleton height="h-4" width="w-full" className="mb-2" />
          <Skeleton height="h-4" width="w-2/3" className="mb-2" />

          {/* Meta Info Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton height="h-6" width="w-16" className="rounded-full" />
            <Skeleton height="h-6" width="w-20" className="rounded-full" />
            <Skeleton height="h-6" width="w-18" className="rounded-full" />
          </div>
        </div>
      </div>

      {/* Bottom Section: Price and Actions */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
        {/* Price Section */}
        <div className="flex items-center gap-2">
          <Skeleton height="h-10" width="w-20" className="rounded-full" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Skeleton height="h-10" width="w-10" className="rounded-full" />
          <Skeleton height="h-10" width="w-24" className="rounded-full" />
        </div>
      </div>
    </div>
  </div>
);
