import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeviceStats } from "@/types/device";
import { X } from "@phosphor-icons/react";

interface SdkVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

export const SdkVersionsDialog = ({ open, onOpenChange, stats }: SdkVersionsDialogProps) => {
  // Sort SDK versions by count (descending) for the bar chart
  const sortedSdkVersions = Object.entries(stats.sdkVersionCounts)
    .sort(([,a], [,b]) => b - a);

  // Calculate the maximum count for scaling the bars
  const maxCount = Math.max(...Object.values(stats.sdkVersionCounts));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">
            All SDK Versions Distribution
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                SDK Version Distribution
                <Badge variant="outline" className="text-xs">
                  {sortedSdkVersions.length} versions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bar Chart */}
              <div className="space-y-3">
                {sortedSdkVersions.map(([sdk, count]) => {
                  const percentage = (count / maxCount) * 100;
                  
                  return (
                    <div key={sdk} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">API {sdk}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {count} devices
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({((count / Object.values(stats.sdkVersionCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="relative h-6 bg-muted rounded-sm overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-foreground mix-blend-difference">
                            {count}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Statistics */}
              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Devices</div>
                    <div className="text-lg font-semibold text-primary">
                      {Object.values(stats.sdkVersionCounts).reduce((a, b) => a + b, 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">SDK Versions</div>
                    <div className="text-lg font-semibold text-primary">
                      {sortedSdkVersions.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Most Popular</div>
                    <div className="text-lg font-semibold text-primary">
                      API {sortedSdkVersions[0]?.[0] || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Least Popular</div>
                    <div className="text-lg font-semibold text-primary">
                      API {sortedSdkVersions[sortedSdkVersions.length - 1]?.[0] || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};