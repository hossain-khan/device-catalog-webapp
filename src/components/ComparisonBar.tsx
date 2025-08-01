import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useComparison } from "@/contexts/ComparisonContext";
import { Scale, X } from "@phosphor-icons/react";

interface ComparisonBarProps {
  onOpenComparison: () => void;
}

export const ComparisonBar = ({ onOpenComparison }: ComparisonBarProps) => {
  const { comparedDevices, removeFromComparison, clearComparison } = useComparison();

  if (comparedDevices.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-medium">Compare Devices</span>
              <Badge variant="secondary">
                {comparedDevices.length}/4
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {comparedDevices.map(device => {
                const deviceId = `${device.brand}-${device.device}`;
                return (
                  <div
                    key={deviceId}
                    className="flex items-center gap-1 bg-secondary rounded-md pl-2 pr-1 py-1"
                  >
                    <span className="text-sm font-medium">
                      {device.modelName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeFromComparison(deviceId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearComparison}
            >
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={onOpenComparison}
              disabled={comparedDevices.length < 2}
            >
              Compare ({comparedDevices.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};