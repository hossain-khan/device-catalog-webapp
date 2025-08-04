import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, Check, Warning, Trash, Download, Globe, TestTube, Code, Database, GithubLogo, FileArrowDown } from '@phosphor-icons/react';
import { AndroidDevice } from '@/types/device';
import { validateDeviceData } from '@/lib/deviceValidation';
import { generateTestDevices, downloadDevicesAsJson } from '@/lib/testDataGenerator';
import { JsonSchemaModal } from '@/components/JsonSchemaModal';

interface FileUploadPanelProps {
  onDevicesLoaded: (devices: AndroidDevice[]) => void;
  onClearDevices: () => void;
  deviceCount: number;
  currentDevices?: AndroidDevice[]; // Add current devices for download
  onActivateUrlTab?: () => void; // Callback to activate URL tab from external trigger
}

export interface FileUploadPanelRef {
  activateUrlTab: () => void;
}

export const FileUploadPanel = forwardRef<FileUploadPanelRef, FileUploadPanelProps>(
  ({ onDevicesLoaded, onClearDevices, deviceCount, currentDevices, onActivateUrlTab }, ref) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'warning'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [testDataCount, setTestDataCount] = useState<number>(5000);
  const [urlInput, setUrlInput] = useState<string>('https://raw.githubusercontent.com/hossain-khan/android-device-catalog-parser/refs/heads/main/sample/src/main/resources/android-devices-catalog.json');
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);
  const [validationProgress, setValidationProgress] = useState<{ current: number; total: number } | null>(null);
  const [activeTabInternal, setActiveTabInternal] = useState<string>('preloaded');

  const handleUseLatestDataset = useCallback(() => {
    // Activate URL tab and set the URL
    setActiveTabInternal('url');
    setUrlInput('https://raw.githubusercontent.com/hossain-khan/android-device-catalog-parser/refs/heads/main/sample/src/main/resources/android-devices-catalog.json');
    
    // Trigger callback to parent if provided
    if (onActivateUrlTab) {
      onActivateUrlTab();
    }
  }, [onActivateUrlTab]);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    activateUrlTab: () => {
      setActiveTabInternal('url');
      setUrlInput('https://raw.githubusercontent.com/hossain-khan/android-device-catalog-parser/refs/heads/main/sample/src/main/resources/android-devices-catalog.json');
    }
  }), []);

  const loadFromUrl = useCallback(async () => {
    if (!urlInput.trim()) {
      setUploadStatus('error');
      setErrorMessage('Please enter a valid URL');
      setValidationErrors([]);
      return;
    }

    setUploadStatus('loading');
    setErrorMessage('');
    setValidationErrors([]);
    setValidationProgress(null);

    try {
      const response = await fetch(urlInput.trim());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Try to parse anyway, as some servers don't set proper content-type
        // console.warn('Content-Type is not application/json, but attempting to parse as JSON');
      }

      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON format received from URL. Please check the URL and try again.');
      }

      // Validate that data is an array
      if (!Array.isArray(data)) {
        throw new Error('URL must return an array of device objects.');
      }

      if (data.length === 0) {
        throw new Error('URL returned no device data.');
      }

      // Set validation progress
      setValidationProgress({ current: 0, total: data.length });

      // Comprehensive JSON schema validation
      const validationResult = validateDeviceData(data);
      
      if (!validationResult.isValid) {
        setUploadStatus('error');
        setErrorMessage(`Schema validation failed. Found ${validationResult.errors.length} validation errors.`);
        setValidationErrors(validationResult.errors.slice(0, 50)); // Limit to first 50 errors for display
        setValidationProgress(null);
        return;
      }

      onDevicesLoaded(data);
      setUploadStatus('success');
      setValidationProgress(null);
    } catch (error) {
      setUploadStatus('error');
      setValidationErrors([]);
      setValidationProgress(null);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setErrorMessage('Network error: Please check your internet connection and try again.');
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load data from URL');
      }
    }
  }, [urlInput, onDevicesLoaded]);

  const generateTestData = useCallback(async () => {
    setUploadStatus('loading');
    setErrorMessage('');
    setValidationErrors([]);
    setValidationProgress(null);

    try {
      // Use setTimeout to allow UI to update before heavy computation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const devices = generateTestDevices(testDataCount);
      
      // Validate the generated test data to ensure it meets schema requirements
      const validationResult = validateDeviceData(devices);
      if (!validationResult.isValid) {
        throw new Error(`Generated test data failed validation: ${validationResult.errors.slice(0, 5).join(', ')}`);
      }
      
      onDevicesLoaded(devices);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setValidationErrors([]);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate test data');
    }
  }, [testDataCount, onDevicesLoaded]);

  const processFile = useCallback(async (file: File) => {
    setUploadStatus('loading');
    setErrorMessage('');
    setValidationErrors([]);
    setValidationProgress(null);

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

      // Set validation progress
      setValidationProgress({ current: 0, total: data.length });

      // Comprehensive JSON schema validation
      const validationResult = validateDeviceData(data);
      
      if (!validationResult.isValid) {
        setUploadStatus('error');
        setErrorMessage(`Schema validation failed. Found ${validationResult.errors.length} validation errors.`);
        setValidationErrors(validationResult.errors.slice(0, 50)); // Limit to first 50 errors for display
        setValidationProgress(null);
        return;
      }

      onDevicesLoaded(data);
      setUploadStatus('success');
      setValidationProgress(null);
    } catch (error) {
      setUploadStatus('error');
      setValidationErrors([]);
      setValidationProgress(null);
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
    setValidationErrors([]);
    setValidationProgress(null);
    // Reset URL to default value when clearing
    setUrlInput('https://raw.githubusercontent.com/hossain-khan/android-device-catalog-parser/refs/heads/main/sample/src/main/resources/android-devices-catalog.json');
  }, [onClearDevices]);

  const handleDownloadData = useCallback(() => {
    if (currentDevices && currentDevices.length > 0) {
      const filename = `android-devices-${currentDevices.length}-${new Date().toISOString().split('T')[0]}.json`;
      downloadDevicesAsJson(currentDevices, filename);
    }
  }, [currentDevices]);

  return (
    <div className="space-y-6" data-upload-section>
      {/* Upload Card */}
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
                className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearData}
                className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
              >
                <Trash className="w-4 h-4" />
                Clear
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTabInternal} onValueChange={setActiveTabInternal} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preloaded">Preloaded Data</TabsTrigger>
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="url">Load from URL</TabsTrigger>
          </TabsList>

          <TabsContent value="preloaded" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Full Android Device Catalog
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">22,751</div>
                    <div className="text-sm text-muted-foreground">Total Devices</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">~7.6MB</div>
                    <div className="text-sm text-muted-foreground">Data Size</div>
                  </div>
                </div>
                
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    The full Android Device Catalog has been preloaded automatically when the app started. 
                    This contains the complete dataset of Android devices from Google's official catalog.
                  </AlertDescription>
                </Alert>
                
                {deviceCount > 0 && deviceCount !== 22751 && (
                  <Alert>
                    <Warning className="h-4 w-4" />
                    <AlertDescription>
                      You currently have {deviceCount.toLocaleString()} devices loaded from uploaded data. 
                      Clear the data to use the full preloaded catalog.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
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
                    <Warning className="w-6 h-6 text-destructive" />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                
                <div>
                  <p className="font-medium">
                    {uploadStatus === 'loading' && validationProgress ? 
                      `Validating devices... (${validationProgress.current}/${validationProgress.total})` :
                     uploadStatus === 'loading' ? 'Processing file...' :
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
                    className="mt-2 hover:bg-muted hover:text-foreground"
                    disabled={uploadStatus === 'loading'}
                  >
                    Browse Files
                  </Button>
                </Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="url-input" className="text-sm font-medium">
                  JSON URL
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/devices.json"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={uploadStatus === 'loading'}
                    className="flex-1"
                  />
                  <Button 
                    onClick={loadFromUrl}
                    disabled={uploadStatus === 'loading' || !urlInput.trim()}
                    className="flex items-center gap-2"
                  >
                    {uploadStatus === 'loading' ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    Load
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a URL that returns JSON data with Android device catalog information
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {uploadStatus === 'error' && errorMessage && (
          <Alert variant="destructive">
            <Warning className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>{errorMessage}</p>
                {validationErrors.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-sm mb-2">
                      Validation Errors ({validationErrors.length > 50 ? '50+ errors' : `${validationErrors.length} errors`}):
                    </p>
                    <ScrollArea className="h-40 w-full rounded border p-2 bg-background/50">
                      <div className="space-y-1">
                        {validationErrors.map((error, index) => (
                          <div key={index} className="text-xs font-mono bg-destructive/5 p-1 rounded">
                            {error}
                          </div>
                        ))}
                        {validationErrors.length === 50 && (
                          <div className="text-xs text-muted-foreground italic p-1">
                            ... and more errors. Please fix the above issues and try again.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        <Warning className="w-3 h-3 mr-1" />
                        JSON Schema Validation Failed
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Use "Show JSON Schema" for format reference
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'success' && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Device catalog loaded successfully! You can now browse and filter the devices.</span>
                <Badge variant="outline" className="text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Schema Validated
                </Badge>
              </div>
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
              className="mt-5 hover:bg-muted hover:text-foreground"
            >
              Generate Test Data
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Generate synthetic device data for performance testing (recommended: 20,000+ devices)
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">Expected JSON format:</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSchemaModalOpen(true)}
              className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
            >
              <Code className="w-4 h-4" />
              Show JSON Schema
            </Button>
          </div>
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

        <JsonSchemaModal
          open={schemaModalOpen}
          onOpenChange={setSchemaModalOpen}
        />
      </CardContent>
    </Card>

      {/* Project Showcase Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GithubLogo className="w-5 h-5" />
            Android Device Catalog Parser Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This application uses data from the open-source Android Device Catalog Parser project, 
            which provides comprehensive device specifications from Google's official Device Catalog.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
              <Code className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Kotlin Parser</h4>
                <p className="text-xs text-muted-foreground">
                  Production-ready Kotlin library for parsing Google's Device Catalog
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
              <Database className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">CSV & JSON Data</h4>
                <p className="text-xs text-muted-foreground">
                  Ready-to-use datasets with 20,000+ device specifications
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
              <FileArrowDown className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Always Updated</h4>
                <p className="text-xs text-muted-foreground">
                  Regular updates from Google Play Console Device Catalog
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://github.com/hossain-khan/android-device-catalog-parser', '_blank')}
              className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
            >
              <GithubLogo className="w-4 h-4" />
              View on GitHub
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseLatestDataset}
              className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
            >
              <FileArrowDown className="w-4 h-4" />
              Use Latest Dataset
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">Kotlin</Badge>
            <Badge variant="secondary" className="text-xs">Android</Badge>
            <Badge variant="secondary" className="text-xs">Device Catalog</Badge>
            <Badge variant="secondary" className="text-xs">Open Source</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});