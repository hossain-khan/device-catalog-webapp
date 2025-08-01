import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Database, Code2, FileCode } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { AndroidDevice } from '@/types/device';
import { exportDevices, ExportFormat } from '@/lib/exportUtils';

interface QuickExportProps {
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

export function QuickExport({ devices, filteredDevices, isFiltered }: QuickExportProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exportFiltered, setExportFiltered] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const devicesToExport = exportFiltered ? filteredDevices : devices;

  const handleExport = async () => {
    if (devicesToExport.length === 0) {
      toast.error('No devices to export');
      return;
    }

    setIsExporting(true);
    
    try {
      exportDevices(devicesToExport, {
        format: exportFormat,
        prettyPrint: exportFormat === 'json'
      });
      
      toast.success(
        `Successfully exported ${devicesToExport.length} devices as ${exportFormat.toUpperCase()}`
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
    <Card className="bg-muted/30">
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
            <div className="text-sm font-medium">Quick Export:</div>
            
            <div className="flex gap-2 items-center">
              <Button
                variant={exportFiltered ? "default" : "outline"}
                size="sm"
                onClick={() => setExportFiltered(true)}
                disabled={!isFiltered}
                className="text-xs"
              >
                Filtered ({filteredDevices.length})
              </Button>
              <Button
                variant={!exportFiltered ? "default" : "outline"}
                size="sm"
                onClick={() => setExportFiltered(false)}
                className="text-xs"
              >
                All ({devices.length})
              </Button>
            </div>

            <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(formatIcons).map((format) => (
                  <SelectItem key={format} value={format}>
                    <div className="flex items-center gap-2">
                      {getFormatIcon(format as ExportFormat)}
                      {format.toUpperCase()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleExport}
            disabled={isExporting || devicesToExport.length === 0}
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}