import { describe, it, expect } from 'vitest';
import {
  parseRamValue,
  formatRam,
  getUniqueManufacturers,
  getUniqueFormFactors,
  getUniqueSdkVersions,
  getRamRange,
  getSdkVersionRange,
  filterDevices,
} from './deviceUtils';
import { AndroidDevice } from '@/types/device';

describe('deviceUtils', () => {
  describe('parseRamValue', () => {
    it('should parse RAM value from string', () => {
      expect(parseRamValue('2048MB')).toBe(2048);
      expect(parseRamValue('4GB')).toBe(4);
      expect(parseRamValue('128GB')).toBe(128);
    });

    it('should return 0 for invalid RAM string', () => {
      expect(parseRamValue('N/A')).toBe(0);
      expect(parseRamValue('')).toBe(0);
    });
  });

  describe('formatRam', () => {
    it('should format RAM value to GB if >= 1024MB', () => {
      expect(formatRam('2048MB')).toBe('2GB');
      expect(formatRam('4096MB')).toBe('4GB');
    });

    it('should format RAM value to MB if < 1024MB', () => {
      expect(formatRam('512MB')).toBe('512MB');
    });
  });

  const mockDevices: AndroidDevice[] = [
    { manufacturer: 'Samsung', formFactor: 'Phone', sdkVersions: [28, 29], ram: '4096MB', modelName: 'Galaxy S10', brand: 'Samsung', device: 's10', processorName: 'Exynos', abis: [], screenSizes: [], openGlEsVersions: [], gpu: '' },
    { manufacturer: 'Google', formFactor: 'Phone', sdkVersions: [30, 31], ram: '8192MB', modelName: 'Pixel 6', brand: 'Google', device: 'pixel6', processorName: 'Tensor', abis: [], screenSizes: [], openGlEsVersions: [], gpu: '' },
    { manufacturer: 'Samsung', formFactor: 'Tablet', sdkVersions: [29, 30], ram: '6144MB', modelName: 'Galaxy Tab S7', brand: 'Samsung', device: 'tabs7', processorName: 'Snapdragon', abis: [], screenSizes: [], openGlEsVersions: [], gpu: '' },
  ];

  describe('getUniqueManufacturers', () => {
    it('should return unique manufacturers sorted alphabetically', () => {
      expect(getUniqueManufacturers(mockDevices)).toEqual(['Google', 'Samsung']);
    });
  });

  describe('getUniqueFormFactors', () => {
    it('should return unique form factors sorted alphabetically', () => {
      expect(getUniqueFormFactors(mockDevices)).toEqual(['Phone', 'Tablet']);
    });
  });

  describe('getUniqueSdkVersions', () => {
    it('should return unique SDK versions sorted in descending order', () => {
      expect(getUniqueSdkVersions(mockDevices)).toEqual([31, 30, 29, 28]);
    });
  });

  describe('getRamRange', () => {
    it('should return the min and max RAM values', () => {
      expect(getRamRange(mockDevices)).toEqual([4096, 8192]);
    });
  });

  describe('getSdkVersionRange', () => {
    it('should return the min and max SDK versions', () => {
      expect(getSdkVersionRange(mockDevices)).toEqual([28, 31]);
    });
  });

  describe('filterDevices', () => {
    it('should filter by search term', () => {
      const filtered = filterDevices(mockDevices, { search: 'pixel' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].modelName).toBe('Pixel 6');
    });

    it('should filter by manufacturer', () => {
      const filtered = filterDevices(mockDevices, { manufacturer: 'Samsung' });
      expect(filtered.length).toBe(2);
    });

    it('should filter by form factor', () => {
      const filtered = filterDevices(mockDevices, { formFactor: 'Tablet' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].modelName).toBe('Galaxy Tab S7');
    });

    it('should filter by RAM range', () => {
      const filtered = filterDevices(mockDevices, { ramRange: [6000, 9000] });
      expect(filtered.length).toBe(2);
    });

    it('should filter by SDK version range', () => {
        const filtered = filterDevices(mockDevices, { sdkVersionRange: [30, 31] });
        expect(filtered.length).toBe(2);
      });
  });
});
