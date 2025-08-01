import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AndroidDevice } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { DevicePhone, Monitor, Tablet, Cpu, VideoCard, Display } from "@phosphor-icons/react";

interface DeviceDetailModalProps {
  device: AndroidDevice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeviceDetailModal = ({ device, open, onOpenChange }: DeviceDetailModalProps) => {
  if (!device) return null;

  const getFormFactorIcon = (formFactor: string) => {
    switch (formFactor.toLowerCase()) {
      case 'phone':
        return <DevicePhone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      case 'tv':
        return <Monitor className="h-5 w-5" />;
      default:
        return <DevicePhone className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {getFormFactorIcon(device.formFactor)}
            <div>
              <div>{device.modelName}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {device.manufacturer} • {device.brand}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4" />
                Hardware Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Device Code</label>
                  <div className="text-sm font-mono">{device.device}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Form Factor</label>
                  <div className="text-sm">{device.formFactor}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">RAM</label>
                  <div className="text-sm font-medium">{formatRam(device.ram)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Brand</label>
                  <div className="text-sm">{device.brand}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Processor</label>
                <div className="text-sm font-medium">{device.processorName}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">GPU</label>
                <div className="text-sm font-medium">{device.gpu}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Display className="h-4 w-4" />
                Display & Graphics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Screen Sizes</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {device.screenSizes.map((size, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Screen Densities (DPI)</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {device.screenDensities.map((density, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {density}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">OpenGL ES Versions</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {device.openGlEsVersions.map((version, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {version}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <VideoCard className="h-4 w-4" />
                Architecture & APIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supported ABIs</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {device.abis.map((abi, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {abi}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">SDK Versions (API Levels)</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {device.sdkVersions.map((version, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      API {version}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Technical Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Architecture:</span>
                  <span className="font-medium">
                    {device.abis.includes('arm64-v8a') ? '64-bit ARM' : '32-bit ARM'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latest Android:</span>
                  <span className="font-medium">
                    API {Math.max(...device.sdkVersions)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Screen Configs:</span>
                  <span className="font-medium">
                    {device.screenSizes.length} size{device.screenSizes.length !== 1 ? 's' : ''}, {device.screenDensities.length} densit{device.screenDensities.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};