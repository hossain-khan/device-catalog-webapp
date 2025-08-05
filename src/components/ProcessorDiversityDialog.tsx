import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DeviceStats } from "@/types/device";

interface ProcessorDiversityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DeviceStats;
}

const PROCESSOR_COLORS = [
  { name: 'MediaTek', colors: { primary: '#FF6B35', secondary: '#FFE5D9', text: '#8B2500' } },
  { name: 'Qualcomm', colors: { primary: '#0066CC', secondary: '#E5F0FF', text: '#003D7A' } },
  { name: 'Samsung', colors: { primary: '#1428A0', secondary: '#E8EAFF', text: '#0D1660' } },
  { name: 'HiSilicon', colors: { primary: '#FF0000', secondary: '#FFE5E5', text: '#990000' } },
  { name: 'Intel', colors: { primary: '#0071C5', secondary: '#E5F2FF', text: '#004380' } },
  { name: 'Other', colors: { primary: '#6B7280', secondary: '#F3F4F6', text: '#374151' } },
];

export const ProcessorDiversityDialog = ({ open, onOpenChange, stats }: ProcessorDiversityDialogProps) => {
  const processorEntries = Object.entries(stats.processorManufacturerCounts)
    .sort(([,a], [,b]) => b - a);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Processor Diversity Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.processorDiversityCount}</div>
              <div className="text-sm text-muted-foreground">Unique Processors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{processorEntries.length}</div>
              <div className="text-sm text-muted-foreground">Manufacturers</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Manufacturer Distribution</h3>
            {processorEntries.map(([manufacturer, count]) => {
              const manufacturerColors = PROCESSOR_COLORS.find(p => p.name === manufacturer)?.colors || PROCESSOR_COLORS[PROCESSOR_COLORS.length - 1].colors;
              const percentage = ((count / stats.totalDevices) * 100).toFixed(1);
              return (
                <div key={manufacturer} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded border" 
                      style={{ backgroundColor: manufacturerColors.primary }}
                    />
                    <div>
                      <span className="font-medium">{manufacturer}</span>
                      <p className="text-xs text-muted-foreground mt-1">{percentage}% of devices</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: manufacturerColors.secondary, 
                      color: manufacturerColors.text 
                    }}
                  >
                    {count} devices
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded">
            <strong>Note:</strong> This analysis shows the diversity of processors across {stats.totalDevices} devices, 
            helping developers understand the CPU landscape for Android app optimization and compatibility testing.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
