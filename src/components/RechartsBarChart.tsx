import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RechartsBarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  onBarClick?: (data: { label: string; value: number }) => void;
  className?: string;
}

interface TooltipPayload {
  payload: {
    name: string;
    value: number;
    color: string;
  };
}

export const RechartsBarChart = ({
  data,
  height = 300,
  onBarClick,
  className = ""
}: RechartsBarChartProps) => {
  // Transform data for Recharts
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    color: item.color || '#3b82f6'
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString()} devices
          </p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: { name: string; value: number }) => {
    if (onBarClick) {
      onBarClick({ label: data.name, value: data.value });
    }
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#3b82f6"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};