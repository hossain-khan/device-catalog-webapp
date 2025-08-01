import { memo, useCallback, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { DeviceCard } from "./DeviceCard";
import { DeviceCardSkeleton } from "./DeviceCardSkeleton";
import { PaginationControls } from "./PaginationControls";
import { AndroidDevice } from "@/types/device";
import { PaginationInfo } from "@/lib/paginationUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, List as ListIcon } from '@phosphor-icons/react';

interface DeviceGridProps {
  devices: AndroidDevice[];
  onDeviceClick: (device: AndroidDevice) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
  totalDevices?: number;
  allFilteredDevices?: AndroidDevice[]; // For virtual scrolling mode
}

// Constants for virtual scrolling
const CARD_HEIGHT = 180; // Height of each device card
const CARDS_PER_ROW = {
  default: 1,
  md: 2,
  lg: 3,
  xl: 4
};
const ROW_GAP = 16; // Gap between rows
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
  data: { devices: AndroidDevice[]; onDeviceClick: (device: AndroidDevice) => void; cardsPerRow: number } 
}) => {
  const { devices, onDeviceClick, cardsPerRow } = data;
  const startIndex = index * cardsPerRow;
  const rowDevices = devices.slice(startIndex, startIndex + cardsPerRow);

  return (
    <div style={style} className="px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
        {rowDevices.map((device, cardIndex) => (
          <DeviceCard
            key={`${device.device}-${device.modelName}-${startIndex + cardIndex}`}
            device={device}
            onClick={() => onDeviceClick(device)}
          />
        ))}
        {/* Fill empty slots to maintain grid alignment */}
        {Array.from({ length: cardsPerRow - rowDevices.length }, (_, i) => (
          <div key={`empty-${i}`} className="invisible">
            <div style={{ height: CARD_HEIGHT }} />
          </div>
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
  allFilteredDevices
}: DeviceGridProps) => {
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false);
  
  // Determine the actual device list to use
  const virtualDevices = allFilteredDevices || devices;
  const shouldShowVirtualToggle = virtualDevices.length > VIRTUAL_THRESHOLD;
  
  // Calculate virtual scrolling parameters
  const cardsPerRow = CARDS_PER_ROW.xl; // Use XL breakpoint for calculations
  const totalRows = Math.ceil(virtualDevices.length / cardsPerRow);
  
  // Virtual list data
  const virtualListData = useMemo(() => ({
    devices: virtualDevices,
    onDeviceClick,
    cardsPerRow
  }), [virtualDevices, onDeviceClick, cardsPerRow]);

  const handleToggleVirtualScrolling = useCallback(() => {
    setUseVirtualScrolling(prev => !prev);
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
      {/* Performance mode toggle */}
      {shouldShowVirtualToggle && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-primary" />
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
              className="gap-2"
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
          
          <div className="border rounded-lg overflow-hidden bg-card">
            <List
              height={VIRTUAL_LIST_HEIGHT}
              itemCount={totalRows}
              itemSize={ROW_HEIGHT}
              itemData={virtualListData}
              overscanCount={3}
              className="scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-transparent"
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
              />
            ))}
          </div>
          
          {pagination && onPageChange && onItemsPerPageChange && (
            <PaginationControls
              pagination={pagination}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          )}
        </>
      )}
    </div>
  );
});

DeviceGrid.displayName = 'DeviceGrid';