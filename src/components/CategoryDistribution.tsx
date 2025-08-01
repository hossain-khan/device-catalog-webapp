import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AndroidDevice } from "@/types/device";
import { 
  ColorMode, 
  getDeviceColors, 
  parseRamMB,
  PERFORMANCE_TIERS
} from "@/lib/deviceColors";
import { BarChart3 } from "@phosphor-icons/react";

interface CategoryDistributionProps {
  devices: AndroidDevice[];
  colorMode: ColorMode;
  totalDevices: number;
}

export const CategoryDistribution = ({ devices, colorMode, totalDevices }: CategoryDistributionProps) => {
  const getCategoryDistribution = () => {
    const distribution: Record<string, { count: number; color: string; percentage: number }> = {};
    
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
      
      if (!distribution[category]) {
        distribution[category] = { 
          count: 0, 
          color: colors.primary,
          percentage: 0
        };
      }
      distribution[category].count++;
    });
    
    // Calculate percentages
    Object.keys(distribution).forEach(category => {
      distribution[category].percentage = (distribution[category].count / totalDevices) * 100;
    });
    
    return Object.entries(distribution)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 8); // Show top 8 categories
  };

  const getModeTitle = () => {
    switch (colorMode) {
      case 'formFactor':
        return 'Form Factor Distribution';
      case 'performance':
        return 'Performance Tier Distribution';
      case 'manufacturer':
        return 'Manufacturer Distribution';
      case 'sdkEra':
        return 'SDK Era Distribution';
      default:
        return 'Category Distribution';
    }
  };

  const distribution = getCategoryDistribution();

  if (distribution.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">{getModeTitle()}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {distribution.map(([category, data]) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className="w-3 h-3 rounded border flex-shrink-0" 
                  style={{ backgroundColor: data.color }}
                />
                <span className="text-sm font-medium truncate">{category}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {data.percentage.toFixed(1)}%
                </span>
                <Badge variant="outline" className="text-xs">
                  {data.count.toLocaleString()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {devices.length !== totalDevices && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            Showing {devices.length.toLocaleString()} of {totalDevices.toLocaleString()} total devices
          </div>
        )}
      </CardContent>
    </Card>
  );
};