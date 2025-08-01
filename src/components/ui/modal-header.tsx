import { ReactNode } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ModalHeaderProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export const ModalHeader = ({
  title,
  subtitle,
  icon,
  actions,
  onClose,
  showCloseButton = true,
  className
}: ModalHeaderProps) => {
  return (
    <DialogHeader className={cn(
      "flex flex-row items-center justify-between space-y-0 pb-6 mb-6 border-b border-border",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-xl font-semibold leading-tight">
            {title}
          </DialogTitle>
          {subtitle && (
            <div className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      
      {(actions || showCloseButton) && (
        <div className="flex items-center gap-2 ml-4">
          {actions}
          {showCloseButton && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
              aria-label="Close dialog"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      )}
    </DialogHeader>
  );
};