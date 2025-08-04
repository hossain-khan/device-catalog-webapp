import { memo, useCallback, useMemo, useState, lazy, Suspense } from 'react';
import { FixedSizeList as List } from 'react-window';
import { DeviceCard } from "./DeviceCard";
import { DeviceCardSkeleton } from "./DeviceCardSkeleton";
import { PaginationControls } from "./PaginationControls";
import { ColorModeControls } from "./ColorModeControls";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { ColorMode } from "@/lib/deviceColors";
import { PaginationInfo } from "@/lib/paginationUtils";
import { Badge } from "@/components/ui/badge";
import { Lightning, List as ListIcon, CaretDown } from '@phosphor-icons/react';

// Lazy load heavy components
const DeviceJsonModal = lazy(() => import("./DeviceJsonModal").then(module => ({ default: module.DeviceJsonModal })));
const DeviceColorInfo = lazy(() => import("./DeviceColorInfo").then(module => ({ default: module.DeviceColorInfo })));
const CategoryDistribution = lazy(() => import("./CategoryDistribution").then(module => ({ default: module.CategoryDistribution })));

interface DeviceGridProps {
  devices: AndroidDevice[];
  onDeviceClick: (device: AndroidDevice) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
  totalDevices?: number;
  allFilteredDevices?: AndroidDevice[]; // For virtual scrolling mode
  colorMode?: ColorMode;
  onColorModeChange?: (mode: ColorMode) => void;
}

// Constants for virtual scrolling
const CARD_HEIGHT = 320; // Height of each device card (reduced after removing JSON section)
const ROW_GAP = 16; // Gap between rows (reduced to prevent overlap)
const ROW_HEIGHT = CARD_HEIGHT + ROW_GAP;
const VIRTUAL_LIST_HEIGHT = 600;
const VIRTUAL_THRESHOLD = 200; // Switch to virtual scrolling when more than this many devices

// Virtual row component
const VirtualRow = memo(({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: { 
    devices: AndroidDevice[]; 
    onDeviceClick: (device: AndroidDevice) => void; 
    onShowJson: (device: AndroidDevice) => void;
    cardsPerRow: number; 
    colorMode: ColorMode 
  } 
}) => {
  const { devices, onDeviceClick, onShowJson, cardsPerRow, colorMode } = data;
  const startIndex = index * cardsPerRow;
  const rowDevices = devices.slice(startIndex, startIndex + cardsPerRow);

  // Apply the react-window style directly and ensure proper positioning
  const rowStyle: React.CSSProperties = {
    ...style,
    padding: '16px', // Add padding all around
    boxSizing: 'border-box',
    display: 'block',
    overflow: 'visible'
  };

  return (
    <div style={rowStyle}>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style={{ height: `${CARD_HEIGHT}px` }}>
        {rowDevices.map((device, cardIndex) => (
          <div 
            key={`${device.device}-${device.modelName}-${startIndex + cardIndex}`}
            className="w-full h-full"
          >
            <DeviceCard
              device={device}
              onClick={() => onDeviceClick(device)}
              onShowJson={() => onShowJson(device)}
              colorMode={colorMode}
            />
          </div>
        ))}
        {/* Fill empty slots to maintain grid alignment */}
        {Array.from({ length: cardsPerRow - rowDevices.length }, (_, i) => (
          <div 
            key={`empty-${i}`} 
            className="w-full h-full invisible"
          />
        ))}
      </div>
    </div>
  );
});

VirtualRow.displayName = 'VirtualRow';

export const DeviceGrid = memo(({ 
  devices, 
  onDeviceClick, 
  pagination,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  totalDevices,
  allFilteredDevices,
  colorMode = 'formFactor',
  onColorModeChange
}: DeviceGridProps) => {
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false);
  const [jsonModalDevice, setJsonModalDevice] = useState<AndroidDevice | null>(null);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [colorInfoOpen, setColorInfoOpen] = useState(false);
  
  // Determine the actual device list to use
  const virtualDevices = allFilteredDevices || devices;
  const shouldShowVirtualToggle = virtualDevices.length > VIRTUAL_THRESHOLD;
  
  // Calculate virtual scrolling parameters with responsive design
  const getCardsPerRow = useCallback(() => {
    // Use a more conservative estimate for virtual scrolling to ensure consistency
    return 4; // Assume xl breakpoint for virtual scrolling calculations
  }, []);
  
  const cardsPerRow = getCardsPerRow();
  const totalRows = Math.ceil(virtualDevices.length / cardsPerRow);
  
  // Virtual list data
  const virtualListData = useMemo(() => ({
    devices: virtualDevices,
    onDeviceClick,
    onShowJson: (device: AndroidDevice) => {
      setJsonModalDevice(device);
      setJsonModalOpen(true);
    },
    cardsPerRow,
    colorMode
  }), [virtualDevices, onDeviceClick, cardsPerRow, colorMode]);

  const handleToggleVirtualScrolling = useCallback(() => {
    setUseVirtualScrolling(prev => !prev);
  }, []);

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
          <div className="flex items-center justify-between">
            <ColorModeControls 
              colorMode={colorMode} 
              onColorModeChange={onColorModeChange} 
            />
            
            {devices.length > 0 && (
              <Collapsible open={colorInfoOpen} onOpenChange={setColorInfoOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-muted hover:text-foreground">
                    Color Coding Information
                    <CaretDown className={`h-4 w-4 transition-transform ${colorInfoOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
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

      {/* Performance mode toggle */}
      {shouldShowVirtualToggle && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Lightning size={18} className="text-primary" />
              <span className="font-medium">Performance Mode</span>
            </div>
            <Badge variant={useVirtualScrolling ? "default" : "secondary"}>
              {useVirtualScrolling ? "Virtual Scrolling" : "Pagination"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {virtualDevices.length.toLocaleString()} devices total
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVirtualScrolling}
              className="gap-2 hover:bg-muted hover:text-foreground"
            >
              <ListIcon size={16} />
              {useVirtualScrolling ? "Use Pagination" : "Use Virtual Scrolling"}
            </Button>
          </div>
        </div>
      )}

      {/* Device display - either virtual or paginated */}
      {useVirtualScrolling && shouldShowVirtualToggle ? (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Showing all {virtualDevices.length.toLocaleString()} devices with virtual scrolling
          </div>
          
          <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
            <List
              height={VIRTUAL_LIST_HEIGHT}
              width="100%"
              itemCount={totalRows}
              itemSize={ROW_HEIGHT}
              itemData={virtualListData}
              overscanCount={2}
              className="scrollbar-thin"
              style={{ outline: 'none' }}
            >
              {VirtualRow}
            </List>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Virtual scrolling active - all devices loaded for optimal performance
          </div>
        </div>
      ) : (
        <>
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
        </>
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