import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeviceStats } from "@/types/device";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatsCard = ({ title, value, subtitle }: StatsCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
);

interface DeviceStatsProps {
  stats: DeviceStats;
  onFilterByManufacturer: (manufacturer: string) => void;
  onFilterByFormFactor: (formFactor: string) => void;
}

export const DeviceStatsPanel = ({ stats, onFilterByManufacturer, onFilterByFormFactor }: DeviceStatsProps) => {
  const topManufacturers = Object.entries(stats.manufacturerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topSdkVersions = Object.entries(stats.sdkVersionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Devices" 
          value={stats.totalDevices}
          subtitle="In catalog"
        />
        <StatsCard 
          title="Manufacturers" 
          value={Object.keys(stats.manufacturerCounts).length}
          subtitle="Unique brands"
        />
        <StatsCard 
          title="Form Factors" 
          value={Object.keys(stats.formFactorCounts).length}
          subtitle="Device types"
        />
        <StatsCard 
          title="SDK Versions" 
          value={Object.keys(stats.sdkVersionCounts).length}
          subtitle="Android APIs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Manufacturers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topManufacturers.map(([manufacturer, count]) => (
                <div key={manufacturer} className="flex items-center justify-between">
                  <button
                    onClick={() => onFilterByManufacturer(manufacturer)}
                    className="text-sm font-medium hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    {manufacturer}
                  </button>
                  <Badge variant="secondary" className="text-xs">
                    {count} devices
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Form Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.formFactorCounts).map(([formFactor, count]) => (
                <div key={formFactor} className="flex items-center justify-between">
                  <button
                    onClick={() => onFilterByFormFactor(formFactor)}
                    className="text-sm font-medium hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    {formFactor}
                  </button>
                  <Badge variant="secondary" className="text-xs">
                    {count} devices
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">RAM Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.ramRanges).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{range}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count} devices
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top SDK Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSdkVersions.map(([sdk, count]) => (
                <div key={sdk} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{sdk}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count} devices
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};