import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeviceStats } from "@/types/device";
import { PERFORMANCE_TIERS } from "@/lib/deviceColors";
import { Badge } from "@/components/ui/badge";

interface PerformanceTiersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

export const PerformanceTiersDialog = ({ open, onOpenChange, stats }: PerformanceTiersDialogProps) => {
  const performanceEntries = Object.entries(stats.performanceTierCounts)
    .sort(([,a], [,b]) => b - a);

  const getTierDescription = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'budget':
        return 'Basic devices with limited RAM (≤2GB) - suitable for essential apps';
      case 'midrange':
        return 'Balanced devices with moderate RAM (3-8GB) - good performance for most apps';
      case 'premium':
        return 'Premium devices with ample RAM (9-12GB) - excellent for demanding apps';
      case 'flagship':
        return 'Top-tier devices with abundant RAM (≥13GB) - maximum performance capability';
      default:
        return 'Performance classification based on RAM capacity';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Performance Tiers Distribution</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3">
            {performanceEntries.map(([tier, count]) => {
              const tierColors = PERFORMANCE_TIERS.find(t => t.name.toLowerCase() === tier.toLowerCase())?.colors || PERFORMANCE_TIERS[0].colors;
              const percentage = ((count / stats.totalDevices) * 100).toFixed(1);
              const description = getTierDescription(tier);
              return (
                <div key={tier} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded border" 
                      style={{ backgroundColor: tierColors.primary }}
                    />
                    <div>
                      <span className="font-medium capitalize">{tier}</span>
                      <p className="text-sm text-muted-foreground">{description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{percentage}% of devices</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: tierColors.secondary, 
                      color: tierColors.text 
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
