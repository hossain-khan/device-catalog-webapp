import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ui/modal-header";
import { Button } from "@/components/ui/button";
import { AndroidDevice } from "@/types/device";
import { Copy, Check, Code } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
    } catch {
      toast.error("Failed to copy JSON");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col" hideCloseButton={true}>
        <ModalHeader
          title={`Source JSON - ${device.modelName}`}
          icon={<Code className="h-5 w-5" />}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="hover:bg-muted hover:text-foreground"
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy JSON'}
            </Button>
          }
          onClose={() => onOpenChange(false)}
        />

        {/* https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/ */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto border rounded-lg">
            <SyntaxHighlighter
              language="json"
              style={tomorrow}
              showLineNumbers={false}
              wrapLines={true}
              customStyle={{
                fontSize: '0.75rem',
                margin: 0
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