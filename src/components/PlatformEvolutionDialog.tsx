import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeviceStats } from "@/types/device";
import { Badge } from "@/components/ui/badge";

interface PlatformEvolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

export const PlatformEvolutionDialog = ({ open, onOpenChange, stats }: PlatformEvolutionDialogProps) => {
  const platformData = [
    { name: "Legacy (API ≤ 25)", count: stats.platformCompatibility.legacy, color: "#ef4444", bgColor: "bg-red-100", textColor: "text-red-800" },
    { name: "Modern (API 26-30)", count: stats.platformCompatibility.modern, color: "#f59e0b", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
    { name: "Recent (API 31-33)", count: stats.platformCompatibility.recent, color: "#3b82f6", bgColor: "bg-blue-100", textColor: "text-blue-800" },
    { name: "Latest (API ≥ 34)", count: stats.platformCompatibility.latest, color: "#10b981", bgColor: "bg-green-100", textColor: "text-green-800" }
  ].sort((a, b) => b.count - a.count);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Platform Evolution Distribution</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3">
            {platformData.map((platform) => {
              const percentage = ((platform.count / stats.totalDevices) * 100).toFixed(1);
              return (
                <div key={platform.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded border" 
                      style={{ backgroundColor: platform.color }}
                    />
                    <div>
                      <span className="font-medium">{platform.name}</span>
                      <p className="text-sm text-muted-foreground">{percentage}% of devices</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={`${platform.bgColor} ${platform.textColor}`}
                  >
                    {platform.count} devices
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
