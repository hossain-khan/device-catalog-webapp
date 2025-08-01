import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DeviceCardSkeletonProps {
  count?: number;
}

export const DeviceCardSkeleton = ({ count = 12 }: DeviceCardSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-6 w-16 rounded" />
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-6 w-14 rounded" />
            </div>
          </CardContent>
          {/* JSON Source Section Skeleton */}
          <div className="border-t p-3 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-32 w-full rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
};