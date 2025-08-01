import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ui/modal-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeviceStats } from "@/types/device";
import { ChartBar, List } from "@phosphor-icons/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SdkVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

export const SdkVersionsDialog = ({ open, onOpenChange, stats }: SdkVersionsDialogProps) => {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  
  // Sort SDK versions by count (descending) for the bar chart
  const sortedSdkVersions = Object.entries(stats.sdkVersionCounts)
    .sort(([,a], [,b]) => b - a);

  // Prepare data for recharts
  const chartData = sortedSdkVersions.map(([sdk, count]) => ({
    sdk: `API ${sdk}`,
    count,
    percentage: ((count / Object.values(stats.sdkVersionCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
  }));

  // Calculate the maximum count for scaling the bars
  const maxCount = Math.max(...Object.values(stats.sdkVersionCounts));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.sdk}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} devices ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" hideCloseButton={true}>
        <ModalHeader
          title={`All SDK Versions Distribution (${sortedSdkVersions.length})`}
          actions={
            <>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('chart')}
              >
                <ChartBar size={16} className="mr-1" />
                Chart
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} className="mr-1" />
                List
              </Button>
            </>
          }
          onClose={() => onOpenChange(false)}
        />

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
              {viewMode === 'chart' ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="sdk" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="var(--chart-2)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sortedSdkVersions.map(([sdk, count]) => {
                    const percentage = (count / maxCount) * 100;
                    const globalPercentage = ((count / Object.values(stats.sdkVersionCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                    
                    return (
                      <div key={sdk} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">API {sdk}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {count} devices
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({globalPercentage}%)
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
              )}

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