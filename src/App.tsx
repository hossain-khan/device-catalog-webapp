import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceStatsPanel } from '@/components/DeviceStatsPanel';
import { DeviceFiltersPanel } from '@/components/DeviceFiltersPanel';
import { DeviceGrid } from '@/components/DeviceGrid';
import { DeviceDetailModal } from '@/components/DeviceDetailModal';
import { ComparisonBar } from '@/components/ComparisonBar';
import { DeviceComparisonModal } from '@/components/DeviceComparisonModal';
import { FileUploadPanel } from '@/components/FileUploadPanel';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { sampleDevices } from '@/data/devices';
import { AndroidDevice, DeviceFilters } from '@/types/device';
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

function App() {
  // Use uploaded devices if available, otherwise fall back to sample data
  const [uploadedDevices, setUploadedDevices] = useKV<AndroidDevice[]>('uploaded-devices', []);
  const devices = uploadedDevices.length > 0 ? uploadedDevices : sampleDevices;
  
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

  const filteredDevices = useMemo(() => 
    filterDevices(devices, filters), 
    [devices, filters]
  );

  const stats = useMemo(() => 
    calculateDeviceStats(filteredDevices), 
    [filteredDevices]
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
  };

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
  };

  return (
    <ComparisonProvider>
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Android Device Catalog Browser
            </h1>
            <p className="text-muted-foreground">
              Explore and analyze Android devices from the official Device Catalog
            </p>
          </div>

          <Tabs defaultValue="devices" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="upload">Upload Data</TabsTrigger>
              <TabsTrigger value="devices">Device Browser</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <FileUploadPanel
                onDevicesLoaded={handleDevicesLoaded}
                onClearDevices={handleClearDevices}
                deviceCount={devices.length}
              />
            </TabsContent>

            <TabsContent value="devices" className="space-y-6">
              <DeviceFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                manufacturers={uniqueManufacturers}
                formFactors={uniqueFormFactors}
                sdkVersions={uniqueSdkVersions}
                deviceCount={filteredDevices.length}
                totalDevices={devices.length}
                ramRange={ramRange}
                sdkVersionRange={sdkVersionRange}
              />

              <DeviceGrid
                devices={filteredDevices}
                onDeviceClick={handleDeviceClick}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <DeviceStatsPanel
                stats={allStats}
                onFilterByManufacturer={handleFilterByManufacturer}
                onFilterByFormFactor={handleFilterByFormFactor}
              />
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
      </div>
    </ComparisonProvider>
  );
}

export default App;