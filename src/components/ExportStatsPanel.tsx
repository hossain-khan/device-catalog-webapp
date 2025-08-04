import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Database, Table, Code, FileText } from '@phosphor-icons/react';
import { AndroidDevice } from '@/types/device';
import { getExportSizeEstimate, generateExportSummary, ExportFormat } from '@/lib/exportUtils';

interface ExportStatsPanelProps {
  devices: AndroidDevice[];
}

const formatIcons = {
  json: Database,      // Database icon for JSON (data storage)
  csv: Table,          // Table icon for CSV (spreadsheet data)
  xml: Code,           // Code icon for XML (markup language)
  yaml: FileText       // FileText icon for YAML (configuration files)
};

const formatDescriptions = {
  json: 'JSON format for APIs and databases',
  csv: 'CSV format for spreadsheets and analysis',
  xml: 'XML format for legacy systems',
  yaml: 'YAML format for configuration files'
};

export function ExportStatsPanel({ devices }: ExportStatsPanelProps) {
  const summary = generateExportSummary(devices);
  
  const formats: ExportFormat[] = ['json', 'csv', 'xml', 'yaml'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Statistics
        </CardTitle>
        <CardDescription>
          Dataset overview and export size estimates for current catalog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dataset Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.totalDevices.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Devices</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.uniqueManufacturers}</div>
            <div className="text-sm text-muted-foreground">Manufacturers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.uniqueFormFactors}</div>
            <div className="text-sm text-muted-foreground">Form Factors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.sdkVersionRange}</div>
            <div className="text-sm text-muted-foreground">SDK Range</div>
          </div>
        </div>

        {/* Export Size Estimates */}
        <div className="space-y-3">
          <h3 className="font-medium">Export Size Estimates</h3>
          <div className="grid gap-3">
            {formats.map((format) => {
              const IconComponent = formatIcons[format];
              const size = getExportSizeEstimate(devices, format);
              
              return (
                <div key={format} className="flex items-start justify-between p-3 rounded-lg border bg-card/50">
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-4 h-4 text-primary mt-1" />
                    <div className="text-left">
                      <div className="font-medium">{format.toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDescriptions[format]}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {size}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Notes */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">Export Notes:</div>
          <ul className="space-y-1 list-disc list-inside">
            <li>Size estimates are approximate and may vary based on content</li>
            <li>JSON exports can be pretty-printed for readability (increases size)</li>
            <li>CSV exports join arrays with semicolons for spreadsheet compatibility</li>
            <li>XML and YAML formats include additional markup overhead</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}