import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Check, AlertCircle, Trash2, TestTube, Download } from '@phosphor-icons/react';
import { AndroidDevice } from '@/types/device';
import { validateDeviceData } from '@/lib/deviceValidation';
import { generateTestDevices, downloadDevicesAsJson } from '@/lib/testDataGenerator';

interface FileUploadPanelProps {
  onDevicesLoaded: (devices: AndroidDevice[]) => void;
  onClearDevices: () => void;
  deviceCount: number;
  currentDevices?: AndroidDevice[]; // Add current devices for download
}

export function FileUploadPanel({ onDevicesLoaded, onClearDevices, deviceCount, currentDevices }: FileUploadPanelProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [testDataCount, setTestDataCount] = useState<number>(5000);

  const generateTestData = useCallback(async () => {
    setUploadStatus('loading');
    setErrorMessage('');

    try {
      // Use setTimeout to allow UI to update before heavy computation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const devices = generateTestDevices(testDataCount);
      onDevicesLoaded(devices);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate test data');
    }
  }, [testDataCount, onDevicesLoaded]);

  const processFile = useCallback(async (file: File) => {
    setUploadStatus('loading');
    setErrorMessage('');

    try {
      const text = await file.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
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

      onDevicesLoaded(data);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
    }
  }, [onDevicesLoaded]);

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

  const handleDownloadData = useCallback(() => {
    if (currentDevices && currentDevices.length > 0) {
      const filename = `android-devices-${currentDevices.length}-${new Date().toISOString().split('T')[0]}.json`;
      downloadDevicesAsJson(currentDevices, filename);
    }
  }, [currentDevices]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Device Catalog Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Currently loaded: <span className="font-medium">{deviceCount}</span> devices
          </p>
          {deviceCount > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadData}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearData}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          )}
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

        {/* Test data generation section */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Performance Testing
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label htmlFor="test-count" className="text-xs">Device Count</Label>
              <Input
                id="test-count"
                type="number"
                min="1000"
                max="50000"
                step="1000"
                value={testDataCount}
                onChange={(e) => setTestDataCount(parseInt(e.target.value) || 5000)}
                className="mt-1"
                placeholder="5000"
              />
            </div>
            <Button 
              onClick={generateTestData}
              disabled={uploadStatus === 'loading'}
              variant="outline"
              size="sm"
              className="mt-5"
            >
              Generate Test Data
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Generate synthetic device data for performance testing (recommended: 20,000+ devices)
          </p>
        </div>

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