import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useKV } from '@/hooks/useKV';
import { useDebounce } from '@/hooks/useDebounce';
import { useDataPreload } from '@/hooks/useDataPreload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceStatsPanel } from '@/components/DeviceStatsPanel';
import { DeviceFiltersPanel } from '@/components/DeviceFiltersPanel';
import { DeviceGrid } from '@/components/DeviceGrid';
import { DeviceDetailModal } from '@/components/DeviceDetailModal';
import { ComparisonBar } from '@/components/ComparisonBar';
import { DeviceComparisonModal } from '@/components/DeviceComparisonModal';
import { FileUploadPanel, FileUploadPanelRef } from '@/components/FileUploadPanel';
import { DataPreloading } from '@/components/DataPreloading';

import { BackToTopButton } from '@/components/BackToTopButton';
import { DeviceExportPanel } from '@/components/DeviceExportPanel';
import { ExportStatsPanel } from '@/components/ExportStatsPanel';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { sampleDevices } from '@/data/devices';
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
import { paginateArray, DEFAULT_ITEMS_PER_PAGE } from '@/lib/paginationUtils';
import androidLogo from '@/assets/images/android.svg';

function App() {
  // All hooks must be called at the top level before any conditional returns
  // Preload the full device catalog
  const { isLoading: isPreloading, progress, error: preloadError, data: preloadedData, deviceCount } = useDataPreload();
  
  // Use uploaded devices if available, otherwise use preloaded data, then fall back to sample data
  const [uploadedDevices, setUploadedDevices] = useKV<AndroidDevice[]>('uploaded-devices', []);
  
  // Tab state management
  const [activeTab, setActiveTab] = useState('devices');
  
  // Ref for the file upload panel to trigger URL tab
  const fileUploadRef = useRef<FileUploadPanelRef | null>(null);
  
  // Determine which devices to use
  const devices = uploadedDevices.length > 0 ? uploadedDevices : (preloadedData || sampleDevices);
  
  // Calculate ranges from available devices
  const ramRange = useMemo(() => getRamRange(devices), [devices]);
  const sdkVersionRange = useMemo(() => getSdkVersionRange(devices), [devices]);
  
  const [filters, setFilters] = useKV<DeviceFilters>('device-filters', {
    search: '',
    formFactor: 'all',
    manufacturer: 'all',
    minRam: 'all',
    sdkVersion: 'all',
    ramRange: [0, 16384], // Default fallback range
    sdkVersionRange: [23, 35] // Default fallback range
  });

  // Pagination state
  const [pagination, setPagination] = useKV<PaginationState>('device-pagination', {
    currentPage: 1,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    totalItems: 0
  });

  // Debounce search to improve performance
  const debouncedFilters = useDebounce(filters, 300);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Update ranges in filters when devices change
  useMemo(() => {
    if (!filters.ramRange || !filters.sdkVersionRange || 
        (filters.ramRange[0] === 0 && filters.ramRange[1] === 16384) ||
        (filters.sdkVersionRange[0] === 23 && filters.sdkVersionRange[1] === 35)) {
      setFilters(current => ({
        ...current,
        ramRange: ramRange,
        sdkVersionRange: sdkVersionRange
      }));
    }
  }, [ramRange, sdkVersionRange, filters.ramRange, filters.sdkVersionRange, setFilters]);
  
  const [selectedDevice, setSelectedDevice] = useState<AndroidDevice | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  
  // Color mode state
  const [colorMode, setColorMode] = useKV<ColorMode>('device-color-mode', 'formFactor');

  // Filter devices with debounced search
  const filteredDevices = useMemo(() => {
    const filtered = filterDevices(devices, debouncedFilters);
    // Reset to page 1 when filters change and update total items
    if (filtered.length !== pagination.totalItems) {
      setPagination(current => ({
        ...current,
        currentPage: 1,
        totalItems: filtered.length
      }));
    }
    return filtered;
  }, [devices, debouncedFilters, pagination.totalItems, setPagination]);

  // Track filtering state
  useMemo(() => {
    setIsFiltering(filters !== debouncedFilters);
  }, [filters, debouncedFilters]);

  // Paginate filtered devices
  const { items: paginatedDevices, pagination: paginationInfo } = useMemo(() => 
    paginateArray(filteredDevices, pagination.currentPage, pagination.itemsPerPage),
    [filteredDevices, pagination.currentPage, pagination.itemsPerPage]
  );

  const allStats = useMemo(() => 
    calculateDeviceStats(devices), 
    [devices]
  );

  const uniqueManufacturers = useMemo(() => 
    getUniqueManufacturers(devices), 
    [devices]
  );

  const uniqueFormFactors = useMemo(() => 
    getUniqueFormFactors(devices), 
    [devices]
  );

  const uniqueSdkVersions = useMemo(() => 
    getUniqueSdkVersions(devices), 
    [devices]
  );

  const handleDeviceClick = (device: AndroidDevice) => {
    setSelectedDevice(device);
    setDetailModalOpen(true);
  };

  const handleFilterByManufacturer = (manufacturer: string) => {
    setFilters(current => ({ ...current, manufacturer }));
  };

  const handleFilterByFormFactor = (formFactor: string) => {
    setFilters(current => ({ ...current, formFactor }));
  };

  const handleOpenComparison = () => {
    setComparisonModalOpen(true);
  };

  const handleExportClick = () => {
    setActiveTab('export');
  };

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setPagination(current => ({ ...current, currentPage: page }));
  }, [setPagination]);

  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    setPagination(current => ({ 
      ...current, 
      itemsPerPage, 
      currentPage: 1 // Reset to first page when changing page size
    }));
  }, [setPagination]);

  // Optimized filter change handler
  const handleFiltersChange = useCallback((newFilters: DeviceFilters) => {
    setFilters(newFilters);
    // Reset pagination when filters change
    setPagination(current => ({ ...current, currentPage: 1 }));
  }, [setFilters, setPagination]);

  const handleDevicesLoaded = (newDevices: AndroidDevice[]) => {
    // Clear old device data and comparison state before loading new data
    const sanitizedDevices = sanitizeDeviceData(newDevices);
    setUploadedDevices(sanitizedDevices);
    
    // Calculate new ranges for the loaded devices
    const newRamRange = getRamRange(sanitizedDevices);
    const newSdkVersionRange = getSdkVersionRange(sanitizedDevices);
    
    // Reset filters to default when new data is loaded
    setFilters({
      search: '',
      formFactor: 'all',
      manufacturer: 'all',
      minRam: 'all',
      sdkVersion: 'all',
      ramRange: newRamRange,
      sdkVersionRange: newSdkVersionRange
    });

    // Reset pagination
    setPagination({
      currentPage: 1,
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
      totalItems: sanitizedDevices.length
    });
  };

  const handleUseLatestDataset = useCallback(() => {
    // Switch to upload tab
    setActiveTab('upload');
    
    // Wait for tab to render then trigger URL tab activation and scroll
    setTimeout(() => {
      if (fileUploadRef.current) {
        fileUploadRef.current.activateUrlTab();
      }
      
      // Scroll to the upload section
      const uploadElement = document.querySelector('[data-upload-section]');
      if (uploadElement) {
        uploadElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 150); // Small delay to ensure tab content is rendered
  }, []);

  const handleClearDevices = () => {
    setUploadedDevices([]);
    // Reset filters when clearing data
    const defaultRamRange = getRamRange(sampleDevices);
    const defaultSdkVersionRange = getSdkVersionRange(sampleDevices);
    
    setFilters({
      search: '',
      formFactor: 'all',
      manufacturer: 'all',
      minRam: 'all',
      sdkVersion: 'all',
      ramRange: defaultRamRange,
      sdkVersionRange: defaultSdkVersionRange
    });

    // Reset pagination
    setPagination({
      currentPage: 1,
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
      totalItems: sampleDevices.length
    });
  };

  return (
    <ComparisonProvider>
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <img 
                  src={androidLogo} 
                  alt="Android Logo" 
                  className="w-16 h-16"
                />
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">
                    Android Device Catalog Browser
                  </h1>
                  <p className="text-muted-foreground">
                    Explore and analyze Android devices from the official Device Catalog
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="upload">Upload Data</TabsTrigger>
              <TabsTrigger value="devices">Device Browser</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="export">Export Data</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <FileUploadPanel
                ref={fileUploadRef}
                onDevicesLoaded={handleDevicesLoaded}
                onClearDevices={handleClearDevices}
                deviceCount={devices.length}
                currentDevices={devices}
                onActivateUrlTab={handleUseLatestDataset}
              />
            </TabsContent>

            <TabsContent value="devices" className="space-y-6">
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
                onExportClick={handleExportClick}
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
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <DeviceStatsPanel
                stats={allStats}
                onFilterByManufacturer={handleFilterByManufacturer}
                onFilterByFormFactor={handleFilterByFormFactor}
              />
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
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
                    (filters.ramRange && (filters.ramRange[0] !== ramRange[0] || filters.ramRange[1] !== ramRange[1])) ||
                    (filters.sdkVersionRange && (filters.sdkVersionRange[0] !== sdkVersionRange[0] || filters.sdkVersionRange[1] !== sdkVersionRange[1]))
                  }
                />
                <ExportStatsPanel devices={devices} />
              </div>
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