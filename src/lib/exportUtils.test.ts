import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  convertToCSV,
  convertToXML,
  convertToYAML,
  exportDevices,
  getExportSizeEstimate,
  generateExportSummary,
  ExportOptions,
  ExportFormat,
} from './exportUtils';
import { AndroidDevice } from '@/types/device';

const mockDevices: AndroidDevice[] = [
  {
    brand: 'Google',
    device: 'Pixel 6',
    manufacturer: 'Google',
    modelName: 'Pixel 6',
    ram: '8 GB',
    formFactor: 'Phone',
    processorName: 'Tensor',
    gpu: 'Mali-G78 MP20',
    screenSizes: [6.4],
    screenDensities: [411],
    abis: ['arm64-v8a', 'armeabi-v7a'],
    sdkVersions: [31, 32],
    openGlEsVersions: ['3.2'],
  },
  {
    brand: 'Samsung',
    device: 'Galaxy S21',
    manufacturer: 'Samsung',
    modelName: 'SM-G991U',
    ram: '8 GB',
    formFactor: 'Phone',
    processorName: 'Snapdragon 888',
    gpu: 'Adreno 660',
    screenSizes: [6.2],
    screenDensities: [421],
    abis: ['arm64-v8a'],
    sdkVersions: [30, 31],
    openGlEsVersions: ['3.2'],
  },
];

describe('exportUtils', () => {
  describe('convertToCSV', () => {
    it('should return an empty string for no devices', () => {
      expect(convertToCSV([])).toBe('');
    });

    it('should convert a list of devices to CSV format', () => {
      const csv = convertToCSV(mockDevices);
      const rows = csv.split('\n');
      expect(rows).toHaveLength(3);
      expect(rows[0]).toBe('brand,device,manufacturer,modelName,ram,formFactor,processorName,gpu,screenSizes,screenDensities,abis,sdkVersions,openGlEsVersions');
      expect(rows[1]).toContain('Google,Pixel 6');
      expect(rows[1]).toContain('"6.4"');
      expect(rows[1]).toContain('"arm64-v8a;armeabi-v7a"');
      expect(rows[2]).toContain('Samsung,Galaxy S21');
    });

    it('should handle values with commas', () => {
        const deviceWithComma: AndroidDevice[] = [{
            ...mockDevices[0],
            modelName: 'Pixel 6, Pro'
        }];
        const csv = convertToCSV(deviceWithComma);
        expect(csv).toContain('"Pixel 6, Pro"');
    });
  });

  describe('convertToXML', () => {
    it('should generate correct XML for devices', () => {
      const xml = convertToXML(mockDevices);
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<androidDevices>');
      expect(xml).toContain('</androidDevices>');
      expect(xml).toContain('<device>');
      expect(xml).toContain('<brand>Google</brand>');
      expect(xml).toContain('<sdkVersions>');
      expect(xml).toContain('<item>31</item>');
      expect(xml).toContain('<item>32</item>');
    });
  });

  describe('convertToYAML', () => {
    it('should generate correct YAML for devices', () => {
      const yaml = convertToYAML(mockDevices);
      expect(yaml).toContain('- # Device 1');
      expect(yaml).toContain('  brand: Google');
      expect(yaml).toContain('  sdkVersions:');
      expect(yaml).toContain('    - 31');
      expect(yaml).toContain('    - 32');
      expect(yaml).toContain('- # Device 2');
    });
  });

  describe('exportDevices', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:url'),
        revokeObjectURL: vi.fn(),
      });
      const link = {
        href: '',
        download: '',
        style: { display: 'none' },
        click: vi.fn(),
      };
      vi.stubGlobal('document', {
        createElement: vi.fn(() => link),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn((child) => {
            if (child !== link) {
              throw new Error("Attempting to remove wrong element");
            }
          }),
        },
      });
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it('should call download with JSON format and cleanup', () => {
      const options: ExportOptions = { format: 'json', prettyPrint: true };
      exportDevices(mockDevices, options);
      expect(document.body.appendChild).toHaveBeenCalled();
      vi.runAllTimers();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should call download with CSV format and cleanup', () => {
        const options: ExportOptions = { format: 'csv' };
        exportDevices(mockDevices, options);
        expect(document.body.appendChild).toHaveBeenCalled();
        vi.runAllTimers();
        expect(document.body.removeChild).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should call download with XML format and cleanup', () => {
        const options: ExportOptions = { format: 'xml' };
        exportDevices(mockDevices, options);
        expect(document.body.appendChild).toHaveBeenCalled();
        vi.runAllTimers();
        expect(document.body.removeChild).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should call download with YAML format and cleanup', () => {
        const options: ExportOptions = { format: 'yaml' };
        exportDevices(mockDevices, options);
        expect(document.body.appendChild).toHaveBeenCalled();
        vi.runAllTimers();
        expect(document.body.removeChild).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should throw error for unsupported format', () => {
        const options = { format: 'txt' as ExportFormat };
        expect(() => exportDevices(mockDevices, options)).toThrow('Unsupported export format: txt');
    });
  });

  describe('getExportSizeEstimate', () => {
    it('should return "0 B" for no devices', () => {
      expect(getExportSizeEstimate([], 'json')).toBe('0 B');
    });

    it('should return size estimates for different formats', () => {
      expect(getExportSizeEstimate(mockDevices, 'json')).not.toBe('0 B');
      expect(getExportSizeEstimate(mockDevices, 'csv')).not.toBe('0 B');
      expect(getExportSizeEstimate(mockDevices, 'xml')).not.toBe('0 B');
      expect(getExportSizeEstimate(mockDevices, 'yaml')).not.toBe('0 B');
    });
  });

  describe('generateExportSummary', () => {
    it('should generate a correct summary', () => {
      const summary = generateExportSummary(mockDevices);
      expect(summary.totalDevices).toBe(2);
      expect(summary.uniqueManufacturers).toBe(2);
      expect(summary.uniqueFormFactors).toBe(1);
      expect(summary.sdkVersionRange).toBe('30 - 32');
      expect(summary.exportDate).toBeDefined();
    });

    it('should handle empty device array', () => {
        const summary = generateExportSummary([]);
        expect(summary.totalDevices).toBe(0);
        expect(summary.uniqueManufacturers).toBe(0);
        expect(summary.sdkVersionRange).toBe('N/A');
    });
  });
});
