import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DeviceStats } from "@/types/device";

interface HighResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

export const HighResolutionDialog = ({ open, onOpenChange, stats }: HighResolutionDialogProps) => {
  const highResCount = stats.highResolutionSupportCount;
  const standardResCount = stats.totalDevices - highResCount;
  const highResPercentage = ((highResCount / stats.totalDevices) * 100).toFixed(1);
  const standardResPercentage = ((standardResCount / stats.totalDevices) * 100).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            High-Resolution Display Support
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{highResPercentage}%</div>
              <div className="text-sm text-muted-foreground">High-Resolution</div>
              <div className="text-xs text-muted-foreground">1080p+ displays</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{standardResPercentage}%</div>
              <div className="text-sm text-muted-foreground">Standard Resolution</div>
              <div className="text-xs text-muted-foreground">Below 1080p</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-green-700">High-Resolution (1080p+)</span>
                <span>{highResCount} devices</span>
              </div>
              <Progress value={parseFloat(highResPercentage)} className="h-3" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-orange-700">Standard Resolution</span>
                <span>{standardResCount} devices</span>
              </div>
              <Progress value={parseFloat(standardResPercentage)} className="h-3 [&>div]:bg-orange-500" />  
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Resolution Categories</h3>
            
            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border bg-green-500" />
                <div>
                  <span className="font-medium text-green-800">High-Resolution Displays</span>
                  <p className="text-xs text-green-600 mt-1">1080p and above (Full HD+)</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {highResCount} devices
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border bg-orange-500" />
                <div>
                  <span className="font-medium text-orange-800">Standard Resolution</span>
                  <p className="text-xs text-orange-600 mt-1">Below 1080p (HD and lower)</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {standardResCount} devices
              </Badge>
            </div>
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded">
            <strong>Developer Impact:</strong> {highResPercentage}% of devices support high-resolution displays, 
            which means your app should optimize for crisp graphics and consider density-independent pixels (dp) 
            for consistent UI across different screen resolutions.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
