import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ui/modal-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeviceStats } from "@/types/device";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBar, List } from "@phosphor-icons/react";

interface RamDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

export const RamDistributionDialog = ({ 
  open, 
  onOpenChange, 
  stats
}: RamDistributionDialogProps) => {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  
  // Define RAM ranges in order
  const ramOrder = [
    '< 1GB',
    '1-2GB',
    '2-4GB', 
    '4-8GB',
    '8-12GB',
    '12GB+'
  ];
  
  const ramData = ramOrder
    .map(range => ({
      range,
      count: stats.ramRanges[range] || 0,
      percentage: ((stats.ramRanges[range] || 0) / stats.totalDevices * 100).toFixed(1)
    }))
    .filter(item => item.count > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { range: string; count: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.range} RAM</p>
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto" hideCloseButton={true}>
        <ModalHeader
          title="RAM Distribution"
          subtitle="RAM distribution across all devices in the catalog"
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
        
        {viewMode === 'chart' ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ramData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="var(--chart-3)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ramData.map((item) => (
              <div
                key={item.range}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div>
                  <div className="text-sm font-medium">{item.range} RAM</div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage}% of all devices
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};