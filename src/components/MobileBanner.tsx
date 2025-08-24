import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { useKV } from '@/hooks/useKV';
import { Desktop, X } from "@phosphor-icons/react";

export const MobileBanner = () => {
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = useKV('mobile-banner-dismissed', false);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Only show on mobile devices and if not dismissed
  if (!isMobile || isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <Desktop className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <div className="flex items-start justify-between w-full">
        <AlertDescription className="text-amber-800 dark:text-amber-200 flex-1">
          <strong className="font-medium">Desktop Experience Recommended</strong>
          <br />
          This app is optimized for desktop viewing. While mobile browsing works, you'll get the best experience with more screen space to explore device details and comparisons.
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="ml-4 h-6 w-6 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </Button>
      </div>
    </Alert>
  );
};