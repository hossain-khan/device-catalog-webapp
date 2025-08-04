import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Clock } from "@phosphor-icons/react";

interface DataPreloadingProps {
  progress: number;
  deviceCount?: number;
}

export const DataPreloading = ({ progress, deviceCount }: DataPreloadingProps) => {
  const formatDeviceCount = (count: number) => {
    return count.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Database size={48} className="text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1">
                <Clock size={20} className="text-muted-foreground animate-spin" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Loading Device Catalog
            </h2>
            <p className="text-sm text-muted-foreground">
              Preparing {deviceCount ? formatDeviceCount(deviceCount) : 'thousands of'} Android devices...
            </p>
          </div>
          
          <div className="space-y-3">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Loading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            This may take a few moments for the large dataset
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
