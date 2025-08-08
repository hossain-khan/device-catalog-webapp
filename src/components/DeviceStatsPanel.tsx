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
import { ChartBar, DeviceMobile, DeviceTablet, Television, ChartPie, List } from "@phosphor-icons/react";

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
  devices: AndroidDevice[]; // Add devices for form factor filtering
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
  
  // New form factor-specific dialogs
  const [phoneManufacturersDialogOpen, setPhoneManufacturersDialogOpen] = useState(false);
  const [tabletManufacturersDialogOpen, setTabletManufacturersDialogOpen] = useState(false);
  const [tvManufacturersDialogOpen, setTvManufacturersDialogOpen] = useState(false);
  
  // Chart view modes for categories that need charts
  const [processorViewMode, setProcessorViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [gpuViewMode, setGpuViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [architectureViewMode, setArchitectureViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [platformViewMode, setPlatformViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [performanceViewMode, setPerformanceViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  const [resolutionViewMode, setResolutionViewMode] = useState<'bar' | 'pie' | 'list'>('list');
  
  const topManufacturers = Object.entries(stats.manufacturerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topSdkVersions = Object.entries(stats.sdkVersionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Prepare data for enhanced charts
  const manufacturerChartData = useMemo(() => {
    return Object.entries(stats.manufacturerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([manufacturer, count]) => ({
        label: manufacturer,
        value: count,
        color: getManufacturerColors(manufacturer).primary
      }));
  }, [stats.manufacturerCounts]);

  const formFactorChartData = useMemo(() => {
    return Object.entries(stats.formFactorCounts)
      .map(([formFactor, count]) => ({
        label: formFactor,
        value: count,
        color: getFormFactorColors(formFactor).primary
      }));
  }, [stats.formFactorCounts]);

  // Form factor specific counts
  const phoneCount = stats.formFactorCounts['Phone'] || 0;
  const tabletCount = stats.formFactorCounts['Tablet'] || 0;
  const tvCount = stats.formFactorCounts['TV'] || 0;

  // Prepare chart data for categories that need charts
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
      .map(([tier, count], index) => {
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
      {/* Main Stats Cards */}
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

      {/* New Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="64-bit Ready" 
          value={stats.arm64SupportCount}
          subtitle={`${((stats.arm64SupportCount / stats.totalDevices) * 100).toFixed(1)}% ARM64 support`}
        />
        <StatsCard 
          title="Multi-ABI Support" 
          value={stats.multiAbiDeviceCount}
          subtitle={`${((stats.multiAbiDeviceCount / stats.totalDevices) * 100).toFixed(1)}% support multiple archs`}
        />
        <StatsCard 
          title="OpenGL ES 3.2 Support" 
          value={`${((stats.openGlEs32SupportCount / stats.totalDevices) * 100).toFixed(1)}%`}
          subtitle="Devices with modern graphics support"
        />
        <StatsCard 
          title="Modern Platform" 
          value={stats.platformCompatibility.recent + stats.platformCompatibility.latest}
          subtitle={`${(((stats.platformCompatibility.recent + stats.platformCompatibility.latest) / stats.totalDevices) * 100).toFixed(1)}% Android 12+ capable devices`}
        />
      </div>

      {/* New Processor & Display Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processor Diversity</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={processorViewMode === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProcessorViewMode('bar')}
                className="h-7 px-2 text-xs"
              >
                <ChartBar size={12} />
              </Button>
              <Button
                variant={processorViewMode === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProcessorViewMode('pie')}
                className="h-7 px-2 text-xs"
              >
                <ChartPie size={12} />
              </Button>
              <Button
                variant={processorViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProcessorViewMode('list')}
                className="h-7 px-2 text-xs"
              >
                <List size={12} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProcessorDiversityDialogOpen(true)}
                className="h-7 px-2 text-xs"
              >
                Show All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {processorViewMode === 'list' ? (
              <>
                <div className="text-2xl font-bold text-primary">{stats.processorDiversityCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique processor models</p>
              </>
            ) : processorViewMode === 'bar' ? (
              <RechartsBarChart
                data={processorChartData}
                height={260}
                className="w-full"
              />
            ) : (
              <RechartsPieChart
                data={processorChartData}
                height={200}
                showLegend={false}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">High-Resolution Support</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHighResolutionDialogOpen(true)}
              className="h-8 px-3"
            >
              <ChartBar size={16} className="mr-1" />
              Show All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{((stats.highResolutionSupportCount / stats.totalDevices) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Devices with 1080p+ displays</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">GPU Ecosystem</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={gpuViewMode === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGpuViewMode('bar')}
                className="h-7 px-2 text-xs"
              >
                <ChartBar size={12} />
              </Button>
              <Button
                variant={gpuViewMode === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGpuViewMode('pie')}
                className="h-7 px-2 text-xs"
              >
                <ChartPie size={12} />
              </Button>
              <Button
                variant={gpuViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGpuViewMode('list')}
                className="h-7 px-2 text-xs"
              >
                <List size={12} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGpuManufacturerDialogOpen(true)}
                className="h-7 px-2 text-xs"
              >
                Show All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {gpuViewMode === 'list' ? (
              <>
                <div className="text-2xl font-bold text-primary">{Object.keys(stats.gpuManufacturerCounts).length}</div>
                <p className="text-xs text-muted-foreground mt-1">GPU manufacturer variety</p>
              </>
            ) : gpuViewMode === 'bar' ? (
              <RechartsBarChart
                data={gpuChartData}
                height={260}
                className="w-full"
              />
            ) : (
              <RechartsPieChart
                data={gpuChartData}
                height={200}
                showLegend={false}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">CPU Architecture</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={architectureViewMode === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setArchitectureViewMode('bar')}
                className="h-8 px-2"
              >
                <ChartBar size={14} />
              </Button>
              <Button
                variant={architectureViewMode === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setArchitectureViewMode('pie')}
                className="h-8 px-2"
              >
                <ChartPie size={14} />
              </Button>
              <Button
                variant={architectureViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setArchitectureViewMode('list')}
                className="h-8 px-2"
              >
                <List size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArchitectureDialogOpen(true)}
                className="h-8 px-3"
              >
                Show All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {architectureViewMode === 'list' ? (
              <div className="space-y-3">
                {Object.entries(stats.architectureCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([arch, count]) => {
                  const colors = PERFORMANCE_TIERS[0].colors;
                  return (
                    <div key={arch} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded border" 
                          style={{ backgroundColor: colors.primary }}
                        />
                        <span className="text-sm font-medium">{arch}</span>
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
            ) : architectureViewMode === 'bar' ? (
              <RechartsBarChart
                data={architectureChartData}
                height={250}
                className="w-full"
              />
            ) : (
              <RechartsPieChart
                data={architectureChartData}
                height={250}
                showLegend={false}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Platform Evolution</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={platformViewMode === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatformViewMode('bar')}
                className="h-8 px-2"
              >
                <ChartBar size={14} />
              </Button>
              <Button
                variant={platformViewMode === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatformViewMode('pie')}
                className="h-8 px-2"
              >
                <ChartPie size={14} />
              </Button>
              <Button
                variant={platformViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatformViewMode('list')}
                className="h-8 px-2"
              >
                <List size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlatformDialogOpen(true)}
                className="h-8 px-3"
              >
                Show All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {platformViewMode === 'list' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded border" 
                      style={{ backgroundColor: '#ef4444' }}
                    />
                    <span className="text-sm font-medium">Legacy (API ≤ 25)</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                    {stats.platformCompatibility.legacy} devices
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded border" 
                      style={{ backgroundColor: '#f59e0b' }}
                    />
                    <span className="text-sm font-medium">Modern (API 26-30)</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    {stats.platformCompatibility.modern} devices
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded border" 
                      style={{ backgroundColor: '#3b82f6' }}
                    />
                    <span className="text-sm font-medium">Recent (API 31-33)</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    {stats.platformCompatibility.recent} devices
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded border" 
                      style={{ backgroundColor: '#10b981' }}
                    />
                    <span className="text-sm font-medium">Latest (API ≥ 34)</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    {stats.platformCompatibility.latest} devices
                  </Badge>
                </div>
              </div>
            ) : platformViewMode === 'bar' ? (
              <RechartsBarChart
                data={platformChartData}
                height={250}
                className="w-full"
              />
            ) : (
              <RechartsPieChart
                data={platformChartData}
                height={250}
                showLegend={false}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Performance Tiers</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={performanceViewMode === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPerformanceViewMode('bar')}
                className="h-8 px-2"
              >
                <ChartBar size={14} />
              </Button>
              <Button
                variant={performanceViewMode === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPerformanceViewMode('pie')}
                className="h-8 px-2"
              >
                <ChartPie size={14} />
              </Button>
              <Button
                variant={performanceViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPerformanceViewMode('list')}
                className="h-8 px-2"
              >
                <List size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPerformanceDialogOpen(true)}
                className="h-8 px-3"
              >
                Show All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {performanceViewMode === 'list' ? (
              <div className="space-y-3">
                {Object.entries(stats.performanceTierCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 4)
                  .map(([tier, count]) => {
                  const tierColors = PERFORMANCE_TIERS.find(t => t.name.toLowerCase() === tier.toLowerCase())?.colors || PERFORMANCE_TIERS[0].colors;
                  return (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded border" 
                          style={{ backgroundColor: tierColors.primary }}
                        />
                        <span className="text-sm font-medium capitalize">{tier}</span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: tierColors.secondary, 
                          color: tierColors.text 
                        }}
                      >
                        {count} devices
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : performanceViewMode === 'bar' ? (
              <RechartsBarChart
                data={performanceChartData}
                height={250}
                className="w-full"
              />
            ) : (
              <RechartsPieChart
                data={performanceChartData}
                height={250}
                showLegend={false}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Screen Resolutions</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={resolutionViewMode === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setResolutionViewMode('bar')}
                className="h-8 px-2"
              >
                <ChartBar size={14} />
              </Button>
              <Button
                variant={resolutionViewMode === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setResolutionViewMode('pie')}
                className="h-8 px-2"
              >
                <ChartPie size={14} />
              </Button>
              <Button
                variant={resolutionViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setResolutionViewMode('list')}
                className="h-8 px-2"
              >
                <List size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResolutionDialogOpen(true)}
                className="h-8 px-3"
              >
                Show All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {resolutionViewMode === 'list' ? (
              <div className="space-y-3">
                {Object.entries(stats.screenResolutionCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([resolution, count]) => {
                  const colors = getSdkEraColors(30);
                  return (
                    <div key={resolution} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded border" 
                          style={{ backgroundColor: colors.primary }}
                        />
                        <span className="text-sm font-medium">{resolution}</span>
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
            ) : resolutionViewMode === 'bar' ? (
              <RechartsBarChart
                data={resolutionChartData}
                height={250}
                className="w-full"
              />
            ) : (
              <RechartsPieChart
                data={resolutionChartData}
                height={250}
                showLegend={false}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Original Analytics Panels */}
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
              className="h-8 px-3 hover:bg-muted hover:text-foreground"
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

      {/* Form Factor Specific Manufacturer Analysis */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <ChartBar className="h-5 w-5" />
          Top Manufacturers by Device Form Factor
        </h2>

        {/* Form Factor Specific Manufacturer Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DeviceMobile size={18} />
                Phone Manufacturers
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhoneManufacturersDialogOpen(true)}
                className="h-8 px-3"
              >
                <ChartBar size={16} className="mr-1" />
                View Chart
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{phoneCount.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">Phone devices</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click "View Chart" to see top phone manufacturers with interactive visualizations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DeviceTablet size={18} />
                Tablet Manufacturers
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTabletManufacturersDialogOpen(true)}
                className="h-8 px-3"
              >
                <ChartBar size={16} className="mr-1" />
                View Chart
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{tabletCount.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">Tablet devices</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click "View Chart" to see top tablet manufacturers with interactive visualizations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Television size={18} />
                TV Manufacturers
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTvManufacturersDialogOpen(true)}
                className="h-8 px-3"
              >
                <ChartBar size={16} className="mr-1" />
                View Chart
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{tvCount.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">TV devices</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click "View Chart" to see top TV manufacturers with interactive visualizations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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

      {/* Form Factor Specific Manufacturer Dialogs */}
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
