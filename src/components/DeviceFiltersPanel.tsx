import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { trackSearch, trackFilter, trackDeviceAction } from '@/lib/analytics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { MagnifyingGlass, X, SlidersHorizontal, CaretDown, Funnel } from "@phosphor-icons/react";
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
  isFiltering = false
}: DeviceFiltersProps) => {
  const updateFilter = (key: keyof DeviceFilters, value: DeviceFilters[keyof DeviceFilters]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      formFactor: 'all',
      manufacturer: 'all',
      manufacturers: [],
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
    (filters.manufacturers && filters.manufacturers.length > 0) ||
    filters.minRam !== 'all' ||
    filters.sdkVersion !== 'all' ||
    (filters.ramRange && ramRange[0] !== Infinity && ramRange[1] !== -Infinity && 
     (filters.ramRange[0] !== ramRange[0] || filters.ramRange[1] !== ramRange[1])) ||
    (filters.sdkVersionRange && sdkVersionRange[0] !== Infinity && sdkVersionRange[1] !== -Infinity && 
     (filters.sdkVersionRange[0] !== sdkVersionRange[0] || filters.sdkVersionRange[1] !== sdkVersionRange[1]));

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Track search with debounce
  useEffect(() => {
    if (filters.search) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        trackSearch(filters.search, deviceCount);
      }, 1000);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters.search, deviceCount]);

  // Keyboard shortcut "/" to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs space-y-3.5">
      {/* Primary Search & Quick Filters Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search devices, manufacturers, processors..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 pr-14 h-9 bg-background/60 border-border/80 text-sm"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => updateFilter('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              /
            </kbd>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-1">
            <Funnel className="h-3.5 w-3.5" />
            <span>Filters</span>
          </div>

          <Select value={filters.formFactor} onValueChange={(value) => {
            updateFilter('formFactor', value);
            if (value !== 'all') trackFilter('form_factor', value);
          }}>
            <SelectTrigger className="w-[165px] h-9 text-xs bg-background/60">
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
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
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
            maxDisplayedItems={1}
          />

          <Select value={filters.minRam} onValueChange={(value) => updateFilter('minRam', value)}>
            <SelectTrigger className="w-[115px] h-9 text-xs bg-background/60">
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
            <SelectTrigger className="w-[115px] h-9 text-xs bg-background/60">
              <SelectValue placeholder="SDK Version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any SDK</SelectItem>
              {sdkVersions.map(version => (
                <SelectItem key={version} value={version.toString()}>API {version}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant={advancedOpen ? "secondary" : "outline"}
            size="sm" 
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="h-9 text-xs flex items-center gap-1.5 bg-background/60 hover:bg-muted hover:text-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Ranges</span>
            <CaretDown className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Collapsible Range Sliders */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleContent>
          <div className="pt-3 mt-1 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/25 rounded-lg p-4">
            {/* RAM Range Slider */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  RAM Capacity Range
                </Label>
                <span className="text-xs font-mono font-medium text-foreground">
                  {formatRam(`${filters.ramRange?.[0] || ramRange[0]}MB`)} – {formatRam(`${filters.ramRange?.[1] || ramRange[1]}MB`)}
                </span>
              </div>
              <div className="px-1">
                <Slider
                  value={filters.ramRange || ramRange}
                  onValueChange={(value) => updateFilter('ramRange', value as [number, number])}
                  min={ramRange[0]}
                  max={ramRange[1]}
                  step={Math.max(1, Math.floor((ramRange[1] - ramRange[0]) / 100))}
                  className="w-full"
                />
              </div>
            </div>

            {/* SDK Version Range Slider */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Android SDK / API Range
                </Label>
                <span className="text-xs font-mono font-medium text-foreground">
                  API {filters.sdkVersionRange?.[0] || sdkVersionRange[0]} – API {filters.sdkVersionRange?.[1] || sdkVersionRange[1]}
                </span>
              </div>
              <div className="px-1">
                <Slider
                  value={filters.sdkVersionRange || sdkVersionRange}
                  onValueChange={(value) => updateFilter('sdkVersionRange', value as [number, number])}
                  min={sdkVersionRange[0]}
                  max={sdkVersionRange[1]}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Bottom Status & Active Filter Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="font-mono text-xs font-medium px-2.5 py-0.5 bg-muted/80">
            {isFiltering ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Filtering...
              </span>
            ) : (
              `${deviceCount.toLocaleString()} of ${totalDevices.toLocaleString()} devices`
            )}
          </Badge>

          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.search && (
                <Badge variant="outline" className="text-xs gap-1 pl-2 pr-1 py-0.5 bg-primary/5 border-primary/25">
                  <span>Search: "{filters.search}"</span>
                  <button
                    type="button"
                    onClick={() => updateFilter('search', '')}
                    className="hover:bg-muted rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.formFactor !== 'all' && (
                <Badge
                  variant="outline"
                  className="text-xs gap-1.5 pl-2 pr-1 py-0.5"
                  style={(() => {
                    const colors = getFormFactorColors(filters.formFactor);
                    return {
                      backgroundColor: colors.secondary,
                      borderColor: colors.border
                    };
                  })()}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getFormFactorColors(filters.formFactor).primary }}
                  />
                  <span>{filters.formFactor}</span>
                  <button
                    type="button"
                    onClick={() => updateFilter('formFactor', 'all')}
                    className="hover:bg-background/50 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.manufacturer !== 'all' && (
                <Badge variant="outline" className="text-xs gap-1 pl-2 pr-1 py-0.5">
                  <span>{filters.manufacturer}</span>
                  <button
                    type="button"
                    onClick={() => updateFilter('manufacturer', 'all')}
                    className="hover:bg-muted rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.manufacturers && filters.manufacturers.length > 0 && (
                filters.manufacturers.map(manufacturer => (
                  <Badge key={manufacturer} variant="outline" className="text-xs gap-1 pl-2 pr-1 py-0.5">
                    <span>{manufacturer}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateFilter(
                          'manufacturers',
                          (filters.manufacturers || []).filter((m) => m !== manufacturer)
                        )
                      }
                      className="hover:bg-muted rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
              {filters.minRam !== 'all' && (
                <Badge variant="outline" className="text-xs gap-1 pl-2 pr-1 py-0.5">
                  <span>
                    {parseInt(filters.minRam) >= 1024 ? `${parseInt(filters.minRam) / 1024}GB+` : `${filters.minRam}MB+`}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateFilter('minRam', 'all')}
                    className="hover:bg-muted rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.sdkVersion !== 'all' && (
                <Badge variant="outline" className="text-xs gap-1 pl-2 pr-1 py-0.5">
                  <span>API {filters.sdkVersion}</span>
                  <button
                    type="button"
                    onClick={() => updateFilter('sdkVersion', 'all')}
                    className="hover:bg-muted rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.ramRange && (filters.ramRange[0] !== ramRange[0] || filters.ramRange[1] !== ramRange[1]) &&
               ramRange[0] !== Infinity && ramRange[1] !== -Infinity && (
                <Badge variant="outline" className="text-xs">
                  RAM: {formatRam(`${filters.ramRange[0]}MB`)} - {formatRam(`${filters.ramRange[1]}MB`)}
                </Badge>
              )}
              {filters.sdkVersionRange && (filters.sdkVersionRange[0] !== sdkVersionRange[0] || filters.sdkVersionRange[1] !== sdkVersionRange[1]) &&
               sdkVersionRange[0] !== Infinity && sdkVersionRange[1] !== -Infinity && (
                <Badge variant="outline" className="text-xs">
                  SDK: API {filters.sdkVersionRange[0]} - {filters.sdkVersionRange[1]}
                </Badge>
              )}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearFilters();
              trackDeviceAction('clear_filters', { filters_cleared: true });
            }}
            className="h-7 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};
