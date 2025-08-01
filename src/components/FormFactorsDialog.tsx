import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeviceStats } from "@/types/device";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartBar, Chart, List } from "@phosphor-icons/react";

interface FormFactorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
  onFilterByFormFactor: (formFactor: string) => void;
}

// Color palette for form factors
const FORM_FACTOR_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)', 
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--primary)',
  'var(--accent)'
];

export const FormFactorsDialog = ({ 
  open, 
  onOpenChange, 
  stats,
  onFilterByFormFactor 
}: FormFactorsDialogProps) => {
  const [viewMode, setViewMode] = useState<'pie' | 'bar' | 'list'>('pie');
  
  const formFactorData = Object.entries(stats.formFactorCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([formFactor, count], index) => ({
      formFactor,
      count,
      color: FORM_FACTOR_COLORS[index % FORM_FACTOR_COLORS.length],
      percentage: ((count / stats.totalDevices) * 100).toFixed(1)
    }));

  const handleFormFactorClick = (formFactor: string) => {
    onFilterByFormFactor(formFactor);
    onOpenChange(false);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.formFactor}</p>
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Form Factor Distribution ({formFactorData.length} types)
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pie')}
              >
                <Chart size={16} className="mr-1" />
                Pie
              </Button>
              <Button
                variant={viewMode === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('bar')}
              >
                <ChartBar size={16} className="mr-1" />
                Bar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} className="mr-1" />
                List
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {viewMode === 'pie' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="h-96 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formFactorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ formFactor, percentage }) => `${formFactor} (${percentage}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    onClick={(data) => handleFormFactorClick(data.formFactor)}
                    className="cursor-pointer"
                  >
                    {formFactorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="lg:w-64 space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Legend</h3>
              {formFactorData.map((item) => (
                <button
                  key={item.formFactor}
                  onClick={() => handleFormFactorClick(item.formFactor)}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <div 
                    className="w-4 h-4 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.formFactor}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.count} devices ({item.percentage}%)
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'bar' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formFactorData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="formFactor" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="var(--primary)"
                  cursor="pointer"
                  onClick={(data) => handleFormFactorClick(data.formFactor)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formFactorData.map((item) => (
              <button
                key={item.formFactor}
                onClick={() => handleFormFactorClick(item.formFactor)}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors text-left"
              >
                <div>
                  <div className="text-sm font-medium">{item.formFactor}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage}% of all devices
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.count}
                </Badge>
              </button>
            ))}
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Click on any form factor to filter devices by that type
        </div>
      </DialogContent>
    </Dialog>
  );
};