import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { getDeviceColors, getDeviceCategoryLabel, parseRamMB, ColorMode } from "@/lib/deviceColors";
import {
  DeviceMobile,
  DeviceTablet,
  Television,
  Car,
  Laptop,
  Watch,
  GameController,
  Plus,
  Check,
  Code,
  Question,
  Cpu,
  Monitor,
  Memory,
  AndroidLogo,
} from "@phosphor-icons/react";
import { useComparison } from "@/contexts/ComparisonContext";
import { DeviceImage } from "./DeviceImage";

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

  const colors = getDeviceColors(device, colorMode);
  const categoryLabel = getDeviceCategoryLabel(device.formFactor, parseRamMB(device.ram));

  const getFormFactorIcon = (formFactor: string) => {
    const iconClass = "h-3.5 w-3.5 shrink-0";
    switch (formFactor.toLowerCase()) {
      case 'phone':
        return <DeviceMobile className={iconClass} />;
      case 'tablet':
        return <DeviceTablet className={iconClass} />;
      case 'tv':
        return <Television className={iconClass} />;
      case 'android automotive':
        return <Car className={iconClass} />;
      case 'chromebook':
      case 'desktop':
        return <Laptop className={iconClass} />;
      case 'wearable':
        return <Watch className={iconClass} />;
      case 'google play games on pc':
        return <GameController className={iconClass} />;
      case 'unknown':
        return <Question className={iconClass} />;
      default:
        return <DeviceMobile className={iconClass} />;
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

  const sdkDisplay =
    device.sdkVersions.length === 1
      ? `API ${device.sdkVersions[0]}`
      : `API ${Math.min(...device.sdkVersions)}-${Math.max(...device.sdkVersions)}`;

  return (
    <Card
      onClick={onClick}
      className={`group cursor-pointer relative flex flex-col gap-0 text-left h-full bg-card text-card-foreground border border-border/80 hover:border-primary/50 rounded-xl p-0 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
        inComparison ? 'ring-2 ring-primary border-primary shadow-md' : ''
      }`}
    >
      {/* Semantic Top Accent Stripe */}
      <div
        className="h-1 w-full shrink-0 transition-opacity duration-200 group-hover:opacity-100 opacity-85"
        style={{ backgroundColor: colors.primary }}
      />

      {/* Card Header: Thumbnail + Identity + Actions */}
      <div className="p-4 pb-3 flex items-start gap-3.5">
        <div
          className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center p-1.5 border transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <DeviceImage
            device={device}
            className="w-full h-full"
            imgClassName="w-full h-full object-contain drop-shadow-xs"
            fallbackIconClassName="h-6 w-6 text-foreground/80"
          />
        </div>

        <div className="flex-1 min-w-0 pr-14">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {device.manufacturer}
          </div>
          <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-1 tracking-tight mt-0.5 group-hover:text-primary transition-colors">
            {device.modelName}
          </h3>
          {device.device && device.device !== device.modelName && (
            <div className="text-[11px] font-mono text-muted-foreground/80 truncate mt-0.5">
              {device.device}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
          <Button
            variant={inComparison ? "default" : "outline"}
            size="sm"
            className={`h-7 w-7 p-0 rounded-lg transition-all ${
              inComparison
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-background/80 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            onClick={handleComparisonToggle}
            disabled={!inComparison && !canAddToComparison}
            title={inComparison ? "Remove from comparison" : "Add to comparison"}
          >
            {inComparison ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg bg-background/80 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            onClick={handleShowJson}
            title="View source JSON"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Category & Form Factor Badges */}
      <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md border"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: colors.primary }}
          />
          {getFormFactorIcon(device.formFactor)}
          <span>{device.formFactor}</span>
        </span>

        <Badge
          variant="secondary"
          className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-muted/70 text-muted-foreground border-transparent"
        >
          {categoryLabel}
        </Badge>
      </div>

      {/* High-Density 2x2 Spec Grid */}
      <div className="px-4 pb-3 flex-1">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 border border-border/50 p-2.5 text-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <Memory className="h-3 w-3 shrink-0 opacity-70" />
              <span>RAM</span>
            </div>
            <div className="font-semibold text-foreground truncate mt-0.5 tabular-nums">
              {formatRam(device.ram)}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <AndroidLogo className="h-3 w-3 shrink-0 opacity-70" />
              <span>SDK</span>
            </div>
            <div className="font-semibold text-foreground truncate mt-0.5 tabular-nums">
              {sdkDisplay}
            </div>
          </div>

          <div className="min-w-0 col-span-2 pt-1.5 border-t border-border/40">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Cpu className="h-3 w-3 shrink-0 opacity-70" />
                  <span>Processor</span>
                </div>
                <div className="font-medium text-foreground truncate mt-0.5" title={device.processorName}>
                  {device.processorName || 'Not specified'}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Monitor className="h-3 w-3 shrink-0 opacity-70" />
                  <span>Screen</span>
                </div>
                <div className="font-mono text-[11px] font-medium text-foreground mt-0.5 tabular-nums">
                  {device.screenSizes[0] || 'N/A'}
                  {device.screenSizes.length > 1 && (
                    <span className="text-muted-foreground ml-0.5">+{device.screenSizes.length - 1}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Supported ABIs */}
      <div className="px-4 py-2.5 bg-muted/25 border-t border-border/50 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-wrap items-center gap-1">
          {device.abis.slice(0, 2).map((abi) => (
            <Badge
              key={abi}
              variant="outline"
              className="font-mono text-[10px] px-1.5 py-0 h-5 bg-background/60 border-border/70 text-muted-foreground font-normal"
            >
              {abi}
            </Badge>
          ))}
          {device.abis.length > 2 && (
            <Badge
              variant="outline"
              className="font-mono text-[10px] px-1.5 py-0 h-5 bg-background/60 border-border/70 text-muted-foreground font-normal"
            >
              +{device.abis.length - 2}
            </Badge>
          )}
        </div>
        <span className="text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Specs →
        </span>
      </div>
    </Card>
  );
};
