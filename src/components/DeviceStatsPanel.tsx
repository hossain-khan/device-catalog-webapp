import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SdkVersionsDialog } from "@/components/SdkVersionsDialog";
import { ManufacturersDialog } from "@/components/ManufacturersDialog";
import { FormFactorsDialog } from "@/components/FormFactorsDialog";
import { RamDistributionDialog } from "@/components/RamDistributionDialog";
import { ArchitectureDialog } from "@/components/ArchitectureDialog";
import { PlatformEvolutionDialog } from "@/components/PlatformEvolutionDialog";
import { PerformanceTiersDialog } from "@/components/PerformanceTiersDialog";
import { ScreenResolutionDialog } from "@/components/ScreenResolutionDialog";
import { ProcessorDiversityDialog } from "@/components/ProcessorDiversityDialog";
import { HighResolutionDialog } from "@/components/HighResolutionDialog";
import { GpuManufacturerDialog } from "@/components/GpuManufacturerDialog";
import { FormFactorManufacturersDialog } from "@/components/FormFactorManufacturersDialog";
import { RechartsBarChart } from "@/components/RechartsBarChart";
import { RechartsPieChart } from "@/components/RechartsPieChart";
import { DeviceStats, AndroidDevice } from "@/types/device";
import { getFormFactorColors, getManufacturerColors, getSdkEraColors, PERFORMANCE_TIERS } from "@/lib/deviceColors";
import {
  ChartBar,
  DeviceMobile,
  DeviceTablet,
  Television,
  ChartPie,
  List,
  Database,
  Factory,
  Cpu,
  Monitor,
  AndroidLogo,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: string;
}

const StatsCard = ({ title, value, subtitle, icon, accentColor = "var(--primary)" }: StatsCardProps) => (
  <Card className="relative overflow-hidden border-border/80 shadow-xs py-0 gap-0">
    <div
      className="h-1 w-full"
      style={{ backgroundColor: accentColor }}
    />
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="text-3xl font-bold tracking-tight text-foreground mt-1.5 tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border/60 bg-muted/50 text-foreground/80"
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface DistributionRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
  onClick?: () => void;
}

const DistributionRow = ({ label, count, total, color, onClick }: DistributionRowProps) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs gap-2">
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer text-left inline-flex items-center gap-2 group"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="truncate">{label}</span>
            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
          </button>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium text-foreground truncate">{label}</span>
          </div>
        )}
        <div className="flex items-center gap-2 shrink-0 tabular-nums">
          <span className="font-semibold text-foreground">{count.toLocaleString()}</span>
          <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-4.5 min-w-[46px] justify-end">
            {pct.toFixed(1)}%
          </Badge>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/80 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(pct, 1.5)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

interface ViewModeToggleProps {
  mode: 'bar' | 'pie' | 'list';
  onChange: (mode: 'bar' | 'pie' | 'list') => void;
  onShowAll: () => void;
}

