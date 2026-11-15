import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ui/modal-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AndroidDevice } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { DeviceMobile, Monitor, DeviceTablet, Television, Car, Laptop, Watch, GameController, Cpu, Desktop, Code, Question } from "@phosphor-icons/react";
import { DeviceJsonModal } from "./DeviceJsonModal";
import { useState } from "react";
import GoogleLogoSVG from "@/assets/images/google_G_logo.svg";
import { DeviceImage } from "./DeviceImage";

interface DeviceDetailModalProps {
  device: AndroidDevice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeviceDetailModal = ({ device, open, onOpenChange }: DeviceDetailModalProps) => {
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  
  if (!device) return null;

  const handleGoogleSearch = () => {
    // Format the search query as "Manufacturer Model Form Factor"
    const searchQuery = `${device.manufacturer} ${device.modelName} ${device.formFactor}`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleSearchUrl, '_blank');
  };

  const getFormFactorIcon = (formFactor: string) => {
    switch (formFactor.toLowerCase()) {
      case 'phone':
        return <DeviceMobile className="h-5 w-5" />;
      case 'tablet':
        return <DeviceTablet className="h-5 w-5" />;
      case 'tv':
        return <Television className="h-5 w-5" />;
      case 'android automotive':
        return <Car className="h-5 w-5" />;
      case 'chromebook':
      case 'desktop':
        return <Laptop className="h-5 w-5" />;
      case 'wearable':
        return <Watch className="h-5 w-5" />;
      case 'google play games on pc':
        return <GameController className="h-5 w-5" />;
      case 'unknown':
        return <Question className="h-5 w-5" />;
      default:
        return <DeviceMobile className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" hideCloseButton={true}>
        <ModalHeader
          title={device.modelName}
          subtitle={`${device.manufacturer} • ${device.brand}`}
          icon={getFormFactorIcon(device.formFactor)}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoogleSearch}
                className="hover:bg-muted hover:text-foreground"
              >
                <img src={GoogleLogoSVG} alt="Google" className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setJsonModalOpen(true)}
                className="hover:bg-muted hover:text-foreground"
              >
                <Code className="h-4 w-4 mr-2" />
                View JSON
              </Button>
            </div>
          }
          onClose={() => onOpenChange(false)}
        />
        
        <DialogDescription className="sr-only">
          Detailed information about {device.modelName} including hardware specifications, display details, and technical specifications.
        </DialogDescription>

        {/* Device Image Preview Banner */}
        <div className="mb-6 rounded-xl border border-border/70 bg-muted/30 overflow-hidden">
          <div className="flex justify-center items-center py-6 px-6">
            <DeviceImage
              device={device}
              className="w-40 h-40 max-h-48"
              imgClassName="max-h-48 w-auto object-contain filter drop-shadow-md"
              fallbackIconClassName="h-16 w-16 text-muted-foreground/60"
              fallbackIconContainerClassName="w-40 h-40 rounded-xl bg-muted/60 flex items-center justify-center border border-border/40"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60 border-t border-border/60 bg-card/60">
            <div className="px-4 py-2.5 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Memory</div>
              <div className="text-xs font-mono font-semibold text-foreground mt-0.5">{formatRam(device.ram)}</div>
            </div>
            <div className="px-4 py-2.5 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Latest SDK</div>
              <div className="text-xs font-mono font-semibold text-primary mt-0.5">API {Math.max(...device.sdkVersions)}</div>
            </div>
            <div className="px-4 py-2.5 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Architecture</div>
              <div className="text-xs font-mono font-semibold text-foreground mt-0.5">
                {device.abis.includes('arm64-v8a') ? '64-bit ARM' : '32-bit ARM'}
              </div>
            </div>
            <div className="px-4 py-2.5 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Codename</div>
              <div className="text-xs font-mono font-semibold text-foreground mt-0.5 truncate" title={device.device}>
                {device.device}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="shadow-sm hover:shadow-sm border-border/80 py-5 gap-4">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Cpu className="h-4 w-4 text-primary" />
                Hardware Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Device Code</label>
                  <div className="text-sm font-mono font-medium mt-0.5">{device.device}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Form Factor</label>
                  <div className="text-sm font-medium mt-0.5">{device.formFactor}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">RAM</label>
                  <div className="text-sm font-mono font-medium mt-0.5">{formatRam(device.ram)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Brand</label>
                  <div className="text-sm font-medium mt-0.5">{device.brand}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <label className="text-xs font-medium text-muted-foreground">Processor (SoC)</label>
                <div className="text-sm font-mono font-medium mt-0.5">{device.processorName}</div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">GPU</label>
                <div className="text-sm font-mono font-medium mt-0.5">{device.gpu}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-sm border-border/80 py-5 gap-4">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Monitor className="h-4 w-4 text-primary" />
                Display & Graphics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Screen Sizes</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {device.screenSizes.map((size, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Screen Densities (DPI)</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {device.screenDensities.map((density, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {density} dpi
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">OpenGL ES Versions</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {device.openGlEsVersions.map((version, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {version}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-sm border-border/80 py-5 gap-4">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Desktop className="h-4 w-4 text-primary" />
                Architecture & APIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Supported ABIs</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {device.abis.map((abi, index) => (
                    <Badge key={index} variant="secondary" className="text-xs font-mono">
                      {abi}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">SDK Versions (API Levels)</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {device.sdkVersions.map((version, index) => (
                    <Badge key={index} variant="secondary" className="text-xs font-mono">
                      API {version}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-sm border-border/80 py-5 gap-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Technical Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">Architecture</span>
                  <span className="text-xs font-mono font-medium">
                    {device.abis.includes('arm64-v8a') ? '64-bit ARM' : '32-bit ARM'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">Latest Android</span>
                  <span className="text-xs font-mono font-medium text-primary">
                    API {Math.max(...device.sdkVersions)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-muted-foreground">Screen Configs</span>
                  <span className="text-xs font-mono font-medium">
                    {device.screenSizes.length} size{device.screenSizes.length !== 1 ? 's' : ''}, {device.screenDensities.length} densit{device.screenDensities.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* JSON Modal */}
        <DeviceJsonModal
          device={device}
          open={jsonModalOpen}
          onOpenChange={setJsonModalOpen}
        />
      </DialogContent>
    </Dialog>
  );
};