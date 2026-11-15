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

const DEFAULT_CHART_PALETTE = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#64748b',
];

export const RechartsBarChart = ({
  data,
  height = 300,
  onBarClick,
  className = ""
}: RechartsBarChartProps) => {
  // Transform data for Recharts
  const chartData = data.map((item, index) => ({
    name: item.label,
    value: item.value,
    color: item.color || DEFAULT_CHART_PALETTE[index % DEFAULT_CHART_PALETTE.length]
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground border border-border rounded-lg px-3 py-2 shadow-md">
          <p className="text-xs font-semibold">{data.name}</p>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
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
          margin={{ top: 12, right: 12, left: 4, bottom: 48 }}
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="var(--border)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={{ stroke: 'var(--border)' }}
            axisLine={{ stroke: 'var(--border)' }}
            angle={-40}
            textAnchor="end"
            height={64}
            interval={0}
          />
          <YAxis
            stroke="var(--border)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={{ stroke: 'var(--border)' }}
            axisLine={{ stroke: 'var(--border)' }}
            width={46}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.35 }} />
          <Bar 
            dataKey="value" 
            fill="#10b981"
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