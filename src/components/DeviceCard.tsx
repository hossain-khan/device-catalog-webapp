import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { getDeviceColors, getDeviceCategoryLabel, parseRamMB, ColorMode } from "@/lib/deviceColors";
import { DeviceMobile, Monitor, DeviceTablet, Television, Car, Laptop, Watch, GameController, Plus, Minus, Code } from "@phosphor-icons/react";
import { useComparison } from "@/contexts/ComparisonContext";

interface DeviceCardProps {
  device: AndroidDevice;
  onClick: () => void;
  onShowJson: () => void;
  colorMode?: ColorMode;
}

export const DeviceCard = ({ device, onClick, onShowJson, colorMode = 'formFactor' }: DeviceCardProps) => {
  const { addToComparison, removeFromComparison, isInComparison, canAddToComparison } = useComparison();
  const deviceId = `${device.brand}-${device.device}`;
  const inComparison = isInComparison(deviceId);
  
  // Get color scheme for the device
  const colors = getDeviceColors(device, colorMode);
  const categoryLabel = getDeviceCategoryLabel(device.formFactor, parseRamMB(device.ram));

  const getFormFactorIcon = (formFactor: string) => {
    const iconStyle = { color: colors.icon };
    
    switch (formFactor.toLowerCase()) {
      case 'phone':
        return <DeviceMobile className="h-4 w-4" style={iconStyle} />;
      case 'tablet':
        return <DeviceTablet className="h-4 w-4" style={iconStyle} />;
      case 'tv':
        return <Television className="h-4 w-4" style={iconStyle} />;
      case 'android automotive':
        return <Car className="h-4 w-4" style={iconStyle} />;
      case 'chromebook':
        return <Laptop className="h-4 w-4" style={iconStyle} />;
      case 'wearable':
        return <Watch className="h-4 w-4" style={iconStyle} />;
      case 'google play games on pc':
        return <GameController className="h-4 w-4" style={iconStyle} />;
      default:
        return <DeviceMobile className="h-4 w-4" style={iconStyle} />;
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

  const handleShowJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowJson();
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 relative flex flex-col w-full border-2 ${
        inComparison ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md'
      }`}
      style={{ 
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.text
      }}
      onClick={onClick}
    >
      {/* Color indicator bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: colors.primary }}
      />
      
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
              {device.modelName}
            </h3>
            <p className="text-xs opacity-75">
              {device.manufacturer}
            </p>
            {/* Category label */}
            <Badge 
              variant="secondary" 
              className="text-xs mt-1 px-2 py-0"
              style={{ 
                backgroundColor: colors.secondary, 
                color: colors.text,
                border: `1px solid ${colors.border}`
              }}
            >
              {categoryLabel}
            </Badge>
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
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleShowJson}
              title="View source JSON"
            >
              <Code className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {getFormFactorIcon(device.formFactor)}
              <span className="text-xs">{device.formFactor}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="opacity-75">RAM:</span>
            <div className="font-medium">{formatRam(device.ram)}</div>
          </div>
          <div>
            <span className="opacity-75">SDK:</span>
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
            <span className="text-xs opacity-75">Processor:</span>
            <div className="text-xs font-medium line-clamp-1">
              {device.processorName}
            </div>
          </div>
          
          <div>
            <span className="text-xs opacity-75">Screen:</span>
            <div className="text-xs font-medium">
              {device.screenSizes[0]}
              {device.screenSizes.length > 1 && ` +${device.screenSizes.length - 1}`}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {device.abis.slice(0, 2).map(abi => (
            <Badge 
              key={abi} 
              variant="outline" 
              className="text-xs px-1 py-0"
              style={{ 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: 'transparent'
              }}
            >
              {abi}
            </Badge>
          ))}
          {device.abis.length > 2 && (
            <Badge 
              variant="outline" 
              className="text-xs px-1 py-0"
              style={{ 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: 'transparent'
              }}
            >
              +{device.abis.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};