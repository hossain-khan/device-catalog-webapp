import { DeviceCard } from "./DeviceCard";
import { AndroidDevice } from "@/types/device";

interface DeviceGridProps {
  devices: AndroidDevice[];
  onDeviceClick: (device: AndroidDevice) => void;
}

export const DeviceGrid = ({ devices, onDeviceClick }: DeviceGridProps) => {
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
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {devices.map((device, index) => (
        <DeviceCard
          key={`${device.device}-${index}`}
          device={device}
          onClick={() => onDeviceClick(device)}
        />
      ))}
    </div>
  );
};