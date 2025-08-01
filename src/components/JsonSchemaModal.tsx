import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, FileCode } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface JsonSchemaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const jsonSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AndroidDeviceCatalog",
  "description": "A list of Android device specifications as found in the Google Play Device Catalog.",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "brand",
      "device",
      "manufacturer",
      "modelName",
      "ram",
      "formFactor",
      "processorName",
      "gpu",
      "screenSizes",
      "screenDensities",
      "abis",
      "sdkVersions",
      "openGlEsVersions"
    ],
    "properties": {
      "brand": {
        "type": "string",
        "description": "Device brand name (e.g., samsung, google, vivo)."
      },
      "device": {
        "type": "string",
        "description": "Device code name or identifier."
      },
      "manufacturer": {
        "type": "string",
        "description": "Device manufacturer (e.g., Samsung, Google, Vivo)."
      },
      "modelName": {
        "type": "string",
        "description": "Device model name as marketed."
      },
      "ram": {
        "type": "string",
        "description": "Amount of RAM in MB, may be a range (e.g., 3894-6003MB)."
      },
      "formFactor": {
        "type": "string",
        "description": "Device form factor (e.g., Phone, Tablet, TV, Wearable)."
      },
      "processorName": {
        "type": "string",
        "description": "System-on-chip (SoC) or processor name."
      },
      "gpu": {
        "type": "string",
        "description": "Graphics processor unit (GPU) details."
      },
      "screenSizes": {
        "type": "array",
        "items": {
          "type": "string",
          "pattern": "^[0-9]+x[0-9]+$",
          "description": "Screen resolution in WIDTHxHEIGHT format (e.g., 1080x1920)."
        },
        "minItems": 1,
        "description": "List of supported screen resolutions."
      },
      "screenDensities": {
        "type": "array",
        "items": {
          "type": "integer",
          "description": "Screen density in dpi (e.g., 320)."
        },
        "minItems": 1,
        "description": "List of supported screen densities."
      },
      "abis": {
        "type": "array",
        "items": {
          "type": "string",
          "description": "Supported CPU ABIs (e.g., arm64-v8a, armeabi-v7a)."
        },
        "minItems": 1,
        "description": "List of supported CPU ABIs."
      },
      "sdkVersions": {
        "type": "array",
        "items": {
          "type": "integer",
          "description": "Supported Android SDK versions (e.g., 30, 31)."
        },
        "minItems": 1,
        "description": "List of supported Android SDK versions."
      },
      "openGlEsVersions": {
        "type": "array",
        "items": {
          "type": "string",
          "pattern": "^[0-9]+\\\\.[0-9]+$",
          "description": "Supported OpenGL ES version (e.g., 3.2)."
        },
        "minItems": 1,
        "description": "List of supported OpenGL ES versions."
      }
    },
    "additionalProperties": false
  }
}`;

export function JsonSchemaModal({ open, onOpenChange }: JsonSchemaModalProps) {
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
            <pre className="json-code bg-muted p-4 rounded-md overflow-auto text-xs">
              <code>{jsonSchema}</code>
            </pre>
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