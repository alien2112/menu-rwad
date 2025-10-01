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
