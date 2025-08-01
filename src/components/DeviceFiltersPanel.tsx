import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "@phosphor-icons/react";
import { DeviceFilters } from "@/types/device";

interface DeviceFiltersProps {
  filters: DeviceFilters;
  onFiltersChange: (filters: DeviceFilters) => void;
  manufacturers: string[];
  formFactors: string[];
  sdkVersions: number[];
  deviceCount: number;
  totalDevices: number;
}

export const DeviceFiltersPanel = ({
  filters,
  onFiltersChange,
  manufacturers,
  formFactors,
  sdkVersions,
  deviceCount,
  totalDevices
}: DeviceFiltersProps) => {
  const updateFilter = (key: keyof DeviceFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      formFactor: 'all',
      manufacturer: 'all',
      minRam: 'all',
      sdkVersion: 'all'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices, manufacturers, processors..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={filters.formFactor} onValueChange={(value) => updateFilter('formFactor', value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Form Factor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Form Factors</SelectItem>
            {formFactors.map(factor => (
              <SelectItem key={factor} value={factor}>{factor}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.manufacturer} onValueChange={(value) => updateFilter('manufacturer', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Manufacturer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Manufacturers</SelectItem>
            {manufacturers.map(manufacturer => (
              <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.minRam} onValueChange={(value) => updateFilter('minRam', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Min RAM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any RAM</SelectItem>
            <SelectItem value="1024">1GB+</SelectItem>
            <SelectItem value="2048">2GB+</SelectItem>
            <SelectItem value="4096">4GB+</SelectItem>
            <SelectItem value="8192">8GB+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sdkVersion} onValueChange={(value) => updateFilter('sdkVersion', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="SDK Version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any SDK</SelectItem>
            {sdkVersions.map(version => (
              <SelectItem key={version} value={version.toString()}>API {version}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {deviceCount} of {totalDevices} devices
          </Badge>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{filters.search}"
                </Badge>
              )}
              {filters.formFactor !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {filters.formFactor}
                </Badge>
              )}
              {filters.manufacturer !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {filters.manufacturer}
                </Badge>
              )}
              {filters.minRam !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {parseInt(filters.minRam) >= 1024 ? `${parseInt(filters.minRam)/1024}GB+` : `${filters.minRam}MB+`}
                </Badge>
              )}
              {filters.sdkVersion !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  API {filters.sdkVersion}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};