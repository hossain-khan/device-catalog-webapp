import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { MagnifyingGlass, X, Funnel, SlidersHorizontal, CaretDown, Export } from "@phosphor-icons/react";
import { DeviceFilters } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { getFormFactorColors } from "@/lib/deviceColors";
import { SearchableMultiSelectManufacturer } from "@/components/SearchableMultiSelectManufacturer";

interface DeviceFiltersProps {
  filters: DeviceFilters;
  onFiltersChange: (filters: DeviceFilters) => void;
  manufacturers: string[];
  formFactors: string[];
  sdkVersions: number[];
  deviceCount: number;
  totalDevices: number;
  ramRange: [number, number];
  sdkVersionRange: [number, number];
  isFiltering?: boolean;
  onExportClick?: () => void;
}

export const DeviceFiltersPanel = ({
  filters,
  onFiltersChange,
  manufacturers,
  formFactors,
  sdkVersions,
  deviceCount,
  totalDevices,
  ramRange,
  sdkVersionRange,
  isFiltering = false,
  onExportClick
}: DeviceFiltersProps) => {
  const updateFilter = (key: keyof DeviceFilters, value: DeviceFilters[keyof DeviceFilters]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      formFactor: 'all',
      manufacturer: 'all',
      manufacturers: [], // Clear the new manufacturers array
      minRam: 'all',
      sdkVersion: 'all',
      ramRange: ramRange,
      sdkVersionRange: sdkVersionRange
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.formFactor !== 'all' ||
    filters.manufacturer !== 'all' ||
    (filters.manufacturers && filters.manufacturers.length > 0) || // Check for selected manufacturers
    filters.minRam !== 'all' ||
    filters.sdkVersion !== 'all' ||
    (filters.ramRange && (filters.ramRange[0] !== ramRange[0] || filters.ramRange[1] !== ramRange[1])) ||
    (filters.sdkVersionRange && (filters.sdkVersionRange[0] !== sdkVersionRange[0] || filters.sdkVersionRange[1] !== sdkVersionRange[1]));

  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices, manufacturers, processors..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Funnel className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <Select value={filters.formFactor} onValueChange={(value) => updateFilter('formFactor', value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Form Factor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Form Factors</SelectItem>
            {formFactors.map(factor => {
              const colors = getFormFactorColors(factor);
              return (
                <SelectItem key={factor} value={factor}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded border flex-shrink-0" 
                      style={{ backgroundColor: colors.primary }}
                    />
                    {factor}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <SearchableMultiSelectManufacturer
          manufacturers={manufacturers}
          selectedManufacturers={filters.manufacturers || []}
          onSelectionChange={(selected) => updateFilter('manufacturers', selected)}
          placeholder="All Manufacturers"
        />

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
            <SelectItem value="12288">12GB+</SelectItem>
            <SelectItem value="16384">16GB+</SelectItem>
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

        {/* Advanced Filters - moved to same row */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Advanced Filters
          <CaretDown className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Export button */}
        {onExportClick && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportClick}
            className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
          >
            <Export className="h-4 w-4" />
            Export
          </Button>
        )}

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

      {/* Advanced Filters Content */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleContent className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Range Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* RAM Range Slider */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">RAM Range</Label>
                <div className="px-3">
                  <Slider
                    value={filters.ramRange || ramRange}
                    onValueChange={(value) => updateFilter('ramRange', value as [number, number])}
                    min={ramRange[0]}
                    max={ramRange[1]}
                    step={Math.max(1, Math.floor((ramRange[1] - ramRange[0]) / 100))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatRam(`${filters.ramRange?.[0] || ramRange[0]}MB`)}</span>
                  <span>{formatRam(`${filters.ramRange?.[1] || ramRange[1]}MB`)}</span>
                </div>
              </div>

              {/* SDK Version Range Slider */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">SDK Version Range</Label>
                <div className="px-3">
                  <Slider
                    value={filters.sdkVersionRange || sdkVersionRange}
                    onValueChange={(value) => updateFilter('sdkVersionRange', value as [number, number])}
                    min={sdkVersionRange[0]}
                    max={sdkVersionRange[1]}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>API {filters.sdkVersionRange?.[0] || sdkVersionRange[0]}</span>
                  <span>API {filters.sdkVersionRange?.[1] || sdkVersionRange[1]}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {isFiltering ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Filtering...
              </div>
            ) : (
              `${deviceCount.toLocaleString()} of ${totalDevices.toLocaleString()} devices`
            )}
          </Badge>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{filters.search}"
                </Badge>
              )}
              {filters.formFactor !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="text-xs flex items-center gap-1"
                  style={(() => {
                    const colors = getFormFactorColors(filters.formFactor);
                    return { 
                      backgroundColor: colors.secondary, 
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    };
                  })()}
                >
                  <div 
                    className="w-2 h-2 rounded" 
                    style={{ backgroundColor: getFormFactorColors(filters.formFactor).primary }}
                  />
                  {filters.formFactor}
                </Badge>
              )}
              {filters.manufacturer !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {filters.manufacturer}
                </Badge>
              )}
              {filters.manufacturers && filters.manufacturers.length > 0 && (
                filters.manufacturers.map(manufacturer => (
                  <Badge key={manufacturer} variant="secondary" className="text-xs">
                    {manufacturer}
                  </Badge>
                ))
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
              {filters.ramRange && (filters.ramRange[0] !== ramRange[0] || filters.ramRange[1] !== ramRange[1]) && (
                <Badge variant="secondary" className="text-xs">
                  RAM: {formatRam(`${filters.ramRange[0]}MB`)} - {formatRam(`${filters.ramRange[1]}MB`)}
                </Badge>
              )}
              {filters.sdkVersionRange && (filters.sdkVersionRange[0] !== sdkVersionRange[0] || filters.sdkVersionRange[1] !== sdkVersionRange[1]) && (
                <Badge variant="secondary" className="text-xs">
                  SDK: API {filters.sdkVersionRange[0]} - {filters.sdkVersionRange[1]}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};