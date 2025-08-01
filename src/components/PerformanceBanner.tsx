import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Database, Funnel } from "@phosphor-icons/react";

interface PerformanceBannerProps {
  totalDevices: number;
  filteredDevices: number;
  isFiltering: boolean;
  currentPage: number;
  itemsPerPage: number;
}

export const PerformanceBanner = ({
  totalDevices,
  filteredDevices,
  isFiltering,
  currentPage,
  itemsPerPage
}: PerformanceBannerProps) => {
  const isLargeDataset = totalDevices >= 1000;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredDevices);

  if (!isLargeDataset && !isFiltering) {
    return null;
  }

  return (
    <Card className="mb-6 border-muted bg-muted/30">
      <CardContent className="py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {isLargeDataset && (
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Large dataset: {totalDevices.toLocaleString()} devices
                </span>
              </div>
            )}
            
            {isFiltering && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filtering devices...</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Funnel className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Showing {startIndex.toLocaleString()}-{endIndex.toLocaleString()} of {filteredDevices.toLocaleString()} filtered
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Paginated for performance
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};