const ViewModeToggle = ({ mode, onChange, onShowAll }: ViewModeToggleProps) => (
  <div className="flex items-center gap-1.5">
    <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/50 p-0.5">
      <Button
        variant={mode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        className="h-6 w-6 p-0 rounded-md"
        title="List View"
      >
        <List size={13} />
      </Button>
      <Button
        variant={mode === 'bar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('bar')}
        className="h-6 w-6 p-0 rounded-md"
        title="Bar Chart"
      >
        <ChartBar size={13} />
      </Button>
      <Button
        variant={mode === 'pie' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('pie')}
        className="h-6 w-6 p-0 rounded-md"
        title="Pie Chart"
      >
        <ChartPie size={13} />
      </Button>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={onShowAll}
      className="h-7 px-2.5 text-xs hover:bg-muted hover:text-foreground"
    >
      Show All
    </Button>
  </div>
);

interface DeviceStatsProps {
  stats: DeviceStats;
  devices: AndroidDevice[];
  onFilterByManufacturer: (manufacturer: string) => void;
  onFilterByFormFactor: (formFactor: string) => void;
}

export const DeviceStatsPanel = ({ stats, devices, onFilterByManufacturer, onFilterByFormFactor }: DeviceStatsProps) => {
  const [sdkDialogOpen, setSdkDialogOpen] = useState(false);
  const [manufacturersDialogOpen, setManufacturersDialogOpen] = useState(false);
  const [formFactorsDialogOpen, setFormFactorsDialogOpen] = useState(false);
  const [ramDialogOpen, setRamDialogOpen] = useState(false);
  const [architectureDialogOpen, setArchitectureDialogOpen] = useState(false);
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [performanceDialogOpen, setPerformanceDialogOpen] = useState(false);
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [processorDiversityDialogOpen, setProcessorDiversityDialogOpen] = useState(false);
  const [highResolutionDialogOpen, setHighResolutionDialogOpen] = useState(false);
  const [gpuManufacturerDialogOpen, setGpuManufacturerDialogOpen] = useState(false);
  
  const [phoneManufacturersDialogOpen, setPhoneManufacturersDialogOpen] = useState(false);
  const [tabletManufacturersDialogOpen, setTabletManufacturersDialogOpen] = useState(false);
  const [tvManufacturersDialogOpen, setTvManufacturersDialogOpen] = useState(false);
  
  const [processorViewMode, setProcessorViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [gpuViewMode, setGpuViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [architectureViewMode, setArchitectureViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [platformViewMode, setPlatformViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [performanceViewMode, setPerformanceViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [resolutionViewMode, setResolutionViewMode] = useState<'bar' | 'pie' | 'list'>('list');

  const [processorAnimateRef] = useAutoAnimate({ duration: 250, easing: 'ease-in-out' });
  const [gpuAnimateRef] = useAutoAnimate({ duration: 250, easing: 'ease-in-out' });
  const [architectureAnimateRef] = useAutoAnimate({ duration: 250, easing: 'ease-in-out' });
  const [platformAnimateRef] = useAutoAnimate({ duration: 250, easing: 'ease-in-out' });
  const [performanceAnimateRef] = useAutoAnimate({ duration: 250, easing: 'ease-in-out' });
  const [resolutionAnimateRef] = useAutoAnimate({ duration: 250, easing: 'ease-in-out' });
  
  const topManufacturers = Object.entries(stats.manufacturerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  const topSdkVersions = Object.entries(stats.sdkVersionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  const phoneCount = stats.formFactorCounts['Phone'] || 0;
  const tabletCount = stats.formFactorCounts['Tablet'] || 0;
  const tvCount = stats.formFactorCounts['TV'] || 0;

  const highResPct = stats.totalDevices > 0
    ? ((stats.highResolutionSupportCount / stats.totalDevices) * 100)
    : 0;

  const processorChartData = useMemo(() => {
    return Object.entries(stats.processorManufacturerCounts || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([processor, count], index) => ({
        label: processor.length > 20 ? `${processor.substring(0, 20)}...` : processor,
        value: count,
        color: `hsl(${(index * 137.5) % 360}, 65%, 50%)`
      }));
  }, [stats.processorManufacturerCounts]);

  const gpuChartData = useMemo(() => {
    return Object.entries(stats.gpuManufacturerCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([gpu, count], index) => ({
        label: gpu,
        value: count,
        color: `hsl(${(index * 95) % 360}, 70%, 55%)`
      }));
  }, [stats.gpuManufacturerCounts]);

  const architectureChartData = useMemo(() => {
    return Object.entries(stats.architectureCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([arch, count], index) => ({
        label: arch,
        value: count,
        color: `hsl(${(index * 120) % 360}, 60%, 50%)`
      }));
  }, [stats.architectureCounts]);

  const platformChartData = useMemo(() => {
    const platformData = [
      { label: 'Legacy (API ≤ 25)', value: stats.platformCompatibility.legacy, color: '#ef4444' },
      { label: 'Modern (API 26-30)', value: stats.platformCompatibility.modern, color: '#f59e0b' },
      { label: 'Recent (API 31-33)', value: stats.platformCompatibility.recent, color: '#3b82f6' },
      { label: 'Latest (API ≥ 34)', value: stats.platformCompatibility.latest, color: '#10b981' }
    ];
    return platformData.filter(item => item.value > 0);
  }, [stats.platformCompatibility]);

  const performanceChartData = useMemo(() => {
    return Object.entries(stats.performanceTierCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([tier, count]) => {
        const tierColors = PERFORMANCE_TIERS.find(t => t.name.toLowerCase() === tier.toLowerCase())?.colors || PERFORMANCE_TIERS[0].colors;
        return {
          label: tier.charAt(0).toUpperCase() + tier.slice(1),
          value: count,
          color: tierColors.primary
        };
      });
  }, [stats.performanceTierCounts]);

  const resolutionChartData = useMemo(() => {
    return Object.entries(stats.screenResolutionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 12)
      .map(([resolution, count], index) => ({
        label: resolution,
        value: count,
        color: `hsl(${(index * 85) % 360}, 65%, 55%)`
      }));
  }, [stats.screenResolutionCounts]);

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Devices" 
          value={stats.totalDevices}
          subtitle="Indexed in active catalog"
          icon={<Database className="h-5 w-5 text-primary" />}
          accentColor="oklch(0.64 0.16 158)"
        />
        <StatsCard 
          title="Manufacturers" 
          value={Object.keys(stats.manufacturerCounts).length}
          subtitle="Unique OEM brands"
          icon={<Factory className="h-5 w-5 text-blue-500" />}
          accentColor="oklch(0.60 0.16 245)"
        />
        <StatsCard 
          title="Form Factors" 
          value={Object.keys(stats.formFactorCounts).length}
          subtitle="Hardware categories"
          icon={<DeviceMobile className="h-5 w-5 text-purple-500" />}
          accentColor="oklch(0.60 0.17 290)"
        />
        <StatsCard 
          title="SDK Versions" 
          value={Object.keys(stats.sdkVersionCounts).length}
          subtitle="Supported Android APIs"
          icon={<AndroidLogo className="h-5 w-5 text-emerald-500" />}
          accentColor="oklch(0.68 0.16 65)"
        />
      </div>

      {/* Hardware & Display Highlight Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-primary" />
              Processor Diversity
            </CardTitle>
            <ViewModeToggle
              mode={processorViewMode}
              onChange={setProcessorViewMode}
              onShowAll={() => setProcessorDiversityDialogOpen(true)}
            />
          </CardHeader>
          <CardContent>
            <div ref={processorAnimateRef}>
              {processorViewMode === 'list' ? (
                <div className="pt-1">
                  <div className="text-3xl font-bold text-foreground tabular-nums">
                    {stats.processorDiversityCount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Distinct SoC models across {Object.keys(stats.processorManufacturerCounts || {}).length} chipmakers
                  </p>
                </div>
              ) : processorViewMode === 'bar' ? (
                <RechartsBarChart data={processorChartData} height={240} className="w-full" />
              ) : (
                <RechartsPieChart data={processorChartData} height={240} showLegend={false} className="w-full" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Monitor className="h-4 w-4 text-blue-500" />
              High-Res Displays
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHighResolutionDialogOpen(true)}
              className="h-7 px-2.5 text-xs hover:bg-muted hover:text-foreground"
            >
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="pt-1 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-foreground tabular-nums">
                  {highResPct.toFixed(1)}%
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {stats.highResolutionSupportCount.toLocaleString()} devices
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(highResPct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Devices featuring 1080p (FHD) or higher resolution panels
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ChartPie className="h-4 w-4 text-purple-500" />
              GPU Ecosystem
            </CardTitle>
            <ViewModeToggle
              mode={gpuViewMode}
              onChange={setGpuViewMode}
              onShowAll={() => setGpuManufacturerDialogOpen(true)}
            />
          </CardHeader>
          <CardContent>
            <div ref={gpuAnimateRef}>
              {gpuViewMode === 'list' ? (
                <div className="pt-1">
                  <div className="text-3xl font-bold text-foreground tabular-nums">
                    {Object.keys(stats.gpuManufacturerCounts).length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    GPU architectures (Adreno, Mali, PowerVR, Xclipse & more)
                  </p>
                </div>
              ) : gpuViewMode === 'bar' ? (
                <RechartsBarChart data={gpuChartData} height={240} className="w-full" />
              ) : (
                <RechartsPieChart data={gpuChartData} height={240} showLegend={false} className="w-full" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">CPU Architecture</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Instruction set & ABI compatibility breakdown</p>
            </div>
            <ViewModeToggle
              mode={architectureViewMode}
              onChange={setArchitectureViewMode}
              onShowAll={() => setArchitectureDialogOpen(true)}
            />
          </CardHeader>
          <CardContent>
            <div ref={architectureAnimateRef}>
              {architectureViewMode === 'list' ? (
                <div className="space-y-3.5">
                  {Object.entries(stats.architectureCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([arch, count], i) => {
                      const palette = ['oklch(0.64 0.16 158)', 'oklch(0.60 0.16 245)', 'oklch(0.62 0.17 290)', 'oklch(0.68 0.16 65)', 'oklch(0.62 0.18 25)'];
                      return (
                        <DistributionRow
                          key={arch}
                          label={arch}
                          count={count}
                          total={stats.totalDevices}
                          color={palette[i % palette.length]}
                        />
                      );
                    })}
                </div>
              ) : architectureViewMode === 'bar' ? (
                <RechartsBarChart data={architectureChartData} height={250} className="w-full" />
              ) : (
                <RechartsPieChart data={architectureChartData} height={250} showLegend={false} className="w-full" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Platform Evolution</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Devices grouped by Android API generation</p>
            </div>
            <ViewModeToggle
              mode={platformViewMode}
              onChange={setPlatformViewMode}
              onShowAll={() => setPlatformDialogOpen(true)}
            />
          </CardHeader>
          <CardContent>
            <div ref={platformAnimateRef}>
              {platformViewMode === 'list' ? (
                <div className="space-y-3.5">
                  <DistributionRow
                    label="Latest (API ≥ 34)"
                    count={stats.platformCompatibility.latest}
                    total={stats.totalDevices}
                    color="#10b981"
                  />
                  <DistributionRow
                    label="Recent (API 31–33)"
                    count={stats.platformCompatibility.recent}
                    total={stats.totalDevices}
                    color="#3b82f6"
                  />
                  <DistributionRow
                    label="Modern (API 26–30)"
                    count={stats.platformCompatibility.modern}
                    total={stats.totalDevices}
                    color="#f59e0b"
                  />
                  <DistributionRow
                    label="Legacy (API ≤ 25)"
                    count={stats.platformCompatibility.legacy}
                    total={stats.totalDevices}
                    color="#ef4444"
                  />
                </div>
              ) : platformViewMode === 'bar' ? (
                <RechartsBarChart data={platformChartData} height={250} className="w-full" />
              ) : (
                <RechartsPieChart data={platformChartData} height={250} showLegend={false} className="w-full" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Performance Tiers</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Hardware segmentation by memory profile</p>
            </div>
            <ViewModeToggle
              mode={performanceViewMode}
              onChange={setPerformanceViewMode}
              onShowAll={() => setPerformanceDialogOpen(true)}
            />
          </CardHeader>
          <CardContent>
            <div ref={performanceAnimateRef}>
              {performanceViewMode === 'list' ? (
                <div className="space-y-3.5">
                  {Object.entries(stats.performanceTierCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 4)
                    .map(([tier, count]) => {
                      const tierColors = PERFORMANCE_TIERS.find(t => t.name.toLowerCase() === tier.toLowerCase())?.colors || PERFORMANCE_TIERS[0].colors;
                      return (
                        <DistributionRow
                          key={tier}
                          label={tier.charAt(0).toUpperCase() + tier.slice(1)}
                          count={count}
                          total={stats.totalDevices}
                          color={tierColors.primary}
                        />
                      );
                    })}
                </div>
              ) : performanceViewMode === 'bar' ? (
                <RechartsBarChart data={performanceChartData} height={250} className="w-full" />
              ) : (
                <RechartsPieChart data={performanceChartData} height={250} showLegend={false} className="w-full" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Screen Resolutions</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Most common display pixel dimensions</p>
            </div>
            <ViewModeToggle
              mode={resolutionViewMode}
              onChange={setResolutionViewMode}
              onShowAll={() => setResolutionDialogOpen(true)}
            />
          </CardHeader>
          <CardContent>
            <div ref={resolutionAnimateRef}>
              {resolutionViewMode === 'list' ? (
                <div className="space-y-3.5">
                  {Object.entries(stats.screenResolutionCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([resolution, count]) => {
                      const colors = getSdkEraColors(31);
                      return (
                        <DistributionRow
                          key={resolution}
                          label={resolution}
                          count={count}
                          total={stats.totalDevices}
                          color={colors.primary}
                        />
                      );
                    })}
                </div>
              ) : resolutionViewMode === 'bar' ? (
                <RechartsBarChart data={resolutionChartData} height={250} className="w-full" />
              ) : (
                <RechartsPieChart data={resolutionChartData} height={250} showLegend={false} className="w-full" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OEM, Form Factors, RAM & SDK Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Top Manufacturers</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Click any brand to filter catalog</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManufacturersDialogOpen(true)}
              className="h-7 px-2.5 text-xs hover:bg-muted hover:text-foreground"
            >
              <ChartBar size={14} className="mr-1" />
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {topManufacturers.map(([manufacturer, count]) => {
                const colors = getManufacturerColors(manufacturer);
                return (
                  <DistributionRow
                    key={manufacturer}
                    label={manufacturer}
                    count={count}
                    total={stats.totalDevices}
                    color={colors.primary}
                    onClick={() => onFilterByManufacturer(manufacturer)}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Form Factors</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Click any category to filter catalog</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormFactorsDialogOpen(true)}
              className="h-7 px-2.5 text-xs hover:bg-muted hover:text-foreground"
            >
              <ChartBar size={14} className="mr-1" />
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {Object.entries(stats.formFactorCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([formFactor, count]) => {
                  const colors = getFormFactorColors(formFactor);
                  return (
                    <DistributionRow
                      key={formFactor}
                      label={formFactor}
                      count={count}
                      total={stats.totalDevices}
                      color={colors.primary}
                      onClick={() => onFilterByFormFactor(formFactor)}
                    />
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">RAM Distribution</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Memory capacity tiers across catalog</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRamDialogOpen(true)}
              className="h-7 px-2.5 text-xs hover:bg-muted hover:text-foreground"
            >
              <ChartBar size={14} className="mr-1" />
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {Object.entries(stats.ramRanges).map(([range, count]) => {
                const ramValue = range.includes('-') ? 
                  parseInt(range.split('-')[0].replace(/[<>]/g, '').replace('MB', '')) : 
                  parseInt(range.replace(/[<>]/g, '').replace('MB', ''));
                const tier = PERFORMANCE_TIERS.find(t => ramValue < t.ramThreshold) || PERFORMANCE_TIERS[PERFORMANCE_TIERS.length - 1];
                return (
                  <DistributionRow
                    key={range}
                    label={range}
                    count={count}
                    total={stats.totalDevices}
                    color={tier.colors.primary}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Top SDK Versions</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Most prevalent Android API levels</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSdkDialogOpen(true)}
              className="h-7 px-2.5 text-xs hover:bg-muted hover:text-foreground"
            >
              <ChartBar size={14} className="mr-1" />
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {topSdkVersions.map(([sdk, count]) => {
                const sdkNum = parseInt(sdk);
                const colors = getSdkEraColors(sdkNum);
                return (
                  <DistributionRow
                    key={sdk}
                    label={`API ${sdk}`}
                    count={count}
                    total={stats.totalDevices}
                    color={colors.primary}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Factor Specific Manufacturer Spotlight */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ChartBar className="h-5 w-5 text-primary" />
              Top Manufacturers by Device Form Factor
            </h2>
            <p className="text-xs text-muted-foreground">
              Explore OEM market share within individual hardware categories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <DeviceMobile size={18} />
                </div>
                Phone Manufacturers
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhoneManufacturersDialogOpen(true)}
                className="h-7 px-2.5 text-xs hover:bg-muted hover:text-foreground"
              >
                <ChartBar size={14} className="mr-1" />
                View Chart
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-foreground tabular-nums">{phoneCount.toLocaleString()}</div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {stats.totalDevices > 0 ? ((phoneCount / stats.totalDevices) * 100).toFixed(1) : 0}% of catalog
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Interactive breakdown of top smartphone OEMs
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <DeviceTablet size={18} />
                </div>
                Tablet Manufacturers
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTabletManufacturersDialogOpen(true)}
                className="h-7 px-2.5 text-xs hover:bg-muted hover:text-foreground"
              >
                <ChartBar size={14} className="mr-1" />
                View Chart
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-foreground tabular-nums">{tabletCount.toLocaleString()}</div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {stats.totalDevices > 0 ? ((tabletCount / stats.totalDevices) * 100).toFixed(1) : 0}% of catalog
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Interactive breakdown of top tablet OEMs
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Television size={18} />
                </div>
                TV Manufacturers
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTvManufacturersDialogOpen(true)}
                className="h-7 px-2.5 text-xs hover:bg-muted hover:text-foreground"
              >
                <ChartBar size={14} className="mr-1" />
                View Chart
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-foreground tabular-nums">{tvCount.toLocaleString()}</div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {stats.totalDevices > 0 ? ((tvCount / stats.totalDevices) * 100).toFixed(1) : 0}% of catalog
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Interactive breakdown of Android TV & Google TV OEMs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialogs */}
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

      <ArchitectureDialog
        open={architectureDialogOpen}
        onOpenChange={setArchitectureDialogOpen}
        stats={stats}
      />

      <PlatformEvolutionDialog
        open={platformDialogOpen}
        onOpenChange={setPlatformDialogOpen}
        stats={stats}
      />

      <PerformanceTiersDialog
        open={performanceDialogOpen}
        onOpenChange={setPerformanceDialogOpen}
        stats={stats}
      />

      <ScreenResolutionDialog
        open={resolutionDialogOpen}
        onOpenChange={setResolutionDialogOpen}
        stats={stats}
      />

      <ProcessorDiversityDialog
        open={processorDiversityDialogOpen}
        onOpenChange={setProcessorDiversityDialogOpen}
        stats={stats}
      />

      <HighResolutionDialog
        open={highResolutionDialogOpen}
        onOpenChange={setHighResolutionDialogOpen}
        stats={stats}
      />

      <GpuManufacturerDialog
        open={gpuManufacturerDialogOpen}
        onOpenChange={setGpuManufacturerDialogOpen}
        stats={stats}
      />

      <FormFactorManufacturersDialog
        open={phoneManufacturersDialogOpen}
        onOpenChange={setPhoneManufacturersDialogOpen}
        devices={devices}
        formFactor="Phone"
        onFilterByManufacturer={onFilterByManufacturer}
      />

      <FormFactorManufacturersDialog
        open={tabletManufacturersDialogOpen}
        onOpenChange={setTabletManufacturersDialogOpen}
        devices={devices}
        formFactor="Tablet"
        onFilterByManufacturer={onFilterByManufacturer}
      />

      <FormFactorManufacturersDialog
        open={tvManufacturersDialogOpen}
        onOpenChange={setTvManufacturersDialogOpen}
        devices={devices}
        formFactor="TV"
        onFilterByManufacturer={onFilterByManufacturer}
      />
    </div>
  );
};
