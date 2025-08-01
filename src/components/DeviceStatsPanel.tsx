import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SdkVersionsDialog } from "@/components/SdkVersionsDialog";
import { ManufacturersDialog } from "@/components/ManufacturersDialog";
import { FormFactorsDialog } from "@/components/FormFactorsDialog";
import { RamDistributionDialog } from "@/components/RamDistributionDialog";
import { DeviceStats } from "@/types/device";
import { getFormFactorColors, getManufacturerColors, getSdkEraColors, PERFORMANCE_TIERS } from "@/lib/deviceColors";
import { ChartBar } from "@phosphor-icons/react";

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
  const [sdkDialogOpen, setSdkDialogOpen] = useState(false);
  const [manufacturersDialogOpen, setManufacturersDialogOpen] = useState(false);
  const [formFactorsDialogOpen, setFormFactorsDialogOpen] = useState(false);
  const [ramDialogOpen, setRamDialogOpen] = useState(false);
  
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Top Manufacturers</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManufacturersDialogOpen(true)}
              className="h-8 px-3"
            >
              <ChartBar size={16} className="mr-1" />
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topManufacturers.map(([manufacturer, count]) => {
                const colors = getManufacturerColors(manufacturer);
                return (
                  <div key={manufacturer} className="flex items-center justify-between">
                    <button
                      onClick={() => onFilterByManufacturer(manufacturer)}
                      className="text-sm font-medium hover:text-primary transition-colors cursor-pointer text-left flex items-center gap-2"
                    >
                      <div 
                        className="w-3 h-3 rounded border" 
                        style={{ backgroundColor: colors.primary }}
                      />
                      {manufacturer}
                    </button>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: colors.secondary, 
                        color: colors.text 
                      }}
                    >
                      {count} devices
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Form Factors</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormFactorsDialogOpen(true)}
              className="h-8 px-3"
            >
              <ChartBar size={16} className="mr-1" />
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.formFactorCounts).map(([formFactor, count]) => {
                const colors = getFormFactorColors(formFactor);
                return (
                  <div key={formFactor} className="flex items-center justify-between">
                    <button
                      onClick={() => onFilterByFormFactor(formFactor)}
                      className="text-sm font-medium hover:text-primary transition-colors cursor-pointer text-left flex items-center gap-2"
                    >
                      <div 
                        className="w-3 h-3 rounded border" 
                        style={{ backgroundColor: colors.primary }}
                      />
                      {formFactor}
                    </button>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: colors.secondary, 
                        color: colors.text 
                      }}
                    >
                      {count} devices
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">RAM Distribution</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRamDialogOpen(true)}
              className="h-8 px-3"
            >
              <ChartBar size={16} className="mr-1" />
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.ramRanges).map(([range, count]) => {
                // Get performance tier based on RAM range
                const ramValue = range.includes('-') ? 
                  parseInt(range.split('-')[0].replace(/[<>]/g, '').replace('MB', '')) : 
                  parseInt(range.replace(/[<>]/g, '').replace('MB', ''));
                const tier = PERFORMANCE_TIERS.find(t => ramValue < t.ramThreshold) || PERFORMANCE_TIERS[PERFORMANCE_TIERS.length - 1];
                
                return (
                  <div key={range} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded border" 
                        style={{ backgroundColor: tier.colors.primary }}
                      />
                      <span className="text-sm font-medium">{range}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: tier.colors.secondary, 
                        color: tier.colors.text 
                      }}
                    >
                      {count} devices
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Top SDK Versions</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSdkDialogOpen(true)}
              className="h-8 px-3"
            >
              <ChartBar size={16} className="mr-1" />
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSdkVersions.map(([sdk, count]) => {
                const sdkNum = parseInt(sdk);
                const colors = getSdkEraColors(sdkNum);
                return (
                  <div key={sdk} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded border" 
                        style={{ backgroundColor: colors.primary }}
                      />
                      <span className="text-sm font-medium">API {sdk}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: colors.secondary, 
                        color: colors.text 
                      }}
                    >
                      {count} devices
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <SdkVersionsDialog
        open={sdkDialogOpen}
        onOpenChange={setSdkDialogOpen}
        stats={stats}
      />

      <ManufacturersDialog
        open={manufacturersDialogOpen}
        onOpenChange={setManufacturersDialogOpen}
        stats={stats}
        onFilterByManufacturer={onFilterByManufacturer}
      />

      <FormFactorsDialog
        open={formFactorsDialogOpen}
        onOpenChange={setFormFactorsDialogOpen}
        stats={stats}
        onFilterByFormFactor={onFilterByFormFactor}
      />

      <RamDistributionDialog
        open={ramDialogOpen}
        onOpenChange={setRamDialogOpen}
        stats={stats}
      />
    </div>
  );
};