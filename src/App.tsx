import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceStatsPanel } from '@/components/DeviceStatsPanel';
import { DeviceFiltersPanel } from '@/components/DeviceFiltersPanel';
import { DeviceGrid } from '@/components/DeviceGrid';
import { DeviceDetailModal } from '@/components/DeviceDetailModal';
import { sampleDevices } from '@/data/devices';
import { AndroidDevice, DeviceFilters } from '@/types/device';
import { 
  filterDevices, 
  calculateDeviceStats, 
  getUniqueManufacturers, 
  getUniqueFormFactors, 
  getUniqueSdkVersions 
} from '@/lib/deviceUtils';

function App() {
  const [filters, setFilters] = useKV<DeviceFilters>('device-filters', {
    search: '',
    formFactor: 'all',
    manufacturer: 'all',
    minRam: 'all',
    sdkVersion: 'all'
  });

  const [selectedDevice, setSelectedDevice] = useState<AndroidDevice | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const devices = sampleDevices;

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

  return (
    <div className="min-h-screen bg-background">
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="devices">Device Browser</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-6">
            <DeviceFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              manufacturers={uniqueManufacturers}
              formFactors={uniqueFormFactors}
              sdkVersions={uniqueSdkVersions}
              deviceCount={filteredDevices.length}
              totalDevices={devices.length}
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
      </div>
    </div>
  );
}

export default App;