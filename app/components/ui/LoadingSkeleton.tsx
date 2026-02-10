// Loading skeleton components

'use client';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton = ({ className = '', width, height }: SkeletonProps) => {
  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded ${className}`}
      style={style}
    />
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      {/* Header skeleton */}
      <div className="text-center space-y-6">
        <div className="relative mx-auto">
          <Skeleton className="w-40 h-40 rounded-full mx-auto" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <Skeleton className="w-56 h-8 mx-auto" />
          <Skeleton className="w-40 h-5 mx-auto" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Personal Information */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-48 h-6" />
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="w-24 h-5 mb-2" />
                <Skeleton className="w-full h-12 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-44 h-6" />
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="w-20 h-5 mb-2" />
                <Skeleton className="w-full h-12 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
        <div className="flex justify-end space-x-4">
          <Skeleton className="w-32 h-12 rounded-lg" />
          <Skeleton className="w-36 h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const NavBarSkeleton = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo skeleton */}
          <Skeleton className="w-32 h-8" />
          
          {/* Navigation items skeleton */}
          <div className="hidden md:flex space-x-8">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-18 h-4" />
          </div>
          
          {/* Profile dropdown skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export const FormFieldSkeleton = () => {
  return (
    <div className="space-y-1">
      <Skeleton className="w-20 h-4" />
      <Skeleton className="w-full h-10" />
    </div>
  );
};

export const ImageUploadSkeleton = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="w-32 h-32 rounded-full" />
      <div className="space-y-2 text-center">
        <Skeleton className="w-40 h-4 mx-auto" />
        <Skeleton className="w-32 h-4 mx-auto" />
      </div>
      <Skeleton className="w-28 h-10" />
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <Skeleton className="w-3/4 h-6" />
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-5/6 h-4" />
        <Skeleton className="w-4/5 h-4" />
      </div>
    </div>
  );
};

export const ListSkeleton = ({ items = 5 }: { items?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
};