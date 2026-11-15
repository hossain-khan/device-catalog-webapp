import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useComparison } from "@/contexts/ComparisonContext";
import { Scales, X } from "@phosphor-icons/react";

interface ComparisonBarProps {
  onOpenComparison: () => void;
}

export const ComparisonBar = ({ onOpenComparison }: ComparisonBarProps) => {
  const { comparedDevices, removeFromComparison, clearComparison } = useComparison();

  if (comparedDevices.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl bg-card/95 backdrop-blur-md border border-border/90 rounded-2xl shadow-xl z-50 px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Scales className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">Compare</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {comparedDevices.length}/4
            </Badge>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {comparedDevices.map(device => {
              const deviceId = `${device.brand}-${device.device}`;
              return (
                <div
                  key={deviceId}
                  className="inline-flex items-center gap-1.5 bg-muted/80 border border-border/70 rounded-lg pl-2.5 pr-1 py-1 text-xs"
                >
                  <span className="font-medium truncate max-w-[140px]">
                    {device.modelName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 rounded hover:bg-destructive/15 hover:text-destructive"
                    onClick={() => removeFromComparison(deviceId)}
                    title={`Remove ${device.modelName}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearComparison}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
          <Button
            size="sm"
            onClick={onOpenComparison}
            disabled={comparedDevices.length < 2}
            className="h-8 text-xs shadow-xs"
          >
            Compare ({comparedDevices.length})
          </Button>
        </div>
      </div>
    </div>
  );
};
