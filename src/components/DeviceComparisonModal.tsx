import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ui/modal-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AndroidDevice } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { DeviceMobile, DeviceTablet, Television, Car, Laptop, Watch, GameController, X } from "@phosphor-icons/react";
import { useComparison } from "@/contexts/ComparisonContext";

interface DeviceComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeviceComparisonModal = ({ open, onOpenChange }: DeviceComparisonModalProps) => {
  const { comparedDevices, removeFromComparison } = useComparison();

  const getFormFactorIcon = (formFactor: string) => {
    switch (formFactor.toLowerCase()) {
      case 'phone':
        return <DeviceMobile className="h-4 w-4" />;
      case 'tablet':
        return <DeviceTablet className="h-4 w-4" />;
      case 'tv':
        return <Television className="h-4 w-4" />;
      case 'android automotive':
        return <Car className="h-4 w-4" />;
      case 'chromebook':
        return <Laptop className="h-4 w-4" />;
      case 'wearable':
        return <Watch className="h-4 w-4" />;
      case 'google play games on pc':
        return <GameController className="h-4 w-4" />;
      default:
        return <DeviceMobile className="h-4 w-4" />;
    }
  };

  const getComparisonValue = (device: AndroidDevice, field: string) => {
    switch (field) {
      case 'ram':
        return formatRam(device.ram);
      case 'sdkVersions':
        return device.sdkVersions.length === 1 
          ? `API ${device.sdkVersions[0]}` 
          : `API ${Math.min(...device.sdkVersions)}-${Math.max(...device.sdkVersions)}`;
      case 'screenSizes':
        return device.screenSizes.join(', ');
      case 'screenDensities':
        return device.screenDensities.join(', ') + ' dpi';
      case 'abis':
        return device.abis.join(', ');
      case 'openGlEsVersions':
        return device.openGlEsVersions.join(', ');
      default:
        return device[field as keyof AndroidDevice] as string;
    }
  };

  const comparisonFields = [
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'modelName', label: 'Model Name' },
    { key: 'formFactor', label: 'Form Factor' },
    { key: 'ram', label: 'RAM' },
    { key: 'processorName', label: 'Processor' },
    { key: 'gpu', label: 'GPU' },
    { key: 'screenSizes', label: 'Screen Sizes' },
    { key: 'screenDensities', label: 'Screen Densities' },
    { key: 'sdkVersions', label: 'SDK Versions' },
    { key: 'abis', label: 'ABIs' },
    { key: 'openGlEsVersions', label: 'OpenGL ES' }
  ];

  if (comparedDevices.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col" hideCloseButton={true}>
        <ModalHeader
          title="Device Comparison"
          subtitle={`Compare specifications across ${comparedDevices.length} devices`}
          actions={
            <Badge variant="secondary">
              {comparedDevices.length} devices
            </Badge>
          }
          onClose={() => onOpenChange(false)}
        />

        <ScrollArea className="flex-1">
          <div className="min-w-max overflow-x-auto">
            {/* Device Headers */}
            <div className="flex gap-3 mb-6">
              <div className="w-48 flex-shrink-0"></div>
              {comparedDevices.map(device => {
                const deviceId = `${device.brand}-${device.device}`;
                return (
                  <Card key={deviceId} className="w-64 flex-shrink-0">
                    <CardHeader className="pb-3 px-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base leading-tight line-clamp-2 break-words">
                            {device.modelName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {device.manufacturer}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromComparison(deviceId)}
                            className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getFormFactorIcon(device.formFactor)}
                            <span className="text-xs truncate max-w-[60px]" title={device.formFactor}>
                              {device.formFactor}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* Comparison Table */}
            <div className="space-y-2">
              {comparisonFields.map(field => (
                <div 
                  key={field.key}
                  className="flex gap-3 items-center py-3 border-b border-border last:border-b-0"
                >
                  <div className="w-48 flex-shrink-0 font-medium text-sm text-muted-foreground pr-3">
                    {field.label}
                  </div>
                  {comparedDevices.map(device => {
                    const deviceId = `${device.brand}-${device.device}`;
                    const value = getComparisonValue(device, field.key);
                    
                    return (
                      <div key={deviceId} className="w-64 flex-shrink-0 text-sm">
                        {field.key === 'abis' || field.key === 'openGlEsVersions' ? (
                          <div className="flex flex-wrap gap-1">
                            {(device[field.key as keyof AndroidDevice] as string[]).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        ) : field.key === 'formFactor' ? (
                          <div className="flex items-center gap-2 min-w-0">
                            {getFormFactorIcon(device.formFactor)}
                            <span className="truncate">{device.formFactor}</span>
                          </div>
                        ) : (
                          <span className="break-words">{value}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};