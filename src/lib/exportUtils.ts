import { AndroidDevice } from '@/types/device';

export type ExportFormat = 'json' | 'csv' | 'xml' | 'yaml';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  prettyPrint?: boolean;
}

/**
 * Convert array of objects to CSV format
 */
export function convertToCSV(devices: AndroidDevice[]): string {
  if (devices.length === 0) return '';

  // Define headers
  const headers = [
    'brand',
    'device',
    'manufacturer',
    'modelName',
    'ram',
    'formFactor',
    'processorName',
    'gpu',
    'screenSizes',
    'screenDensities',
    'abis',
    'sdkVersions',
    'openGlEsVersions'
  ];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...devices.map(device => 
      headers.map(header => {
        const value = device[header as keyof AndroidDevice];
        
        // Handle arrays by joining with semicolons
        if (Array.isArray(value)) {
          return `"${value.join(';')}"`;
        }
        
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
}

/**
 * Convert array of objects to XML format
 */
export function convertToXML(devices: AndroidDevice[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const rootStart = '<androidDevices>\n';
  const rootEnd = '</androidDevices>';

  const deviceXml = devices.map(device => {
    const deviceStart = '  <device>\n';
    const deviceEnd = '  </device>\n';
    
    const fields = Object.entries(device).map(([key, value]) => {
      if (Array.isArray(value)) {
        const items = value.map(item => 
          `      <item>${escapeXml(String(item))}</item>\n`
        ).join('');
        return `    <${key}>\n${items}    </${key}>\n`;
      }
      return `    <${key}>${escapeXml(String(value))}</${key}>\n`;
    }).join('');

    return deviceStart + fields + deviceEnd;
  }).join('');

  return xmlHeader + rootStart + deviceXml + rootEnd;
}

/**
 * Convert array of objects to YAML format
 */
export function convertToYAML(devices: AndroidDevice[]): string {
  const yamlContent = devices.map((device, index) => {
    const deviceYaml = Object.entries(device).map(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return `  ${key}: []`;
        }
        const items = value.map(item => `    - ${yamlEscapeValue(item)}`).join('\n');
        return `  ${key}:\n${items}`;
      }
      return `  ${key}: ${yamlEscapeValue(value)}`;
    }).join('\n');

    return `- # Device ${index + 1}\n${deviceYaml}`;
  }).join('\n');

  return yamlContent;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escape YAML values properly
 */
function yamlEscapeValue(value: unknown): string {
  const stringValue = String(value);
  
  // If contains special characters, quotes, or starts with special chars, quote it
  if (
    stringValue.includes(':') ||
    stringValue.includes('#') ||
    stringValue.includes('[') ||
    stringValue.includes(']') ||
    stringValue.includes('{') ||
    stringValue.includes('}') ||
    stringValue.includes(',') ||
    stringValue.includes('|') ||
    stringValue.includes('>') ||
    stringValue.includes('!') ||
    stringValue.includes('%') ||
    stringValue.includes('@') ||
    stringValue.includes('`') ||
    stringValue.includes('"') ||
    stringValue.includes("'") ||
    /^\s/.test(stringValue) ||
    /\s$/.test(stringValue) ||
    /^[-?:,[\]{}#&*!|>'"%@`]/.test(stringValue)
  ) {
    return `"${stringValue.replace(/"/g, '\\"')}"`;
  }
  
  return stringValue;
}

/**
 * Export devices in the specified format
 */
export function exportDevices(devices: AndroidDevice[], options: ExportOptions): void {
  let content: string;
  let mimeType: string;
  let fileExtension: string;

  switch (options.format) {
    case 'json':
      content = JSON.stringify(devices, null, options.prettyPrint ? 2 : 0);
      mimeType = 'application/json';
      fileExtension = 'json';
      break;
    case 'csv':
      content = convertToCSV(devices);
      mimeType = 'text/csv';
      fileExtension = 'csv';
      break;
    case 'xml':
      content = convertToXML(devices);
      mimeType = 'application/xml';
      fileExtension = 'xml';
      break;
    case 'yaml':
      content = convertToYAML(devices);
      mimeType = 'text/yaml';
      fileExtension = 'yaml';
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const filename = options.filename || `android-devices-${timestamp}.${fileExtension}`;

  // Create and trigger download
  downloadFile(content, filename, mimeType);
}

/**
 * Trigger file download in the browser
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Get file size estimation for export preview
 */
export function getExportSizeEstimate(devices: AndroidDevice[], format: ExportFormat): string {
  if (devices.length === 0) return '0 B';

  let estimatedSize: number;
  
  // Rough estimation based on average device data size
  const avgDeviceJsonSize = 400; // Average bytes per device in JSON
  
  switch (format) {
    case 'json':
      estimatedSize = devices.length * avgDeviceJsonSize;
      break;
    case 'csv':
      estimatedSize = devices.length * 200; // CSV is more compact
      break;
    case 'xml':
      estimatedSize = devices.length * 600; // XML has more overhead
      break;
    case 'yaml':
      estimatedSize = devices.length * 350; // YAML is relatively compact
      break;
    default:
      estimatedSize = devices.length * avgDeviceJsonSize;
  }
  
  return formatFileSize(estimatedSize);
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Generate export summary statistics
 */
export function generateExportSummary(devices: AndroidDevice[]) {
  const manufacturers = new Set(devices.map(d => d.manufacturer));
  const formFactors = new Set(devices.map(d => d.formFactor));
  const sdkVersions = new Set(devices.flatMap(d => d.sdkVersions));
  
  return {
    totalDevices: devices.length,
    uniqueManufacturers: manufacturers.size,
    uniqueFormFactors: formFactors.size,
    sdkVersionRange: sdkVersions.size > 0 ? 
      `${Math.min(...sdkVersions)} - ${Math.max(...sdkVersions)}` : 'N/A',
    exportDate: new Date().toISOString()
  };
}