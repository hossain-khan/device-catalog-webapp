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

export const RechartsPieChart = ({
  data,
  width = 350,
  height = 350,
  onSegmentClick,
  className = "",
  showLegend = true,
  innerRadius,
}: RechartsPieChartProps) => {
  type ChartDatum = {
    name: string;
    value: number;
    color: string;
    percentage: string;
  };

  // Transform data for Recharts
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData: ChartDatum[] = data.map((item, index) => ({
    name: item.label,
    value: item.value,
    color: item.color || DEFAULT_CHART_PALETTE[index % DEFAULT_CHART_PALETTE.length],
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0',
  }));

  // Ensure visible donut thickness: compute outer/inner radii based on container size
  const outerRadius = Math.max(60, Math.min(width, height) / 2 - 40);
  const computedInnerRadius = innerRadius !== undefined
    ? innerRadius
    : Math.max(20, Math.floor(outerRadius * 0.6));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDatum }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground border border-border rounded-lg px-3 py-2 shadow-md">
          <p className="text-xs font-semibold">{data.name}</p>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            {data.value.toLocaleString()} devices ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (_: unknown, index: number) => {
    if (!onSegmentClick) return;
    const d = chartData[index];
    if (d) {
      onSegmentClick({ label: d.name, value: d.value });
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
            innerRadius={computedInnerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
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
              wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};