import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DeviceStats } from "@/types/device";

interface GpuManufacturerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

const GPU_COLORS = [
  { name: 'ARM Mali', colors: { primary: '#FF6B35', secondary: '#FFE5D9', text: '#8B2500' } },
  { name: 'Qualcomm Adreno', colors: { primary: '#0066CC', secondary: '#E5F0FF', text: '#003D7A' } },
  { name: 'PowerVR', colors: { primary: '#9333EA', secondary: '#F3E8FF', text: '#5B21B6' } },
  { name: 'Intel Graphics', colors: { primary: '#0071C5', secondary: '#E5F2FF', text: '#004380' } },
  { name: 'Samsung Xclipse', colors: { primary: '#1428A0', secondary: '#E8EAFF', text: '#0D1660' } },
  { name: 'AMD Radeon', colors: { primary: '#DC2626', secondary: '#FEE2E2', text: '#991B1B' } },
  { name: 'NVIDIA', colors: { primary: '#22C55E', secondary: '#DCFCE7', text: '#166534' } },
  { name: 'Other', colors: { primary: '#6B7280', secondary: '#F3F4F6', text: '#374151' } },
];

const getGpuDescription = (manufacturer: string): string => {
  switch (manufacturer) {
    case 'ARM Mali':
      return 'Most common mobile GPU, found in MediaTek, Samsung, and other SoCs';
    case 'Qualcomm Adreno':
      return 'High-performance GPUs in Snapdragon processors';
    case 'PowerVR':
      return 'Imagination Technologies GPU architecture';
    case 'Intel Graphics':
      return 'Integrated graphics in Intel processors';
    case 'Samsung Xclipse':
      return 'AMD RDNA-based GPUs in Samsung Exynos chips';
    case 'AMD Radeon':
      return 'AMD graphics solutions for mobile devices';
    case 'NVIDIA':
      return 'GeForce and Tegra GPU architectures';
    default:
      return 'Various other GPU manufacturers and architectures';
  }
};

export const GpuManufacturerDialog = ({ open, onOpenChange, stats }: GpuManufacturerDialogProps) => {
  const gpuEntries = Object.entries(stats.gpuManufacturerCounts)
    .sort(([,a], [,b]) => b - a);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            GPU Manufacturer Distribution
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gpuEntries.length}</div>
              <div className="text-sm text-muted-foreground">GPU Manufacturers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {gpuEntries.length > 0 ? ((gpuEntries[0][1] / stats.totalDevices) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Top Manufacturer</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">GPU Ecosystem Breakdown</h3>
            {gpuEntries.map(([manufacturer, count]) => {
              const gpuColors = GPU_COLORS.find(g => g.name === manufacturer)?.colors || GPU_COLORS[GPU_COLORS.length - 1].colors;
              const percentage = ((count / stats.totalDevices) * 100).toFixed(1);
              const description = getGpuDescription(manufacturer);
              
              return (
                <div key={manufacturer} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded border" 
                      style={{ backgroundColor: gpuColors.primary }}
                    />
                    <div>
                      <span className="font-medium">{manufacturer}</span>
                      <p className="text-sm text-muted-foreground">{description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{percentage}% of devices</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: gpuColors.secondary, 
                      color: gpuColors.text 
                    }}
                  >
                    {count} devices
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded">
            <strong>Graphics Development:</strong> Understanding GPU distribution helps optimize graphics performance. 
            ARM Mali and Qualcomm Adreno typically dominate the mobile market, while PowerVR and others serve specific niches. 
            Consider testing on devices with different GPU architectures for optimal graphics compatibility.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
