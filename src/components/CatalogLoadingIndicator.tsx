import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, RefreshCw } from "@phosphor-icons/react";
import { LoadingState } from "@/services/deviceCatalogService";

interface CatalogLoadingIndicatorProps {
  loadingState: LoadingState;
  onRetry?: () => void;
  onSkip?: () => void;
}

export function CatalogLoadingIndicator({ 
  loadingState, 
  onRetry, 
  onSkip 
}: CatalogLoadingIndicatorProps) {
  const { isLoading, progress, message, error } = loadingState;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            ) : error ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Download className="h-5 w-5 text-accent" />
            )}
            <h3 className="text-lg font-semibold">
              {error ? 'Loading Failed' : 'Loading Device Catalog'}
            </h3>
          </div>

          {!error && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <p className="text-sm text-destructive">
                {error}
              </p>
              <p className="text-xs text-muted-foreground">
                The app will continue with sample data if you skip this step.
              </p>
            </div>
          )}

          {!isLoading && (
            <div className="flex space-x-2 pt-2">
              {error && onRetry && (
                <Button 
                  onClick={onRetry} 
                  variant="outline" 
                  className="flex-1"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
              {onSkip && (
                <Button 
                  onClick={onSkip} 
                  variant={error ? "default" : "outline"} 
                  className="flex-1"
                  size="sm"
                >
                  {error ? 'Continue with Sample Data' : 'Skip'}
                </Button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center pt-2">
              <Button 
                onClick={onSkip} 
                variant="ghost" 
                size="sm"
                className="text-xs"
              >
                Skip and use sample data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}