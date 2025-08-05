import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeviceStats } from "@/types/device";
import { getSdkEraColors } from "@/lib/deviceColors";
import { Badge } from "@/components/ui/badge";

interface ScreenResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

export const ScreenResolutionDialog = ({ open, onOpenChange, stats }: ScreenResolutionDialogProps) => {
  const resolutionEntries = Object.entries(stats.screenResolutionCounts)
    .sort(([,a], [,b]) => b - a);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Screen Resolution Distribution</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3">
            {resolutionEntries.map(([resolution, count]) => {
              const colors = getSdkEraColors(30);
              const percentage = ((count / stats.totalDevices) * 100).toFixed(1);
              return (
                <div key={resolution} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded border" 
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div>
                      <span className="font-medium">{resolution}</span>
                      <p className="text-sm text-muted-foreground">{percentage}% of devices</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: colors.secondary, 
                      color: colors.text 
                    }}
                  >
                    {count} devices
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
