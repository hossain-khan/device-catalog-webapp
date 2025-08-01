import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { Copy, Check, Code, X } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DeviceJsonModalProps {
  device: AndroidDevice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeviceJsonModal = ({ device, open, onOpenChange }: DeviceJsonModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!device) return null;

  const jsonString = JSON.stringify(device, null, 2);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy JSON");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Source JSON - {device.modelName}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy JSON'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto border rounded-lg">
            <SyntaxHighlighter
              language="json"
              style={oneDark}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.875rem',
                lineHeight: '1.4',
                height: '100%',
                background: 'transparent'
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'var(--font-mono), ui-monospace, "Cascadia Code", "Segoe UI Mono", "Ubuntu Mono", "Roboto Mono", "Fira Code", monospace'
                }
              }}
            >
              {jsonString}
            </SyntaxHighlighter>
          </div>
        </div>

        <div className="pt-4 text-sm text-muted-foreground">
          This is the source JSON data that was used to generate the device information shown in the browser.
        </div>
      </DialogContent>
    </Dialog>
  );
};