import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceStats } from "@/types/device";
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
  Cell
} from 'recharts';

interface AnalyticsOverviewProps {
  stats: DeviceStats;
  onFilterByManufacturer: (manufacturer: string) => void;
  onFilterByFormFactor: (formFactor: string) => void;
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)', 
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
];

export const AnalyticsOverview = ({ 
  stats, 
  onFilterByManufacturer, 
  onFilterByFormFactor 
}: AnalyticsOverviewProps) => {
  // Top 5 manufacturers for chart
  const topManufacturers = Object.entries(stats.manufacturerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([manufacturer, count]) => ({
      manufacturer: manufacturer.length > 10 ? `${manufacturer.substring(0, 10)}...` : manufacturer,
      fullName: manufacturer,
      count
    }));

  // Form factors data for pie chart
  const formFactorData = Object.entries(stats.formFactorCounts)
    .map(([formFactor, count]) => ({
      formFactor,
      count,
      percentage: ((count / stats.totalDevices) * 100).toFixed(1)
    }));

  // Top SDK versions
  const topSdkVersions = Object.entries(stats.sdkVersionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([sdk, count]) => ({
      sdk: `API ${sdk}`,
      count
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} devices
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Manufacturers Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topManufacturers}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="manufacturer" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  content={<CustomTooltip />}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullName || label;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--primary)"
                  cursor="pointer"
                  onClick={(data) => onFilterByManufacturer(data.fullName)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Factor Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formFactorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ formFactor, percentage }) => 
                    formFactorData.length <= 4 ? `${formFactor} (${percentage}%)` : ''
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  onClick={(data) => onFilterByFormFactor(data.formFactor)}
                  className="cursor-pointer"
                >
                  {formFactorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">SDK Version Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSdkVersions}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="sdk" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="var(--chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};