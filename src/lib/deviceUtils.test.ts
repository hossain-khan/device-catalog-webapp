import { describe, it, expect } from 'vitest';
import {
  filterDevices,
  parseRamValue,
  formatRam,
  calculateDeviceStats,
  getUniqueManufacturers,
  getUniqueFormFactors,
  getUniqueSdkVersions,
  getRamRange,
  getSdkVersionRange,
  scrollToTop
} from '@/lib/deviceUtils';
import type { AndroidDevice, DeviceFilters } from '@/types/device';

// Mock test data
const mockDevices: AndroidDevice[] = [
  {
    brand: 'Google',
    device: 'pixel_8',
    manufacturer: 'Google',
    modelName: 'Pixel 8',
    ram: '8192MB',
    formFactor: 'phone',
    processorName: 'Google Tensor G3',
    gpu: 'Mali-G715 MC10',
    screenSizes: ['1080x2400'],
    screenDensities: [420],
    abis: ['arm64-v8a', 'armeabi-v7a'],
    sdkVersions: [33, 34],
    openGlEsVersions: ['3.2']
  },
  {
    brand: 'Samsung',
    device: 'galaxy_s23',
    manufacturer: 'Samsung',
    modelName: 'Galaxy S23',
    ram: '8192MB',
    formFactor: 'phone',
    processorName: 'Qualcomm Snapdragon 8 Gen 2',
    gpu: 'Adreno 740',
    screenSizes: ['1080x2340'],
    screenDensities: [425],
    abis: ['arm64-v8a', 'armeabi-v7a'],
    sdkVersions: [33, 34],
    openGlEsVersions: ['3.2']
  },
  {
    brand: 'Apple',
    device: 'ipad_air',
    manufacturer: 'Apple',
    modelName: 'iPad Air',
    ram: '4096MB',
    formFactor: 'tablet',
    processorName: 'Apple A14 Bionic',
    gpu: 'Apple GPU',
    screenSizes: ['2360x1640'],
    screenDensities: [264],
    abis: ['arm64-v8a'],
    sdkVersions: [29, 30, 31],
    openGlEsVersions: ['3.0']
  },
  {
    brand: 'Xiaomi',
    device: 'redmi_note_12',
    manufacturer: 'Xiaomi',
    modelName: 'Redmi Note 12',
    ram: '4096MB',
    formFactor: 'phone',
    processorName: 'MediaTek Dimensity 1080',
    gpu: 'Mali-G68 MC4',
    screenSizes: ['1080x2400'],
    screenDensities: [395],
    abis: ['arm64-v8a', 'armeabi-v7a'],
    sdkVersions: [32, 33],
    openGlEsVersions: ['3.2']
  }
];

