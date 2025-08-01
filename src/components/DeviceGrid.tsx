import { DeviceCard } from "./DeviceCard";
import { DeviceCardSkeleton } from "./DeviceCardSkeleton";
import { PaginationControls } from "./PaginationControls";
import { AndroidDevice } from "@/types/device";
import { PaginationInfo } from "@/lib/paginationUtils";

interface DeviceGridProps {
  devices: AndroidDevice[];
  onDeviceClick: (device: AndroidDevice) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
  totalDevices?: number;
}

export const DeviceGrid = ({ 
  devices, 
  onDeviceClick, 
  pagination,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  totalDevices
}: DeviceGridProps) => {
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
    </div>
  );
};