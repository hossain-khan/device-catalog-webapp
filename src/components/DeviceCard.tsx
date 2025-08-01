import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AndroidDevice } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { DevicePhone, Monitor, Tablet } from "@phosphor-icons/react";

interface DeviceCardProps {
  device: AndroidDevice;
  onClick: () => void;
}

export const DeviceCard = ({ device, onClick }: DeviceCardProps) => {
  const getFormFactorIcon = (formFactor: string) => {
    switch (formFactor.toLowerCase()) {
      case 'phone':
        return <DevicePhone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'tv':
        return <Monitor className="h-4 w-4" />;
      default:
        return <DevicePhone className="h-4 w-4" />;
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors duration-200 h-full"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
              {device.modelName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {device.manufacturer}
            </p>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            {getFormFactorIcon(device.formFactor)}
            <span className="text-xs">{device.formFactor}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
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