import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
    />
  );
};

export const SongCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-square w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export const PlaylistCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-square w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
);

export const SectionSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <SongCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const HomeSkeleton = () => (
  <div className="space-y-8 p-6">
    {Array.from({ length: 4 }, (_, i) => (
      <SectionSkeleton key={i} />
    ))}
  </div>
);