import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RechartsPieChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  width?: number;
  height?: number;
  onSegmentClick?: (data: { label: string; value: number }) => void;
  className?: string;
  showLegend?: boolean;
  innerRadius?: number;
}

export const RechartsPieChart = ({
  data,
  width = 350,
  height = 350,
  onSegmentClick,
  className = "",
  showLegend = true,
  innerRadius = 60
}: RechartsPieChartProps) => {
  // Transform data for Recharts
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map((item, index) => ({
    name: item.label,
    value: item.value,
    color: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString()} devices ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (data: any) => {
    if (onSegmentClick) {
      onSegmentClick({ label: data.name, value: data.value });
    }
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={Math.min(width, height) / 2 - 40}
            paddingAngle={2}
            dataKey="value"
            onClick={handlePieClick}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => `${value} (${entry.payload.percentage}%)`}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};