import { memo, useCallback, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { DeviceCard } from "./DeviceCard";
import { DeviceCardSkeleton } from "./DeviceCardSkeleton";
import { PaginationControls } from "./PaginationControls";
import { ColorModeControls } from "./ColorModeControls";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { ColorMode } from "@/lib/deviceColors";
import { PaginationInfo } from "@/lib/paginationUtils";
import { CaretDown, Export } from '@phosphor-icons/react';

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
        transition={{ duration: 0.3 }}
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
        className="flex flex-col items-center justify-center py-16 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div 
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <motion.span 
            className="text-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            📱
          </motion.span>
        </motion.div>
        <motion.h3 
          className="text-xl font-semibold mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          No devices found
        </motion.h3>
        <motion.p 
          className="text-muted-foreground max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Try adjusting your search terms or filters to find the devices you're looking for.
        </motion.p>
        {totalDevices !== undefined && totalDevices > 0 && (
          <motion.p 
            className="text-sm text-muted-foreground mt-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {totalDevices.toLocaleString()} devices available in total
          </motion.p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Color mode controls with collapsible color information */}
      {onColorModeChange && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
            <ColorModeControls 
              colorMode={colorMode} 
              onColorModeChange={onColorModeChange} 
            />
            
            {devices.length > 0 && (
              <motion.div 
                className={`flex items-center gap-2 ${isMobile ? 'mt-2' : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {/* Export button */}
                {onExportClick && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onExportClick}
                    className="flex items-center gap-2 hover:bg-muted hover:text-foreground transition-all duration-200 hover:scale-105"
                  >
                    <Export className="h-4 w-4" />
                    Export
                  </Button>
                )}
                
                {/* Color Coding Information button */}
                <Collapsible open={colorInfoOpen} onOpenChange={setColorInfoOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-muted hover:text-foreground transition-all duration-200 hover:scale-105">
                      Color Coding Information
                      <CaretDown className={`h-4 w-4 transition-transform ${colorInfoOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </motion.div>
            )}
          </div>

          {/* Collapsible color coding information and distribution */}
          {devices.length > 0 && (
            <Collapsible open={colorInfoOpen} onOpenChange={setColorInfoOpen}>
              <CollapsibleContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                  <div className="lg:col-span-2">
                    <Suspense fallback={<div className="h-32 bg-muted rounded animate-pulse" />}>
                      <DeviceColorInfo 
                        devices={allFilteredDevices || devices} 
                        colorMode={colorMode} 
                      />
                    </Suspense>
                  </div>
                  <div>
                    <Suspense fallback={<div className="h-32 bg-muted rounded animate-pulse" />}>
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
        </motion.div>
      )}

      {/* Device display */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1
            }
          }
        }}
      >
        {devices.map((device, index) => (
          <motion.div
            key={`${device.device}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.9 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  duration: 0.4,
                  ease: "easeOut"
                }
              }
            }}
          >
            <DeviceCard
              device={device}
              onClick={() => onDeviceClick(device)}
              onShowJson={() => handleShowJson(device)}
              colorMode={colorMode}
            />
          </motion.div>
        ))}
      </motion.div>
      
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