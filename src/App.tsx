import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useKV } from '@/hooks/useKV';
import { useDataPreload } from '@/hooks/useDataPreload';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDeviceManager } from '@/hooks/useDeviceManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { AndroidDevice } from '@/types/device';
import { ColorMode } from '@/lib/deviceColors';
import { sanitizeDeviceData } from '@/lib/deviceValidation';
import androidLogo from '@/assets/images/android.svg';

function App() {
  // Mobile detection
  const isMobile = useIsMobile();
  
  // Preload the full device catalog
  const { data: preloadedData } = useDataPreload();

  // Centralized device management with all optimizations
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

  // Tab state management
  const [activeTab, setActiveTab] = useState('devices');
  const fileUploadRef = useRef<FileUploadPanelRef | null>(null);

  // Modal state
  const [selectedDevice, setSelectedDevice] = useState<AndroidDevice | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Color mode state
  const [colorMode, setColorMode] = useKV<ColorMode>('device-color-mode', 'formFactor');

  // Event handlers
  const handleDeviceClick = (device: AndroidDevice) => {
    setSelectedDevice(device);
    setDetailModalOpen(true);
  };

  const handleFilterByManufacturer = (manufacturer: string) => {
    handleFiltersChange({ ...filters, manufacturer });
  };

  const handleFilterByFormFactor = (formFactor: string) => {
    handleFiltersChange({ ...filters, formFactor });
  };

  const handleOpenComparison = () => setComparisonModalOpen(true);
  const handleExportClick = () => setActiveTab('export');

  // Optimized device loading handler
  const handleDevicesLoaded = useCallback((newDevices: AndroidDevice[]) => {
    const sanitizedDevices = sanitizeDeviceData(newDevices);
    setUploadedDevices(sanitizedDevices);
    resetToUploadedDefaults(sanitizedDevices);
    resetPagination(sanitizedDevices.length);
  }, [setUploadedDevices, resetToUploadedDefaults, resetPagination]);

  // Optimized use latest dataset handler
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

  // Optimized clear devices handler
  const handleClearDevices = useCallback(() => {
    setUploadedDevices([]);
    resetToPreloadedDefaults();
    resetPagination(preloadedData ? preloadedData.length : 0);
  }, [setUploadedDevices, resetToPreloadedDefaults, resetPagination, preloadedData]);

  return (
    <ComparisonProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 pb-20">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/50 backdrop-blur-sm mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-50"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-6'}`}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur-md opacity-30 animate-pulse"></div>
                      <img 
                        src={androidLogo} 
                        alt="Android Logo" 
                        className={`relative z-10 drop-shadow-lg transition-transform duration-300 hover:scale-110 animate-float ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}
                      />
                    </div>
                    <div>
                      <h1 className={`font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2 ${isMobile ? 'text-xl' : 'text-4xl'}`}>
                        Android Device Catalog Browser
                      </h1>
                      <p className={`text-muted-foreground/80 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                        Explore and analyze Android devices from the official Device Catalog
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <MobileBanner />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className={isMobile ? 'overflow-x-auto' : ''}>
              <TabsList className={`backdrop-blur-sm bg-card/50 border border-border/50 shadow-lg ${isMobile ? 'grid grid-cols-4 w-max min-w-full gap-1' : 'grid w-full max-w-2xl grid-cols-4'}`}>
                <TabsTrigger 
                  value="upload" 
                  className={`transition-all duration-200 hover:bg-accent/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:shadow-sm ${isMobile ? 'text-xs px-3 py-2 whitespace-nowrap' : ''}`}
                >
                  {isMobile ? 'Upload' : 'Upload Data'}
                </TabsTrigger>
                <TabsTrigger 
                  value="devices" 
                  className={`transition-all duration-200 hover:bg-accent/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:shadow-sm ${isMobile ? 'text-xs px-3 py-2 whitespace-nowrap' : ''}`}
                >
                  {isMobile ? 'Browser' : 'Device Browser'}
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className={`transition-all duration-200 hover:bg-accent/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:shadow-sm ${isMobile ? 'text-xs px-3 py-2 whitespace-nowrap' : ''}`}
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="export" 
                  className={`transition-all duration-200 hover:bg-accent/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:shadow-sm ${isMobile ? 'text-xs px-3 py-2 whitespace-nowrap' : ''}`}
                >
                  {isMobile ? 'Export' : 'Export Data'}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upload" className="space-y-6">
              <motion.div
                key="upload-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
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

            <TabsContent value="devices" className="space-y-6">
              <motion.div
                key="devices-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
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

            <TabsContent value="analytics" className="space-y-6">
              <motion.div
                key="analytics-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <DeviceStatsPanel
                  stats={allStats}
                  devices={devices}
                  onFilterByManufacturer={handleFilterByManufacturer}
                  onFilterByFormFactor={handleFilterByFormFactor}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <motion.div
                key="export-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="grid gap-6 lg:grid-cols-2">
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
        </div>

        <ComparisonBar onOpenComparison={handleOpenComparison} />
        <BackToTopButton />
      </div>
    </ComparisonProvider>
  );
}

export default App;