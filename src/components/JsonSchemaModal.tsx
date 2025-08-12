import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, FileCode } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { getAndroidDeviceJsonSchema } from '@/lib/deviceValidation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface JsonSchemaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JsonSchemaModal({ open, onOpenChange }: JsonSchemaModalProps) {
  const jsonSchema = JSON.stringify(getAndroidDeviceJsonSchema(), null, 2);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(jsonSchema).then(() => {
      toast.success('JSON schema copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy JSON schema');
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            Android Device Catalog JSON Schema
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              This JSON Schema defines the structure and validation rules for Android device catalog data.
              All uploaded files are validated against this schema.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySchema}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Schema
            </Button>
          </div>
          
          <div className="relative">
            <div className="border rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language="json"
                style={tomorrow}
                showLineNumbers={false}
                wrapLines={true}
                customStyle={{
                  fontSize: '0.75rem',
                  margin: 0,
                  maxHeight: '24rem'
                }}
              >
                {jsonSchema}
              </SyntaxHighlighter>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}