import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ui/modal-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartBar, ChartPie, List, DeviceMobile, DeviceTablet, Television } from "@phosphor-icons/react";
import { getFormFactorColors } from "@/lib/deviceColors";

interface FormFactorManufacturersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devices: AndroidDevice[];
  formFactor: 'Phone' | 'Tablet' | 'TV';
  onFilterByManufacturer: (manufacturer: string) => void;
}

// Data point type for charts
type DataPoint = {
  manufacturer: string;
  count: number;
  color: string;
  displayName: string;
  percentage: string;
};

// Minimal tooltip props to avoid any
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
}

// Utility: parse hue from an OKLCH color string like 'oklch(L C H)'
function parseOklchHue(color: string): number | undefined {
  const m = color.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/i);
  return m ? Number(m[3]) : undefined;
}

// Generate a soft, professional palette using OKLCH with fixed hue and low chroma
function generateSoftPalette(hue: number, count = 10): string[] {
  // Lightness values from light to darker for better distinction
  const lightnesses = [0.82, 0.78, 0.74, 0.70, 0.66, 0.62, 0.58, 0.54, 0.50, 0.46];
  const chroma = 0.06; // low saturation for professional look
  const arr: string[] = [];
  for (let i = 0; i < count; i++) {
    const L = lightnesses[i % lightnesses.length];
    arr.push(`oklch(${L} ${chroma} ${hue})`);
  }
  return arr;
}

export const FormFactorManufacturersDialog = ({
  open,
  onOpenChange,
  devices,
  formFactor,
  onFilterByManufacturer,
}: FormFactorManufacturersDialogProps) => {
  const [viewMode, setViewMode] = useState<'bar' | 'pie' | 'list'>('bar');

  // Determine a base hue from the form factor color scheme
  const chartColors = useMemo(() => {
    const base = getFormFactorColors(formFactor).primary;
    const hue = parseOklchHue(base) ?? (formFactor === 'Phone' ? 220 : formFactor === 'Tablet' ? 280 : 15);
    return generateSoftPalette(hue, 10);
  }, [formFactor]);

  const manufacturerData: DataPoint[] = useMemo(() => {
    // Filter devices by form factor
    const filteredDevices = devices.filter((device) => device.formFactor === formFactor);

    // Count manufacturers
    const manufacturerCounts: { [key: string]: number } = {};
    filteredDevices.forEach((device) => {
      manufacturerCounts[device.manufacturer] = (manufacturerCounts[device.manufacturer] || 0) + 1;
    });

    // Convert to array and sort
    return Object.entries(manufacturerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10 manufacturers
      .map(([manufacturer, count], index) => ({
        manufacturer,
        count,
        color: chartColors[index % chartColors.length],
        displayName: manufacturer.length > 12 ? `${manufacturer.substring(0, 12)}...` : manufacturer,
        percentage: ((count / filteredDevices.length) * 100).toFixed(1),
      }));
  }, [devices, formFactor, chartColors]);

  const totalDevices = useMemo(() => {
    return devices.filter((device) => device.formFactor === formFactor).length;
  }, [devices, formFactor]);

  const handleManufacturerClick = (manufacturer: string) => {
    onFilterByManufacturer(manufacturer);
    onOpenChange(false);
  };

  const getFormFactorIcon = () => {
    switch (formFactor) {
      case 'Phone':
        return <DeviceMobile size={16} className="mr-1" />;
      case 'Tablet':
        return <DeviceTablet size={16} className="mr-1" />;
      case 'TV':
        return <Television size={16} className="mr-1" />;
      default:
        return <ChartBar size={16} className="mr-1" />;
    }
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.manufacturer}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} devices ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (viewMode === 'bar') {
      return (
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
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                cursor="pointer"
                onClick={(_, index) => {
                  const item = manufacturerData[index as number];
                  if (item) handleManufacturerClick(item.manufacturer);
                }}
              >
                {manufacturerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (viewMode === 'pie') {
      return (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={manufacturerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(d: unknown) => {
                  const { manufacturer, percentage } = d as Pick<DataPoint, 'manufacturer' | 'percentage'>;
                  return `${manufacturer} (${percentage}%)`;
                }}
                outerRadius={120}
                fill={chartColors[0]}
                dataKey="count"
                onClick={(_, index) => {
                  const item = manufacturerData[index as number];
                  if (item) handleManufacturerClick(item.manufacturer);
                }}
                cursor="pointer"
              >
                {manufacturerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {manufacturerData.map(({ manufacturer, count, percentage }) => (
            <button
              key={manufacturer}
              onClick={() => handleManufacturerClick(manufacturer)}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            >
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-sm font-medium truncate block">{manufacturer}</span>
                <span className="text-xs text-muted-foreground">{percentage}%</span>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {count}
              </Badge>
            </button>
          ))}
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto" hideCloseButton={true}>
        <ModalHeader
          title={
            <div className="flex items-center">
              {getFormFactorIcon()}
              {`Top ${formFactor} Manufacturers (${manufacturerData.length})`}
            </div>
          }
          subtitle={`${totalDevices} total ${formFactor.toLowerCase()} devices. Click on any manufacturer to filter devices.`}
          actions={
            <>
              <Button
                variant={viewMode === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('bar')}
              >
                <ChartBar size={16} className="mr-1" />
                Bar
              </Button>
              <Button
                variant={viewMode === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pie')}
              >
                <ChartPie size={16} className="mr-1" />
                Pie
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

        {renderChart()}
      </DialogContent>
    </Dialog>
  );
};