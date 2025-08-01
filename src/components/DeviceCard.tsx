import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { DeviceMobile, Monitor, Tablet, Plus, Minus } from "@phosphor-icons/react";
import { useComparison } from "@/contexts/ComparisonContext";

interface DeviceCardProps {
  device: AndroidDevice;
  onClick: () => void;
}

export const DeviceCard = ({ device, onClick }: DeviceCardProps) => {
  const { addToComparison, removeFromComparison, isInComparison, canAddToComparison } = useComparison();
  const deviceId = `${device.brand}-${device.device}`;
  const inComparison = isInComparison(deviceId);

  const getFormFactorIcon = (formFactor: string) => {
    switch (formFactor.toLowerCase()) {
      case 'phone':
        return <DeviceMobile className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'tv':
        return <Monitor className="h-4 w-4" />;
      case 'android automotive':
        return <Monitor className="h-4 w-4" />;
      case 'chromebook':
        return <Monitor className="h-4 w-4" />;
      case 'wearable':
        return <DeviceMobile className="h-4 w-4" />;
      case 'google play games on pc':
        return <Monitor className="h-4 w-4" />;
      default:
        return <DeviceMobile className="h-4 w-4" />;
    }
  };

  const handleComparisonToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inComparison) {
      removeFromComparison(deviceId);
    } else {
      addToComparison(device);
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:bg-accent/50 transition-colors duration-200 relative flex flex-col w-full ${
        inComparison ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      style={{ height: '200px', minHeight: '200px', maxHeight: '200px' }} // Fixed height for virtual scrolling consistency
      onClick={onClick}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
              {device.modelName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {device.manufacturer}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              variant={inComparison ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleComparisonToggle}
              disabled={!inComparison && !canAddToComparison}
              title={inComparison ? "Remove from comparison" : "Add to comparison"}
            >
              {inComparison ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-1 text-muted-foreground">
              {getFormFactorIcon(device.formFactor)}
              <span className="text-xs">{device.formFactor}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">RAM:</span>
            <div className="font-medium">{formatRam(device.ram)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">SDK:</span>
            <div className="font-medium">
              {device.sdkVersions.length === 1 
                ? `API ${device.sdkVersions[0]}` 
                : `API ${Math.min(...device.sdkVersions)}-${Math.max(...device.sdkVersions)}`
              }
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Processor:</span>
            <div className="text-xs font-medium line-clamp-1">
              {device.processorName}
            </div>
          </div>
          
          <div>
            <span className="text-xs text-muted-foreground">Screen:</span>
            <div className="text-xs font-medium">
              {device.screenSizes[0]}
              {device.screenSizes.length > 1 && ` +${device.screenSizes.length - 1}`}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {device.abis.slice(0, 2).map(abi => (
            <Badge key={abi} variant="outline" className="text-xs px-1 py-0">
              {abi}
            </Badge>
          ))}
          {device.abis.length > 2 && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              +{device.abis.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};