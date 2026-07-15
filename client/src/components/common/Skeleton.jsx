import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div className={`animate-pulse bg-surface-200/70 rounded-md ${className}`} {...props} />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full">
      <div className="border-b border-border pb-4 mb-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-6 flex-1" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`r-${i}`} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={`c-${i}-${j}`} className="h-10 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="card-base p-6">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
      <div className="mt-6 flex justify-end">
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
};
