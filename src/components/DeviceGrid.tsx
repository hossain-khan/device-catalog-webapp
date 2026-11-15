import { memo, useCallback, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { DeviceCard } from "./DeviceCard";
import { DeviceTableView } from "./DeviceTableView";
import { DeviceCardSkeleton } from "./DeviceCardSkeleton";
import { PaginationControls } from "./PaginationControls";
import { ColorModeControls } from "./ColorModeControls";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { ColorMode } from "@/lib/deviceColors";
import { PaginationInfo } from "@/lib/paginationUtils";
import { CaretDown, Export, SquaresFour, Rows, MagnifyingGlass } from '@phosphor-icons/react';

// Lazy load heavy components
const DeviceJsonModal = lazy(() => import("./DeviceJsonModal").then(module => ({ default: module.DeviceJsonModal })));
const DeviceColorInfo = lazy(() => import("./DeviceColorInfo").then(module => ({ default: module.DeviceColorInfo })));
const CategoryDistribution = lazy(() => import("./CategoryDistribution").then(module => ({ default: module.CategoryDistribution })));

interface DeviceGridProps {
  devices: AndroidDevice[];
  allFilteredDevices?: AndroidDevice[];
  onDeviceClick: (device: AndroidDevice) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
  totalDevices?: number;
  colorMode?: ColorMode;
  onColorModeChange?: (mode: ColorMode) => void;
  onExportClick?: () => void;
}

export const DeviceGrid = memo(({ 
  devices, 
  allFilteredDevices,
  onDeviceClick, 
  pagination,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  totalDevices,
  colorMode = 'formFactor',
  onColorModeChange,
  onExportClick
}: DeviceGridProps) => {
  const isMobile = useIsMobile();
  const [jsonModalDevice, setJsonModalDevice] = useState<AndroidDevice | null>(null);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [colorInfoOpen, setColorInfoOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleShowJson = useCallback((device: AndroidDevice) => {
    setJsonModalDevice(device);
    setJsonModalOpen(true);
  }, []);

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <DeviceCardSkeleton count={pagination?.itemsPerPage || 24} />
        {pagination && onPageChange && onItemsPerPageChange && (
          <PaginationControls
            pagination={pagination}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            scrollToTopOnPageChange={false}
          />
        )}
      </motion.div>
    );
  }

  if (devices.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-dashed border-border bg-card/50"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
          <MagnifyingGlass className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          No devices found
        </h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          Try adjusting your search terms or filters to find the devices you're looking for.
        </p>
        {totalDevices !== undefined && totalDevices > 0 && (
          <p className="text-xs font-mono text-muted-foreground mt-3 px-3 py-1 rounded-full bg-muted">
            {totalDevices.toLocaleString()} devices available in total
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Secondary Toolbar: Color Mode, View Switcher, Export, Color Guide */}
      {onColorModeChange && (
        <div className="space-y-3">
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'} py-2 px-3.5 rounded-xl bg-card/70 border border-border/70`}>
            <ColorModeControls 
              colorMode={colorMode} 
              onColorModeChange={onColorModeChange} 
            />
            
            {devices.length > 0 && (
              <div className={`flex items-center gap-2 flex-wrap ${isMobile ? 'mt-1' : ''}`}>
                {/* Grid / Table View Mode Toggle */}
                <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/50 p-0.5">
                  <Button
                    type="button"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-7 px-2.5 text-xs gap-1.5 rounded-md ${
                      viewMode === 'grid'
                        ? 'shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <SquaresFour className="h-3.5 w-3.5" />
                    <span>Cards</span>
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={`h-7 px-2.5 text-xs gap-1.5 rounded-md ${
                      viewMode === 'table'
                        ? 'shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Rows className="h-3.5 w-3.5" />
                    <span>Table</span>
                  </Button>
                </div>

                {/* Export button */}
                {onExportClick && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onExportClick}
                    className="h-8 text-xs flex items-center gap-1.5 hover:bg-muted hover:text-foreground"
                  >
                    <Export className="h-3.5 w-3.5" />
                    Export
                  </Button>
                )}
                
                {/* Color Coding Information button */}
                <Collapsible open={colorInfoOpen} onOpenChange={setColorInfoOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1.5 hover:bg-muted hover:text-foreground">
                      Color Coding Information
                      <CaretDown className={`h-3.5 w-3.5 transition-transform ${colorInfoOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>
            )}
          </div>

          {/* Collapsible color coding information and distribution */}
          {devices.length > 0 && (
            <Collapsible open={colorInfoOpen} onOpenChange={setColorInfoOpen}>
              <CollapsibleContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
                  <div className="lg:col-span-2">
                    <Suspense fallback={<div className="h-32 bg-muted rounded-xl animate-pulse" />}>
                      <DeviceColorInfo 
                        devices={allFilteredDevices || devices} 
                        colorMode={colorMode} 
                      />
                    </Suspense>
                  </div>
                  <div>
                    <Suspense fallback={<div className="h-32 bg-muted rounded-xl animate-pulse" />}>
                      <CategoryDistribution 
                        devices={allFilteredDevices || devices}
                        colorMode={colorMode}
                        totalDevices={totalDevices || (allFilteredDevices || devices).length}
                      />
                    </Suspense>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}

      {/* Device Display: Grid or Table */}
      {viewMode === 'table' ? (
        <DeviceTableView
          devices={devices}
          onDeviceClick={onDeviceClick}
          onShowJson={handleShowJson}
          colorMode={colorMode}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {devices.map((device, index) => (
            <div key={`${device.device}-${index}`} className="h-full">
              <DeviceCard
                device={device}
                onClick={() => onDeviceClick(device)}
                onShowJson={() => handleShowJson(device)}
                colorMode={colorMode}
              />
            </div>
          ))}
        </div>
      )}
      
      {pagination && onPageChange && onItemsPerPageChange && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          scrollToTopOnPageChange={false}
        />
      )}

      {/* JSON Modal */}
      <Suspense fallback={null}>
        <DeviceJsonModal
          device={jsonModalDevice}
          open={jsonModalOpen}
          onOpenChange={setJsonModalOpen}
        />
      </Suspense>
    </div>
  );
});

DeviceGrid.displayName = 'DeviceGrid';
