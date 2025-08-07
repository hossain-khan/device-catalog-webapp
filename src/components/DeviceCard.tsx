import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { getDeviceColors, getDeviceCategoryLabel, parseRamMB, ColorMode } from "@/lib/deviceColors";
import { DeviceMobile, DeviceTablet, Television, Car, Laptop, Watch, GameController, Plus, Minus, Code, Question } from "@phosphor-icons/react";
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

  const getFormFactorIcon = (formFactor: string, size: 'sm' | 'lg' = 'sm') => {
    const iconClass = size === 'lg' ? "h-8 w-8" : "h-4 w-4";
    // Use high contrast white color for large icons, normal color for small icons
    const iconStyle = size === 'lg' ? { color: '#ffffff' } : { color: colors.icon };
    
    switch (formFactor.toLowerCase()) {
      case 'phone':
        return <DeviceMobile className={iconClass} style={iconStyle} />;
      case 'tablet':
        return <DeviceTablet className={iconClass} style={iconStyle} />;
      case 'tv':
        return <Television className={iconClass} style={iconStyle} />;
      case 'android automotive':
        return <Car className={iconClass} style={iconStyle} />;
      case 'chromebook':
        return <Laptop className={iconClass} style={iconStyle} />;
      case 'wearable':
        return <Watch className={iconClass} style={iconStyle} />;
      case 'google play games on pc':
        return <GameController className={iconClass} style={iconStyle} />;
      case 'unknown':
        return <Question className={iconClass} style={iconStyle} />;
      default:
        return <DeviceMobile className={iconClass} style={iconStyle} />;
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
      className={`cursor-pointer transition-all duration-200 relative flex flex-col w-full border-2 overflow-hidden p-0 ${
        inComparison ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md'
      }`}
      style={{ 
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.text
      }}
      onClick={onClick}
    >
      {/* Form Factor Hero Section */}
      <div 
        className="relative px-4 pt-4 pb-4 text-center border-b"
        style={{ 
          backgroundColor: colors.secondary,
          borderBottomColor: colors.border
        }}
      >
        {/* Form Factor Icon - Large and Prominent */}
        <div className="mb-3 flex justify-center">
          <div 
            className="p-3 rounded-full shadow-sm"
            style={{ 
              backgroundColor: colors.primary,
            }}
          >
            {getFormFactorIcon(device.formFactor, 'lg')}
          </div>
        </div>
        
        {/* Form Factor Label */}
        <div className="font-semibold text-sm" style={{ color: colors.text }}>
          {device.formFactor}
        </div>
        
        {/* Category Badge */}
        <Badge 
          variant="secondary" 
          className="text-xs mt-2 px-2 py-0"
          style={{ 
            backgroundColor: colors.background, 
            color: colors.text,
            border: `1px solid ${colors.border}`
          }}
        >
          {categoryLabel}
        </Badge>
        
        {/* Action Buttons - Positioned in top right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button
            variant={inComparison ? "default" : "outline"}
            size="sm"
            className="h-7 w-7 p-0 shadow-sm"
            onClick={handleComparisonToggle}
            disabled={!inComparison && !canAddToComparison}
            title={inComparison ? "Remove from comparison" : "Add to comparison"}
          >
            {inComparison ? (
              <Minus className="h-3 w-3" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shadow-sm"
            onClick={handleShowJson}
            title="View source JSON"
          >
            <Code className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="text-center">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-1 tracking-tight">
            {device.modelName}
          </h3>
          <p className="font-semibold text-xs opacity-75 tracking-wide">
            {device.manufacturer}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 overflow-hidden p-4 pb-4">
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