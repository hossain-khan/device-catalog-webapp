import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Database, Code2, FileCode } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { AndroidDevice } from '@/types/device';
import { 
  exportDevices, 
  getExportSizeEstimate, 
  generateExportSummary,
  ExportFormat,
  ExportOptions 
} from '@/lib/exportUtils';

interface DeviceExportPanelProps {
  devices: AndroidDevice[];
  filteredDevices: AndroidDevice[];
  isFiltered: boolean;
}

const formatIcons = {
  json: Database,
  csv: FileText,
  xml: Code2,
  yaml: FileCode
};

const formatDescriptions = {
  json: 'JavaScript Object Notation - Machine readable, preserves all data types',
  csv: 'Comma Separated Values - Spreadsheet compatible, arrays joined with semicolons',
  xml: 'Extensible Markup Language - Structured format with tags',
  yaml: 'YAML Ain\'t Markup Language - Human readable, configuration friendly'
};

export function DeviceExportPanel({ devices, filteredDevices, isFiltered }: DeviceExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exportFiltered, setExportFiltered] = useState(true);
  const [customFilename, setCustomFilename] = useState('');
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const devicesToExport = exportFiltered ? filteredDevices : devices;
  const exportSummary = generateExportSummary(devicesToExport);
  const estimatedSize = getExportSizeEstimate(devicesToExport, exportFormat);

  const handleExport = async () => {
    if (devicesToExport.length === 0) {
      toast.error('No devices to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const options: ExportOptions = {
        format: exportFormat,
        filename: customFilename.trim() || undefined,
        prettyPrint: exportFormat === 'json' ? prettyPrint : undefined
      };

      exportDevices(devicesToExport, options);
      
      toast.success(
        `Successfully exported ${devicesToExport.length} devices as ${exportFormat.toUpperCase()}`,
        {
          description: `File size: ~${estimatedSize}`
        }
      );
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    const IconComponent = formatIcons[format];
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Device Data
          </CardTitle>
          <CardDescription>
            Export device catalog data in various formats for external use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Scope Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Scope</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-filtered"
                  checked={exportFiltered}
                  onCheckedChange={(checked) => setExportFiltered(checked as boolean)}
                />
                <Label htmlFor="export-filtered" className="text-sm">
                  Export filtered devices only ({filteredDevices.length} devices)
                </Label>
                {isFiltered && (
                  <Badge variant="secondary" className="text-xs">
                    Filters Applied
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-all"
                  checked={!exportFiltered}
                  onCheckedChange={(checked) => setExportFiltered(!(checked as boolean))}
                />
                <Label htmlFor="export-all" className="text-sm">
                  Export all devices ({devices.length} devices)
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Format Selection */}
          <div className="space-y-3">
            <Label htmlFor="export-format" className="text-base font-medium">
              Export Format
            </Label>
            <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(formatDescriptions).map(([format, description]) => (
                  <SelectItem key={format} value={format}>
                    <div className="flex items-center gap-2">
                      {getFormatIcon(format as ExportFormat)}
                      <div>
                        <div className="font-medium">{format.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">{description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format-specific Options */}
          {exportFormat === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="pretty-print"
                  checked={prettyPrint}
                  onCheckedChange={(checked) => setPrettyPrint(checked as boolean)}
                />
                <Label htmlFor="pretty-print" className="text-sm">
                  Pretty print JSON (human readable formatting)
                </Label>
              </div>
            </div>
          )}

          {/* Custom Filename */}
          <div className="space-y-2">
            <Label htmlFor="custom-filename" className="text-base font-medium">
              Custom Filename (Optional)
            </Label>
            <Input
              id="custom-filename"
              placeholder={`android-devices-${new Date().toISOString().slice(0, 10)}.${exportFormat}`}
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use auto-generated filename with timestamp
            </p>
          </div>

          <Separator />

          {/* Export Summary */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Summary</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Devices</div>
                <div className="font-medium">{exportSummary.totalDevices.toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Manufacturers</div>
                <div className="font-medium">{exportSummary.uniqueManufacturers}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Form Factors</div>
                <div className="font-medium">{exportSummary.uniqueFormFactors}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Est. Size</div>
                <div className="font-medium">{estimatedSize}</div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport}
            disabled={isExporting || devicesToExport.length === 0}
            className="w-full"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : `Export ${devicesToExport.length} Devices as ${exportFormat.toUpperCase()}`}
          </Button>

          {devicesToExport.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No devices available for export. Adjust your filters to include devices.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Export Formats Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Format Guide</CardTitle>
          <CardDescription>
            Choose the right format for your use case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(formatDescriptions).map(([format, description]) => (
              <div key={format} className="flex gap-3 p-3 rounded-lg border bg-card/50">
                <div className="flex-shrink-0 mt-0.5">
                  {getFormatIcon(format as ExportFormat)}
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{format.toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                  <div className="text-xs text-muted-foreground">
                    {format === 'json' && 'Best for: APIs, databases, web applications'}
                    {format === 'csv' && 'Best for: Spreadsheets, data analysis, Excel/Google Sheets'}
                    {format === 'xml' && 'Best for: Legacy systems, SOAP services, structured documents'}
                    {format === 'yaml' && 'Best for: Configuration files, documentation, human editing'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}