describe('deviceUtils', () => {
  describe('parseRamValue', () => {
    it('should parse RAM values correctly', () => {
      expect(parseRamValue('8192MB')).toBe(8192);
      expect(parseRamValue('4096MB')).toBe(4096);
      expect(parseRamValue('1024MB')).toBe(1024);
      expect(parseRamValue('512MB')).toBe(512);
    });

    it('should handle invalid RAM values', () => {
      expect(parseRamValue('invalid')).toBe(0);
      expect(parseRamValue('')).toBe(0);
      expect(parseRamValue('MB')).toBe(0);
    });

    it('should extract numbers from complex RAM strings', () => {
      expect(parseRamValue('8GB (8192MB)')).toBe(8);
      expect(parseRamValue('RAM: 4096MB')).toBe(4096);
    });
  });

  describe('formatRam', () => {
    it('should format RAM in MB for values under 1GB', () => {
      expect(formatRam('512MB')).toBe('512MB');
      expect(formatRam('256MB')).toBe('256MB');
    });

    it('should format RAM in GB for values 1GB and above', () => {
      expect(formatRam('1024MB')).toBe('1GB');
      expect(formatRam('2048MB')).toBe('2GB');
      expect(formatRam('4096MB')).toBe('4GB');
      expect(formatRam('8192MB')).toBe('8GB');
    });

    it('should round up GB values', () => {
      expect(formatRam('1536MB')).toBe('2GB'); // 1.5GB rounds up to 2GB
      expect(formatRam('3072MB')).toBe('3GB'); // 3GB exactly
    });
  });

  describe('filterDevices', () => {
    it('should return all devices when no filters are applied', () => {
      const filters: DeviceFilters = {
        search: '',
        formFactor: 'all',
        manufacturer: 'all',
        manufacturers: [],
        minRam: 'all',
        sdkVersion: 'all',
        ramRange: [0, 16384],
        sdkVersionRange: [1, 35]
      };

      const result = filterDevices(mockDevices, filters);
      expect(result).toEqual(mockDevices);
    });

    it('should filter by search term', () => {
      const filters: DeviceFilters = {
        search: 'pixel',
        formFactor: 'all',
        manufacturer: 'all',
        manufacturers: [],
        minRam: 'all',
        sdkVersion: 'all',
        ramRange: [0, 16384],
        sdkVersionRange: [1, 35]
      };

      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(1);
      expect(result[0].modelName).toBe('Pixel 8');
    });

    it('should filter by form factor', () => {
      const filters: DeviceFilters = {
        search: '',
        formFactor: 'tablet',
        manufacturer: 'all',
        manufacturers: [],
        minRam: 'all',
        sdkVersion: 'all',
        ramRange: [0, 16384],
        sdkVersionRange: [1, 35]
      };

      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(1);
      expect(result[0].formFactor).toBe('tablet');
    });

    it('should filter by manufacturer', () => {
      const filters: DeviceFilters = {
        search: '',
        formFactor: 'all',
        manufacturer: 'Samsung',
        manufacturers: [],
        minRam: 'all',
        sdkVersion: 'all',
        ramRange: [0, 16384],
        sdkVersionRange: [1, 35]
      };

      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(1);
      expect(result[0].manufacturer).toBe('Samsung');
    });

    it('should filter by multiple manufacturers', () => {
      const filters: DeviceFilters = {
        search: '',
        formFactor: 'all',
        manufacturer: 'all',
        manufacturers: ['Google', 'Samsung'],
        minRam: 'all',
        sdkVersion: 'all',
        ramRange: [0, 16384],
        sdkVersionRange: [1, 35]
      };

      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(2);
      expect(result.map(d => d.manufacturer)).toEqual(['Google', 'Samsung']);
    });

    it('should filter by RAM range', () => {
      const filters: DeviceFilters = {
        search: '',
        formFactor: 'all',
        manufacturer: 'all',
        manufacturers: [],
        minRam: 'all',
        sdkVersion: 'all',
        ramRange: [6000, 10000], // Only 8GB devices
        sdkVersionRange: [1, 35]
      };

      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(2);
      expect(result.every(d => parseRamValue(d.ram) >= 6000)).toBe(true);
    });

    it('should filter by SDK version range', () => {
      const filters: DeviceFilters = {
        search: '',
        formFactor: 'all',
        manufacturer: 'all',
        manufacturers: [],
        minRam: 'all',
        sdkVersion: 'all',
        ramRange: [0, 16384],
        sdkVersionRange: [34, 35] // Only devices with SDK 34+
      };

      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(2); // Google Pixel 8 and Samsung Galaxy S23
    });

    it('should combine multiple filters', () => {
      const filters: DeviceFilters = {
        search: '',
        formFactor: 'phone',
        manufacturer: 'all',
        manufacturers: ['Google', 'Samsung'],
        minRam: 'all',
        sdkVersion: 'all',
        ramRange: [6000, 10000],
        sdkVersionRange: [33, 35]
      };

      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(2);
      expect(result.every(d => d.formFactor === 'phone')).toBe(true);
      expect(result.every(d => ['Google', 'Samsung'].includes(d.manufacturer))).toBe(true);
    });
  });

  describe('calculateDeviceStats', () => {
    it('should calculate basic stats correctly', () => {
      const stats = calculateDeviceStats(mockDevices);

      expect(stats.totalDevices).toBe(4);
      expect(stats.manufacturerCounts).toEqual({
        'Google': 1,
        'Samsung': 1,
        'Apple': 1,
        'Xiaomi': 1
      });
      expect(stats.formFactorCounts).toEqual({
        'phone': 3,
        'tablet': 1
      });
    });

    it('should categorize RAM ranges correctly', () => {
      const stats = calculateDeviceStats(mockDevices);

      expect(stats.ramRanges['4-8GB']).toBe(2); // iPad Air and Redmi Note 12
      expect(stats.ramRanges['8-12GB']).toBe(2); // Pixel 8 and Galaxy S23
    });

    it('should count architecture support', () => {
      const stats = calculateDeviceStats(mockDevices);

      expect(stats.arm64SupportCount).toBe(4); // All devices have arm64-v8a
      expect(stats.multiAbiDeviceCount).toBe(3); // Three devices have multiple ABIs
    });

    it('should categorize platform compatibility', () => {
      const stats = calculateDeviceStats(mockDevices);

      expect(stats.platformCompatibility.recent).toBeGreaterThan(0); // SDK 31-33
      expect(stats.platformCompatibility.latest).toBeGreaterThan(0); // SDK 34+
    });

    it('should count performance tiers', () => {
      const stats = calculateDeviceStats(mockDevices);

      expect(stats.performanceTierCounts.midRange).toBe(2); // 4GB devices
      expect(stats.performanceTierCounts.premium).toBe(2); // 8GB devices
    });

    it('should handle empty device array', () => {
      const stats = calculateDeviceStats([]);

      expect(stats.totalDevices).toBe(0);
      expect(stats.manufacturerCounts).toEqual({});
      expect(stats.formFactorCounts).toEqual({});
      expect(stats.averageSdkRange).toBe(0);
    });
  });

  describe('getUniqueManufacturers', () => {
    it('should return sorted unique manufacturers', () => {
      const manufacturers = getUniqueManufacturers(mockDevices);
      expect(manufacturers).toEqual(['Apple', 'Google', 'Samsung', 'Xiaomi']);
    });

    it('should handle empty array', () => {
      expect(getUniqueManufacturers([])).toEqual([]);
    });

    it('should handle duplicate manufacturers', () => {
      const duplicateDevices = [...mockDevices, mockDevices[0]];
      const manufacturers = getUniqueManufacturers(duplicateDevices);
      expect(manufacturers).toEqual(['Apple', 'Google', 'Samsung', 'Xiaomi']);
    });
  });

  describe('getUniqueFormFactors', () => {
    it('should return sorted unique form factors', () => {
      const formFactors = getUniqueFormFactors(mockDevices);
      expect(formFactors).toEqual(['phone', 'tablet']);
    });

    it('should handle empty array', () => {
      expect(getUniqueFormFactors([])).toEqual([]);
    });
  });

  describe('getUniqueSdkVersions', () => {
    it('should return sorted unique SDK versions in descending order', () => {
      const sdkVersions = getUniqueSdkVersions(mockDevices);
      expect(sdkVersions).toEqual([34, 33, 32, 31, 30, 29]);
    });

    it('should handle empty array', () => {
      expect(getUniqueSdkVersions([])).toEqual([]);
    });
  });

  describe('getRamRange', () => {
    it('should return min and max RAM values', () => {
      const [min, max] = getRamRange(mockDevices);
      expect(min).toBe(4096); // iPad Air and Redmi Note 12
      expect(max).toBe(8192); // Pixel 8 and Galaxy S23
    });

    it('should handle single device', () => {
      const [min, max] = getRamRange([mockDevices[0]]);
      expect(min).toBe(8192);
      expect(max).toBe(8192);
    });

    it('should handle empty array gracefully', () => {
      const [min, max] = getRamRange([]);
      expect(min).toBe(Infinity);
      expect(max).toBe(-Infinity);
    });
  });

  describe('getSdkVersionRange', () => {
    it('should return min and max SDK versions', () => {
      const [min, max] = getSdkVersionRange(mockDevices);
      expect(min).toBe(29); // From iPad Air
      expect(max).toBe(34); // From Pixel 8 and Galaxy S23
    });

    it('should handle single device', () => {
      const [min, max] = getSdkVersionRange([mockDevices[0]]);
      expect(min).toBe(33);
      expect(max).toBe(34);
    });

    it('should handle empty array gracefully', () => {
      const [min, max] = getSdkVersionRange([]);
      expect(min).toBe(Infinity);
      expect(max).toBe(-Infinity);
    });
  });

  describe('scrollToTop', () => {
    it('should call window.scrollTo with smooth behavior', () => {
      // Mock is already set up in test setup
      scrollToTop();
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
});