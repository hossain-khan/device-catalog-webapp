import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeviceStats } from "@/types/device";
import { PERFORMANCE_TIERS } from "@/lib/deviceColors";
import { Badge } from "@/components/ui/badge";

interface ArchitectureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

export const ArchitectureDialog = ({ open, onOpenChange, stats }: ArchitectureDialogProps) => {
  const architectureEntries = Object.entries(stats.architectureCounts)
    .sort(([,a], [,b]) => b - a);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CPU Architecture Distribution</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3">
            {architectureEntries.map(([arch, count]) => {
              const colors = PERFORMANCE_TIERS[0].colors;
              const percentage = ((count / stats.totalDevices) * 100).toFixed(1);
              return (
                <div key={arch} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded border" 
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div>
                      <span className="font-medium">{arch}</span>
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
