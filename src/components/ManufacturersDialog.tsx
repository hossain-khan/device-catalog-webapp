import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ui/modal-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeviceStats } from "@/types/device";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBar, List } from "@phosphor-icons/react";

interface ManufacturersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
  onFilterByManufacturer: (manufacturer: string) => void;
}

export const ManufacturersDialog = ({ 
  open, 
  onOpenChange, 
  stats,
  onFilterByManufacturer 
}: ManufacturersDialogProps) => {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  
  const manufacturerData = Object.entries(stats.manufacturerCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([manufacturer, count]) => ({
      manufacturer,
      count,
      displayName: manufacturer.length > 12 ? `${manufacturer.substring(0, 12)}...` : manufacturer
    }));

  const handleManufacturerClick = (manufacturer: string) => {
    onFilterByManufacturer(manufacturer);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto" hideCloseButton={true}>
        <ModalHeader
          title={`All Manufacturers (${manufacturerData.length})`}
          subtitle="Click on any manufacturer to filter devices by that brand"
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
                data={manufacturerData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="displayName" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} devices`,
                    props.payload.manufacturer
                  ]}
                  labelFormatter={(label, payload) => {
                    return payload?.[0]?.payload?.manufacturer || label;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--primary)"
                  cursor="pointer"
                  onClick={(data) => handleManufacturerClick(data.manufacturer)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {manufacturerData.map(({ manufacturer, count }) => (
              <button
                key={manufacturer}
                onClick={() => handleManufacturerClick(manufacturer)}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors text-left"
              >
                <span className="text-sm font-medium truncate pr-2">{manufacturer}</span>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {count}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};