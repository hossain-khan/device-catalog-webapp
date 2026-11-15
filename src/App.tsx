import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useKV } from '@/hooks/useKV';
import { useDataPreload } from '@/hooks/useDataPreload';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDeviceManager } from '@/hooks/useDeviceManager';
import { trackPageView, trackDeviceAction } from '@/lib/analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DeviceStatsPanel } from '@/components/DeviceStatsPanel';
import { DeviceFiltersPanel } from '@/components/DeviceFiltersPanel';
import { DeviceGrid } from '@/components/DeviceGrid';
import { DeviceDetailModal } from '@/components/DeviceDetailModal';
import { ComparisonBar } from '@/components/ComparisonBar';
import { DeviceComparisonModal } from '@/components/DeviceComparisonModal';
import { FileUploadPanel, FileUploadPanelRef } from '@/components/FileUploadPanel';
import { BackToTopButton } from '@/components/BackToTopButton';
import { DeviceExportPanel } from '@/components/DeviceExportPanel';
import { ExportStatsPanel } from '@/components/ExportStatsPanel';
import { MobileBanner } from '@/components/MobileBanner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { AndroidDevice } from '@/types/device';
import { ColorMode } from '@/lib/deviceColors';
import { sanitizeDeviceData } from '@/lib/deviceValidation';
import {
  DeviceMobile,
  ChartBar,
  Database,
  Export,
  GithubLogo,
} from '@phosphor-icons/react';
import androidLogo from '@/assets/images/android.svg';

