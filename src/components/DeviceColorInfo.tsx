import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AndroidDevice } from "@/types/device";
import { 
  ColorMode, 
  getDeviceColors, 
  parseRamMB,
  PERFORMANCE_TIERS
} from "@/lib/deviceColors";
import { Info } from "@phosphor-icons/react";

interface DeviceColorInfoProps {
  devices: AndroidDevice[];
  colorMode: ColorMode;
}

export const DeviceColorInfo = ({ devices, colorMode }: DeviceColorInfoProps) => {
  const getCategoryStats = () => {
    const stats: Record<string, { count: number; color: string }> = {};
    
    devices.forEach(device => {
      const colors = getDeviceColors(device, colorMode);
      let category: string;
      
      switch (colorMode) {
        case 'formFactor':
          category = device.formFactor;
          break;
        case 'performance':
          const ramMB = parseRamMB(device.ram);
          const tier = PERFORMANCE_TIERS.find(t => ramMB < t.ramThreshold) || PERFORMANCE_TIERS[PERFORMANCE_TIERS.length - 1];
          category = tier.name;
          break;
        case 'manufacturer':
          category = device.manufacturer;
          break;
        case 'sdkEra':
          const maxSdk = Math.max(...device.sdkVersions);
          if (maxSdk < 26) category = 'Legacy';
          else if (maxSdk <= 30) category = 'Modern';
          else if (maxSdk <= 33) category = 'Recent';
          else category = 'Latest';
          break;
        default:
          category = 'Unknown';
      }
      
      if (!stats[category]) {
        stats[category] = { count: 0, color: colors.primary };
      }
      stats[category].count++;
    });
    
    return Object.entries(stats)
      .sort(([,a], [,b]) => b.count - a.count);
  };

  const getModeDescription = () => {
    switch (colorMode) {
      case 'formFactor':
        return 'Devices are color-coded by their form factor (Phone, Tablet, TV, etc.)';
      case 'performance':
        return 'Devices are color-coded by their performance tier based on RAM amount';
      case 'manufacturer':
        return 'Devices are color-coded by their manufacturer/brand';
      case 'sdkEra':
        return 'Devices are color-coded by their Android SDK version era';
      default:
        return '';
    }
  };

  const categoryStats = getCategoryStats();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Color Coding Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {getModeDescription()}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {categoryStats.slice(0, 6).map(([category, data]) => (
            <Badge 
              key={category}
              variant="outline" 
              className="text-xs flex items-center gap-1"
            >
              <div 
                className="w-2 h-2 rounded" 
                style={{ backgroundColor: data.color }}
              />
              {category}
              <span className="text-muted-foreground">({data.count})</span>
            </Badge>
          ))}
          {categoryStats.length > 6 && (
            <Badge variant="secondary" className="text-xs">
              +{categoryStats.length - 6} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};