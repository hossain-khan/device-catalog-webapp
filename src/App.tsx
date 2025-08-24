import { useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useKV } from '@/hooks/useKV';
import { useDebounce } from '@/hooks/useDebounce';
import { useDataPreload } from '@/hooks/useDataPreload';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { AndroidDevice, DeviceFilters, PaginationState } from '@/types/device';
import { ColorMode } from '@/lib/deviceColors';
import { 
  filterDevices, 
  calculateDeviceStats, 
  getUniqueManufacturers, 
  getUniqueFormFactors, 
  getUniqueSdkVersions,
  getRamRange,
  getSdkVersionRange
} from '@/lib/deviceUtils';
import { sanitizeDeviceData } from '@/lib/deviceValidation';
import { paginateArray, DEFAULT_ITEMS_PER_PAGE, MOBILE_DEFAULT_ITEMS_PER_PAGE } from '@/lib/paginationUtils';
import androidLogo from '@/assets/images/android.svg';

function App() {
  // Mobile detection
  const isMobile = useIsMobile();
  
  // Mobile-aware pagination defaults
  const getDefaultItemsPerPage = () => isMobile ? MOBILE_DEFAULT_ITEMS_PER_PAGE : DEFAULT_ITEMS_PER_PAGE;
  
  // Preload the full device catalog
  const { data: preloadedData } = useDataPreload();

  // Use uploaded devices if available, otherwise use preloaded data
  const [uploadedDevices, setUploadedDevices] = useKV<AndroidDevice[]>('uploaded-devices', []);

  // Memoized devices selection
  const devices = useMemo(() => (
    uploadedDevices.length > 0 ? uploadedDevices : (preloadedData || [])
  ), [uploadedDevices, preloadedData]);

  // Tab state management
  const [activeTab, setActiveTab] = useState('devices');
  const fileUploadRef = useRef<FileUploadPanelRef | null>(null);

  // Calculate ranges from available devices
  const ramRange = useMemo(() => getRamRange(devices), [devices]);
  const sdkVersionRange = useMemo(() => getSdkVersionRange(devices), [devices]);

  const [filters, setFilters] = useKV<DeviceFilters>('device-filters', {
    search: '',
    formFactor: 'all',
    manufacturer: 'all',
    manufacturers: [], // Initialize empty manufacturers array
    minRam: 'all',
    sdkVersion: 'all'
    // Don't initialize ramRange and sdkVersionRange - they'll be set when valid data is available
  });

  // Migration: Ensure manufacturers array exists for backwards compatibility
  if (!filters.manufacturers) {
    setFilters({
      ...filters,
      manufacturers: []
    });
  }

  // Pagination state
  const [pagination, setPagination] = useKV<PaginationState>('device-pagination', {
    currentPage: 1,
    itemsPerPage: getDefaultItemsPerPage(),
    totalItems: 0
  });

  // Debounce search to improve performance
  const debouncedFilters = useDebounce(filters, 300);
  const [isFiltering, setIsFiltering] = useState(false);

  // Update ranges in filters when devices change and no ranges are set yet
  const shouldUpdateRanges = !filters.ramRange || !filters.sdkVersionRange;
  
  // Only set ranges if devices are available and ranges are valid (not Infinity/-Infinity)
  const hasValidRanges = (
    devices.length > 0 &&
    ramRange[0] !== Infinity && ramRange[1] !== -Infinity &&
    sdkVersionRange[0] !== Infinity && sdkVersionRange[1] !== -Infinity
  );
  
  if (shouldUpdateRanges && hasValidRanges) {
    setFilters({
      ...filters,
      ramRange: ramRange,
      sdkVersionRange: sdkVersionRange,
      manufacturers: filters.manufacturers || [] // Preserve manufacturers array
    });
  }

  // Filter devices with debounced search
  const filteredDevices = useMemo(() => {
    const filtered = filterDevices(devices, debouncedFilters);
    if (filtered.length !== pagination.totalItems) {
      setPagination({
        ...pagination,
        currentPage: 1,
        totalItems: filtered.length
      });
    }
    return filtered;
  }, [devices, debouncedFilters, pagination, setPagination]);

  // Track filtering state
  useMemo(() => {
    setIsFiltering(filters !== debouncedFilters);
  }, [filters, debouncedFilters]);

  // Paginate filtered devices
  const { items: paginatedDevices, pagination: paginationInfo } = useMemo(() => 
    paginateArray(filteredDevices, pagination.currentPage, pagination.itemsPerPage),
    [filteredDevices, pagination.currentPage, pagination.itemsPerPage]
  );

  const allStats = useMemo(() => calculateDeviceStats(devices), [devices]);
  const uniqueManufacturers = useMemo(() => getUniqueManufacturers(devices), [devices]);
  const uniqueFormFactors = useMemo(() => getUniqueFormFactors(devices), [devices]);
  const uniqueSdkVersions = useMemo(() => getUniqueSdkVersions(devices), [devices]);

  const handleDeviceClick = (device: AndroidDevice) => {
    setSelectedDevice(device);
    setDetailModalOpen(true);
  };

  const [selectedDevice, setSelectedDevice] = useState<AndroidDevice | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Color mode state
  const [colorMode, setColorMode] = useKV<ColorMode>('device-color-mode', 'formFactor');

  const handleFilterByManufacturer = (manufacturer: string) => {
    setFilters({ ...filters, manufacturer });
  };
  const handleFilterByFormFactor = (formFactor: string) => {
    setFilters({ ...filters, formFactor });
  };

  const handleOpenComparison = () => setComparisonModalOpen(true);
  const handleExportClick = () => setActiveTab('export');

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setPagination({ ...pagination, currentPage: page });
  }, [pagination, setPagination]);

  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    setPagination({ 
      ...pagination, 
      itemsPerPage, 
      currentPage: 1 
    });
  }, [pagination, setPagination]);

  // Optimized filter change handler
  const handleFiltersChange = useCallback((newFilters: DeviceFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, currentPage: 1 });
  }, [setFilters, setPagination, pagination]);

  const handleDevicesLoaded = (newDevices: AndroidDevice[]) => {
    const sanitizedDevices = sanitizeDeviceData(newDevices);
    setUploadedDevices(sanitizedDevices);
    const newRamRange = getRamRange(sanitizedDevices);
    const newSdkVersionRange = getSdkVersionRange(sanitizedDevices);
    setFilters({
      search: '',
      formFactor: 'all',
      manufacturer: 'all',
      manufacturers: [], // Add missing manufacturers array
      minRam: 'all',
      sdkVersion: 'all',
      ramRange: newRamRange,
      sdkVersionRange: newSdkVersionRange
    });
    setPagination({
      currentPage: 1,
      itemsPerPage: getDefaultItemsPerPage(),
      totalItems: sanitizedDevices.length
    });
  };

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

  const handleClearDevices = () => {
    setUploadedDevices([]);
    const defaultRamRange = getRamRange(preloadedData || []);
    const defaultSdkVersionRange = getSdkVersionRange(preloadedData || []);
    setFilters({
      search: '',
      formFactor: 'all',
      manufacturer: 'all',
      manufacturers: [], // Add missing manufacturers array
      minRam: 'all',
      sdkVersion: 'all',
      ramRange: defaultRamRange,
      sdkVersionRange: defaultSdkVersionRange
    });
    setPagination({
      currentPage: 1,
      itemsPerPage: getDefaultItemsPerPage(),
      totalItems: preloadedData ? preloadedData.length : 0
    });
  };

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