function App() {
  const isMobile = useIsMobile();
  const { data: preloadedData } = useDataPreload();

  const {
    devices,
    filteredDevices,
    paginatedDevices,
    filters,
    handleFiltersChange,
    resetToUploadedDefaults,
    resetToPreloadedDefaults,
    isFiltering,
    paginationInfo,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
    allStats,
    uniqueManufacturers,
    uniqueFormFactors,
    uniqueSdkVersions,
    ramRange,
    sdkVersionRange,
    setUploadedDevices
  } = useDeviceManager({ preloadedData, isMobile });

  const [activeTab, setActiveTab] = useState('devices');
  const fileUploadRef = useRef<FileUploadPanelRef | null>(null);

  const [selectedDevice, setSelectedDevice] = useState<AndroidDevice | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  const [colorMode, setColorMode] = useKV<ColorMode>('device-color-mode', 'formFactor');

  useEffect(() => {
    trackPageView('App Loaded', {
      total_devices: devices.length,
      filtered_devices: filteredDevices.length
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeviceClick = (device: AndroidDevice) => {
    setSelectedDevice(device);
    setDetailModalOpen(true);

    trackDeviceAction('view_device', {
      device_name: device.name,
      manufacturer: device.manufacturer,
      form_factor: device.formFactor,
      retail_branding: device.retailBranding
    });
  };

  const handleFilterByManufacturer = (manufacturer: string) => {
    handleFiltersChange({ ...filters, manufacturer });
    setActiveTab('devices');
  };

  const handleFilterByFormFactor = (formFactor: string) => {
    handleFiltersChange({ ...filters, formFactor });
    setActiveTab('devices');
  };

  const handleOpenComparison = () => setComparisonModalOpen(true);
  const handleExportClick = () => setActiveTab('export');

  const handleDevicesLoaded = useCallback((newDevices: AndroidDevice[]) => {
    const sanitizedDevices = sanitizeDeviceData(newDevices);
    setUploadedDevices(sanitizedDevices);
    resetToUploadedDefaults(sanitizedDevices);
    resetPagination(sanitizedDevices.length);
  }, [setUploadedDevices, resetToUploadedDefaults, resetPagination]);

  const handleUseLatestDataset = useCallback(() => {
    setActiveTab('upload');
    setTimeout(() => {
      if (fileUploadRef.current) {
        fileUploadRef.current.activateUrlTab();
      }
      const uploadElement = document.querySelector('[data-upload-section]');
      if (uploadElement) {
        uploadElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }, []);

  const handleClearDevices = useCallback(() => {
    setUploadedDevices([]);
    resetToPreloadedDefaults();
    resetPagination(preloadedData ? preloadedData.length : 0);
  }, [setUploadedDevices, resetToPreloadedDefaults, resetPagination, preloadedData]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    trackPageView(`${tab.charAt(0).toUpperCase() + tab.slice(1)} Tab`, { tab_name: tab });
  };

  return (
    <ComparisonProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col pb-20">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
          {/* Sticky Top Application Header */}
          <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
              {/* Brand Identity */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleTabChange('devices')}
                  className="flex items-center gap-3 text-left group focus-visible:outline-2 focus-visible:outline-ring rounded-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <img
                      src={androidLogo}
                      alt="Android Logo"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="font-semibold text-sm sm:text-base tracking-tight text-foreground truncate">
                        Android Device Catalog
                      </h1>
                      <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-primary/10 text-primary border border-primary/20">
                        Play Console
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground hidden sm:block truncate">
                      Hardware specifications & ecosystem telemetry
                    </p>
                  </div>
                </button>
              </div>

              {/* Center Navigation Tabs (Desktop) */}
              <div className="hidden lg:flex items-center">
                <TabsList className="h-9 bg-muted/60 border border-border/60 p-1 rounded-lg">
                  <TabsTrigger
                    value="devices"
                    className="text-xs px-3 py-1 rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                  >
                    <DeviceMobile className="h-3.5 w-3.5" />
                    <span>Device Browser</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="text-xs px-3 py-1 rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                  >
                    <ChartBar className="h-3.5 w-3.5" />
                    <span>Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="text-xs px-3 py-1 rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>Data Source</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="export"
                    className="text-xs px-3 py-1 rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                  >
                    <Export className="h-3.5 w-3.5" />
                    <span>Export Data</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Right Utilities: Dataset Status Pill, GitHub, Theme Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTabChange('upload')}
                  title="Manage loaded device catalog dataset"
                  className="hidden sm:inline-flex items-center gap-2 h-8 px-3 rounded-full text-xs font-medium bg-muted/60 hover:bg-muted border border-border/70 transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono tabular-nums font-semibold text-foreground">
                    {devices.length.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">devices</span>
                </button>

                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="h-8 w-8 rounded-lg border-border/70 bg-background/60 hover:bg-muted hover:text-foreground"
                >
                  <a
                    href="https://github.com/hossain-khan/android-device-catalog-parser"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View Android Device Catalog Parser on GitHub"
                    title="View on GitHub"
                  >
                    <GithubLogo className="h-4 w-4" />
                  </a>
                </Button>

                <ThemeToggle />
              </div>
            </div>

            {/* Mobile / Tablet Navigation Bar */}
            <div className="lg:hidden border-t border-border/60 bg-muted/30 px-4 py-1.5 overflow-x-auto">
              <TabsList className="grid grid-cols-4 w-full min-w-[320px] h-8 bg-muted/60 p-0.5 rounded-lg">
                <TabsTrigger value="devices" className="text-xs py-1 rounded-md gap-1">
                  <DeviceMobile className="h-3.5 w-3.5" />
                  <span>Browser</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs py-1 rounded-md gap-1">
                  <ChartBar className="h-3.5 w-3.5" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs py-1 rounded-md gap-1">
                  <Database className="h-3.5 w-3.5" />
                  <span>Data</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="text-xs py-1 rounded-md gap-1">
                  <Export className="h-3.5 w-3.5" />
                  <span>Export</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </header>

          {/* Main Workspace Container */}
          <main className="container mx-auto px-4 py-6 flex-1 space-y-6">
            <MobileBanner />

            <TabsContent value="devices" className="space-y-5 mt-0">
              <motion.div
                key="devices-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-5"
              >
                <DeviceFiltersPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  manufacturers={uniqueManufacturers}
                  formFactors={uniqueFormFactors}
                  sdkVersions={uniqueSdkVersions}
                  deviceCount={filteredDevices.length}
                  totalDevices={devices.length}
                  ramRange={ramRange}
                  sdkVersionRange={sdkVersionRange}
                  isFiltering={isFiltering}
                />

                <DeviceGrid
                  devices={paginatedDevices}
                  onDeviceClick={handleDeviceClick}
                  pagination={paginationInfo}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  isLoading={isFiltering}
                  totalDevices={filteredDevices.length}
                  allFilteredDevices={filteredDevices}
                  colorMode={colorMode}
                  onColorModeChange={setColorMode}
                  onExportClick={handleExportClick}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-0">
              <motion.div
                key="analytics-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <DeviceStatsPanel
                  stats={allStats}
                  devices={devices}
                  onFilterByManufacturer={handleFilterByManufacturer}
                  onFilterByFormFactor={handleFilterByFormFactor}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6 mt-0">
              <motion.div
                key="upload-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <FileUploadPanel
                  ref={fileUploadRef}
                  onDevicesLoaded={handleDevicesLoaded}
                  onClearDevices={handleClearDevices}
                  deviceCount={devices.length}
                  currentDevices={devices}
                  onActivateUrlTab={handleUseLatestDataset}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="export" className="space-y-6 mt-0">
              <motion.div
                key="export-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="grid gap-6 lg:grid-cols-2 items-start">
                  <DeviceExportPanel
                    devices={devices}
                    filteredDevices={filteredDevices}
                    isFiltered={
                      filters.search !== '' ||
                      filters.formFactor !== 'all' ||
                      filters.manufacturer !== 'all' ||
                      filters.minRam !== 'all' ||
                      filters.sdkVersion !== 'all' ||
                      (filters.ramRange ? (filters.ramRange[0] !== ramRange[0] || filters.ramRange[1] !== ramRange[1]) : false) ||
                      (filters.sdkVersionRange ? (filters.sdkVersionRange[0] !== sdkVersionRange[0] || filters.sdkVersionRange[1] !== sdkVersionRange[1]) : false)
                    }
                  />
                  <ExportStatsPanel devices={devices} />
                </div>
              </motion.div>
            </TabsContent>
          </main>
        </Tabs>

        <DeviceDetailModal
          device={selectedDevice}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
        />

        <DeviceComparisonModal
          open={comparisonModalOpen}
          onOpenChange={setComparisonModalOpen}
        />

        <ComparisonBar onOpenComparison={handleOpenComparison} />
        <BackToTopButton />
      </div>
    </ComparisonProvider>
  );
}

export default App;
