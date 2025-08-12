import { useState, useCallback } from 'react';
import { useKV } from '@/hooks/useKV';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Check, AlertCircle, Trash2, Download, RefreshCw } from '@phosphor-icons/react';
import { AndroidDevice } from '@/types/device';
import { validateDeviceData, sanitizeDeviceData } from '@/lib/deviceValidation';

interface FileUploadPanelEnhancedProps {
  onReloadCatalog: () => void;
  deviceCount: number;
  catalogDeviceCount: number;
  uploadedDeviceCount: number;
  onClearDevices: () => void;
  onFiltersReset: () => void;
}

export function FileUploadPanelEnhanced({ 
  onReloadCatalog,
  deviceCount, 
  catalogDeviceCount,
  uploadedDeviceCount,
  onClearDevices,
  onFiltersReset
}: FileUploadPanelEnhancedProps) {
  const [, setUploadedDevices] = useKV<AndroidDevice[]>('uploaded-devices', []);
  
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [catalogStatus, setCatalogStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [catalogError, setCatalogError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setUploadStatus('loading');
    setErrorMessage('');

    try {
      const text = await file.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON format. Please check your file structure.');
      }

      // Validate that data is an array
      if (!Array.isArray(data)) {
        throw new Error('File must contain an array of device objects.');
      }

      if (data.length === 0) {
        throw new Error('File contains no device data.');
      }

      // Validate device structure
      const validationResult = validateDeviceData(data);
      if (!validationResult.isValid) {
        throw new Error(`Invalid device data: ${validationResult.errors.join(', ')}`);
      }

      // Sanitize and save the devices
      const sanitizedDevices = sanitizeDeviceData(data);
      setUploadedDevices(sanitizedDevices);
      onFiltersReset(); // Reset filters when new data is uploaded
      
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
    }
  }, [setUploadedDevices, onFiltersReset]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      processFile(file);
    } else {
      setUploadStatus('error');
      setErrorMessage('Please drop a valid JSON file.');
    }
  }, [processFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClearData = useCallback(() => {
    onClearDevices();
    setUploadStatus('idle');
    setErrorMessage('');
  }, [onClearDevices]);

  const handleReloadCatalog = useCallback(async () => {
    setCatalogStatus('loading');
    setCatalogError('');
    
    try {
      onReloadCatalog();
      setCatalogStatus('success');
      setTimeout(() => setCatalogStatus('idle'), 3000); // Reset after 3 seconds
    } catch (error) {
      setCatalogStatus('error');
      setCatalogError(error instanceof Error ? error.message : 'Failed to reload catalog');
    }
  }, [onReloadCatalog]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Device Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Status Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Current Device Data</h3>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total devices loaded:</span>
              <span className="font-medium">{deviceCount.toLocaleString()}</span>
            </div>
            {catalogDeviceCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">From official catalog:</span>
                <span className="font-medium text-accent">{catalogDeviceCount.toLocaleString()}</span>
              </div>
            )}
            {uploadedDeviceCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">From uploaded file:</span>
                <span className="font-medium text-primary">{uploadedDeviceCount.toLocaleString()}</span>
              </div>
            )}
            {deviceCount > 0 && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearData}
                  className="flex items-center gap-2 w-full"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Official Catalog Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Official Device Catalog</h3>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Load the latest device catalog from the official Android Device Catalog repository.
            </p>
            <Button 
              onClick={handleReloadCatalog}
              disabled={catalogStatus === 'loading'}
              className="flex items-center gap-2 w-full"
              variant="outline"
            >
              {catalogStatus === 'loading' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading Catalog...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {catalogDeviceCount > 0 ? 'Reload' : 'Load'} Official Catalog
                </>
              )}
            </Button>
            
            {catalogStatus === 'success' && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Official catalog reloaded successfully!
                </AlertDescription>
              </Alert>
            )}
            
            {catalogStatus === 'error' && catalogError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{catalogError}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <Separator />

        {/* File Upload Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Upload Custom Device Data</h3>
          <p className="text-xs text-muted-foreground">
            Upload your own device catalog JSON file to override the current data.
          </p>
        </div>

        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            ${uploadStatus === 'loading' ? 'pointer-events-none opacity-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {uploadStatus === 'loading' ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : uploadStatus === 'success' ? (
                <Check className="w-6 h-6 text-green-600" />
              ) : uploadStatus === 'error' ? (
                <AlertCircle className="w-6 h-6 text-destructive" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            
            <div>
              <p className="font-medium">
                {uploadStatus === 'loading' ? 'Processing file...' :
                 uploadStatus === 'success' ? 'File uploaded successfully!' :
                 'Drop your JSON file here or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports JSON files with Android device catalog data
              </p>
            </div>

            <Label htmlFor="file-upload" className="cursor-pointer">
              <Input
                id="file-upload"
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="mt-2"
                disabled={uploadStatus === 'loading'}
              >
                Browse Files
              </Button>
            </Label>
          </div>
        </div>

        {uploadStatus === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'success' && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Device catalog loaded successfully! You can now browse and filter the devices.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-2">Expected JSON format:</p>
          <code className="block bg-muted p-2 rounded text-xs">
            {`[
  {
    "brand": "google",
    "device": "walleye",
    "manufacturer": "Google",
    "modelName": "Pixel 2",
    "ram": "1992-4116MB",
    "formFactor": "Phone",
    "processorName": "Qualcomm MSM8998",
    "gpu": "Qualcomm Adreno 540",
    "screenSizes": ["1080x1920"],
    "screenDensities": [420],
    "abis": ["arm64-v8a"],
    "sdkVersions": [29, 30],
    "openGlEsVersions": ["3.2"]
  }
]`}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}