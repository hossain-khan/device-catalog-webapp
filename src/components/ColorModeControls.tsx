import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ColorMode, FORM_FACTOR_COLORS, PERFORMANCE_TIERS, SDK_ERA_COLORS } from "@/lib/deviceColors";
import { Palette, DeviceMobile, Lightning, Factory, Clock } from "@phosphor-icons/react";

interface ColorModeControlsProps {
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

export const ColorModeControls = ({ colorMode, onColorModeChange }: ColorModeControlsProps) => {
  const getModeIcon = (mode: ColorMode) => {
    switch (mode) {
      case 'formFactor':
        return <DeviceMobile className="h-4 w-4" />;
      case 'performance':
        return <Lightning className="h-4 w-4" />;
      case 'manufacturer':
        return <Factory className="h-4 w-4" />;
      case 'sdkEra':
        return <Clock className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode: ColorMode) => {
    switch (mode) {
      case 'formFactor':
        return 'Form Factor';
      case 'performance':
        return 'Performance';
      case 'manufacturer':
        return 'Manufacturer';
      case 'sdkEra':
        return 'SDK Era';
      default:
        return 'Color Mode';
    }
  };

  const getModeDescription = (mode: ColorMode) => {
    switch (mode) {
      case 'formFactor':
        return 'Colors based on device type (Phone, Tablet, TV, etc.)';
      case 'performance':
        return 'Colors based on RAM and performance tier';
      case 'manufacturer':
        return 'Colors based on device manufacturer/brand';
      case 'sdkEra':
        return 'Colors based on Android SDK version era';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Color Coding:</span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            {getModeIcon(colorMode)}
            {getModeLabel(colorMode)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Color Coding Modes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => onColorModeChange('formFactor')}
            className={colorMode === 'formFactor' ? 'bg-accent' : ''}
          >
            <div className="flex items-start gap-3 w-full">
              <DeviceMobile className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Form Factor</div>
                <div className="text-xs text-muted-foreground">
                  Colors by device type
                </div>
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onColorModeChange('performance')}
            className={colorMode === 'performance' ? 'bg-accent' : ''}
          >
            <div className="flex items-start gap-3 w-full">
              <Lightning className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Performance Tier</div>
                <div className="text-xs text-muted-foreground">
                  Colors by RAM and performance
                </div>
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onColorModeChange('manufacturer')}
            className={colorMode === 'manufacturer' ? 'bg-accent' : ''}
          >
            <div className="flex items-start gap-3 w-full">
              <Factory className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Manufacturer</div>
                <div className="text-xs text-muted-foreground">
                  Colors by device brand
                </div>
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onColorModeChange('sdkEra')}
            className={colorMode === 'sdkEra' ? 'bg-accent' : ''}
          >
            <div className="flex items-start gap-3 w-full">
              <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">SDK Era</div>
                <div className="text-xs text-muted-foreground">
                  Colors by Android version era
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Legend */}
      <ColorLegend colorMode={colorMode} />
    </div>
  );
};

interface ColorLegendProps {
  colorMode: ColorMode;
}

const ColorLegend = ({ colorMode }: ColorLegendProps) => {
  const getLegendItems = () => {
    switch (colorMode) {
      case 'formFactor':
        return Object.entries(FORM_FACTOR_COLORS).map(([key, colors]) => ({
          label: key,
          color: colors.primary
        }));
      case 'performance':
        return PERFORMANCE_TIERS.map(tier => ({
          label: tier.name,
          color: tier.colors.primary
        }));
      case 'sdkEra':
        return Object.entries(SDK_ERA_COLORS).map(([key, colors]) => ({
          label: key,
          color: colors.primary
        }));
      case 'manufacturer':
        return [
          { label: 'Google', color: 'oklch(0.45 0.15 220)' },
          { label: 'Samsung', color: 'oklch(0.45 0.15 250)' },
          { label: 'OnePlus', color: 'oklch(0.45 0.15 15)' },
          { label: 'Others', color: 'oklch(0.45 0.15 220)' }
        ];
      default:
        return [];
    }
  };

  const legendItems = getLegendItems();

  if (legendItems.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Legend:</span>
      <div className="flex flex-wrap gap-2 max-w-md">
        {legendItems.slice(0, 4).map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded border"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
        {legendItems.length > 4 && (
          <span className="text-muted-foreground">+{legendItems.length - 4} more</span>
        )}
      </div>
    </div>
  );
};