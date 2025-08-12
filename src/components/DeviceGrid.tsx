import { memo, useCallback, useState, lazy, Suspense } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { DeviceCard } from "./DeviceCard";
import { DeviceCardSkeleton } from "./DeviceCardSkeleton";
import { PaginationControls } from "./PaginationControls";
import { ColorModeControls } from "./ColorModeControls";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { ColorMode } from "@/lib/deviceColors";
import { PaginationInfo } from "@/lib/paginationUtils";
import { CaretDown, Export } from '@phosphor-icons/react';

// Lazy load heavy components
const DeviceJsonModal = lazy(() => import("./DeviceJsonModal").then(module => ({ default: module.DeviceJsonModal })));
const DeviceColorInfo = lazy(() => import("./DeviceColorInfo").then(module => ({ default: module.DeviceColorInfo })));
const CategoryDistribution = lazy(() => import("./CategoryDistribution").then(module => ({ default: module.CategoryDistribution })));

interface DeviceGridProps {
  devices: AndroidDevice[];
  allFilteredDevices?: AndroidDevice[];
  onDeviceClick: (device: AndroidDevice) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
  totalDevices?: number;
  colorMode?: ColorMode;
  onColorModeChange?: (mode: ColorMode) => void;
  onExportClick?: () => void;
}

export const DeviceGrid = memo(({ 
  devices, 
  allFilteredDevices,
  onDeviceClick, 
  pagination,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  totalDevices,
  colorMode = 'formFactor',
  onColorModeChange,
  onExportClick
}: DeviceGridProps) => {
  const isMobile = useIsMobile();
  const [jsonModalDevice, setJsonModalDevice] = useState<AndroidDevice | null>(null);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [colorInfoOpen, setColorInfoOpen] = useState(false);

  const handleShowJson = useCallback((device: AndroidDevice) => {
    setJsonModalDevice(device);
    setJsonModalOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DeviceCardSkeleton count={pagination?.itemsPerPage || 24} />
        {pagination && onPageChange && onItemsPerPageChange && (
          <PaginationControls
            pagination={pagination}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            scrollToTopOnPageChange={false}
          />
        )}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📱</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No devices found</h3>
        <p className="text-muted-foreground max-w-sm">
          Try adjusting your search terms or filters to find the devices you're looking for.
        </p>
        {totalDevices !== undefined && totalDevices > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {totalDevices.toLocaleString()} devices available in total
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Color mode controls with collapsible color information */}
      {onColorModeChange && (
        <div className="space-y-4">
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
            <ColorModeControls 
              colorMode={colorMode} 
              onColorModeChange={onColorModeChange} 
            />
            
            {devices.length > 0 && (
              <div className={`flex items-center gap-2 ${isMobile ? 'mt-2' : ''}`}>
                {/* Export button */}
                {onExportClick && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onExportClick}
                    className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
                  >
                    <Export className="h-4 w-4" />
                    Export
                  </Button>
                )}
                
                {/* Color Coding Information button */}
                <Collapsible open={colorInfoOpen} onOpenChange={setColorInfoOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-muted hover:text-foreground">
                      Color Coding Information
                      <CaretDown className={`h-4 w-4 transition-transform ${colorInfoOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>
            )}
          </div>

          {/* Collapsible color coding information and distribution */}
          {devices.length > 0 && (
            <Collapsible open={colorInfoOpen} onOpenChange={setColorInfoOpen}>
              <CollapsibleContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                  <div className="lg:col-span-2">
                    <Suspense fallback={<div className="h-32 bg-muted rounded animate-pulse" />}>
                      <DeviceColorInfo 
                        devices={allFilteredDevices || devices} 
                        colorMode={colorMode} 
                      />
                    </Suspense>
                  </div>
                  <div>
                    <Suspense fallback={<div className="h-32 bg-muted rounded animate-pulse" />}>
                      <CategoryDistribution 
                        devices={allFilteredDevices || devices}
                        colorMode={colorMode}
                        totalDevices={totalDevices || (allFilteredDevices || devices).length}
                      />
                    </Suspense>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}

      {/* Device display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {devices.map((device, index) => (
          <DeviceCard
            key={`${device.device}-${index}`}
            device={device}
            onClick={() => onDeviceClick(device)}
            onShowJson={() => handleShowJson(device)}
            colorMode={colorMode}
          />
        ))}
      </div>
      
      {pagination && onPageChange && onItemsPerPageChange && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          scrollToTopOnPageChange={false}
        />
      )}

      {/* JSON Modal */}
      <Suspense fallback={null}>
        <DeviceJsonModal
          device={jsonModalDevice}
          open={jsonModalOpen}
          onOpenChange={setJsonModalOpen}
        />
      </Suspense>
    </div>
  );
});

DeviceGrid.displayName = 'DeviceGrid';