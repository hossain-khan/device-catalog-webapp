import { describe, it, expect } from 'vitest';
import {
  validateDeviceData,
  sanitizeDeviceData,
  getAndroidDeviceJsonSchema
} from '@/lib/deviceValidation';
import type { AndroidDevice } from '@/types/device';

describe('deviceValidation', () => {
  const validDevice: AndroidDevice = {
    brand: 'Google',
    device: 'pixel_8',
    manufacturer: 'Google',
    modelName: 'Pixel 8',
    ram: '8192MB',
    formFactor: 'Phone',
    processorName: 'Google Tensor G3',
    gpu: 'Mali-G715 MC10',
    screenSizes: ['1080x2400'],
    screenDensities: [420],
    abis: ['arm64-v8a', 'armeabi-v7a'],
    sdkVersions: [33, 34],
    openGlEsVersions: ['3.2']
  };

  const validDeviceArray: AndroidDevice[] = [validDevice];

  describe('validateDeviceData', () => {
    it('should validate correct device data', () => {
      const result = validateDeviceData(validDeviceArray);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate empty array', () => {
      const result = validateDeviceData([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject non-array input', () => {
      const result = validateDeviceData(validDevice); // Single object instead of array
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject null or undefined input', () => {
      const nullResult = validateDeviceData(null);
      expect(nullResult.isValid).toBe(false);
      
      const undefinedResult = validateDeviceData(undefined);
      expect(undefinedResult.isValid).toBe(false);
    });

    it('should reject device with missing required fields', () => {
      const incompleteDevice = {
        brand: 'Google',
        // Missing other required fields
      };
      
      const result = validateDeviceData([incompleteDevice]);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('device'))).toBe(true);
      expect(result.errors.some(error => error.includes('manufacturer'))).toBe(true);
    });

    it('should reject device with invalid form factor', () => {
      const invalidDevice = {
        ...validDevice,
        formFactor: 'InvalidFormFactor'
      };
      
      const result = validateDeviceData([invalidDevice]);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid option'))).toBe(true);
    });

    it('should reject device with invalid screen size format', () => {
      const invalidDevice = {
        ...validDevice,
        screenSizes: ['1080-2400'] // Invalid format, should be 1080x2400
      };
      
      const result = validateDeviceData([invalidDevice]);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Screen size'))).toBe(true);
    });

    it('should reject device with invalid OpenGL ES version format', () => {
      const invalidDevice = {
        ...validDevice,
        openGlEsVersions: ['3.2.1'] // Invalid format, should be X.Y
      };
      
      const result = validateDeviceData([invalidDevice]);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('OpenGL ES version'))).toBe(true);
    });

    it('should reject device with negative screen density', () => {
      const invalidDevice = {
        ...validDevice,
        screenDensities: [-420] // Invalid, should be positive
      };
      
      const result = validateDeviceData([invalidDevice]);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Screen density'))).toBe(true);
    });

    it('should reject device with negative SDK version', () => {
      const invalidDevice = {
        ...validDevice,
        sdkVersions: [-1, 33] // Invalid, should be positive
      };
      
      const result = validateDeviceData([invalidDevice]);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('SDK version'))).toBe(true);
    });

    it('should reject device with empty arrays where items are required', () => {
      const invalidDevice = {
        ...validDevice,
        screenSizes: [], // Empty array not allowed
        abis: [], // Empty array not allowed
        sdkVersions: [] // Empty array not allowed
      };
      
      const result = validateDeviceData([invalidDevice]);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('screen size'))).toBe(true);
      expect(result.errors.some(error => error.includes('ABI'))).toBe(true);
      expect(result.errors.some(error => error.includes('SDK version'))).toBe(true);
    });

    it('should validate all valid form factors', () => {
      const validFormFactors = [
        'Phone', 'TV', 'Tablet', 'Android Automotive', 
        'Chromebook', 'Wearable', 'Google Play Games on PC', 'Unknown'
      ];

      validFormFactors.forEach(formFactor => {
        const device = { ...validDevice, formFactor };
        const result = validateDeviceData([device]);
        expect(result.isValid).toBe(true);
      });
    });

    it('should handle multiple devices with mixed validity', () => {
      const validDevice2 = { ...validDevice, modelName: 'Pixel 8 Pro' };
      const invalidDevice = { ...validDevice, formFactor: 'InvalidType' };
      
      const result = validateDeviceData([validDevice, validDevice2, invalidDevice]);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeDeviceData', () => {
    it('should sanitize valid device data without changes', () => {
      const result = sanitizeDeviceData([validDevice]);
      expect(result).toEqual([validDevice]);
    });

    it('should handle empty array', () => {
      const result = sanitizeDeviceData([]);
      expect(result).toEqual([]);
    });

    it('should trim whitespace from string fields', () => {
      const deviceWithWhitespace = {
        brand: '  Google  ',
        device: '  pixel_8  ',
        manufacturer: '  Google  ',
        modelName: '  Pixel 8  ',
        ram: '  8192MB  ',
        formFactor: '  Phone  ',
        processorName: '  Google Tensor G3  ',
        gpu: '  Mali-G715 MC10  ',
        screenSizes: ['  1080x2400  '],
        screenDensities: [420],
        abis: ['  arm64-v8a  ', '  armeabi-v7a  '],
        sdkVersions: [33, 34],
        openGlEsVersions: ['  3.2  ']
      };

      const result = sanitizeDeviceData([deviceWithWhitespace]);
      expect(result[0].brand).toBe('Google');
      expect(result[0].device).toBe('pixel_8');
      expect(result[0].screenSizes).toEqual(['1080x2400']);
      expect(result[0].abis).toEqual(['arm64-v8a', 'armeabi-v7a']);
      expect(result[0].openGlEsVersions).toEqual(['3.2']);
    });

    it('should handle missing fields by providing defaults', () => {
      const incompleteDevice = {
        brand: 'Google',
        device: 'pixel_8'
        // Missing other fields
      };

      const result = sanitizeDeviceData([incompleteDevice]);
      expect(result[0]).toEqual({
        brand: 'Google',
        device: 'pixel_8',
        manufacturer: '',
        modelName: '',
        ram: '',
        formFactor: '',
        processorName: '',
        gpu: '',
        screenSizes: [],
        screenDensities: [],
        abis: [],
        sdkVersions: [],
        openGlEsVersions: []
      });
    });

    it('should filter out non-numeric values from number arrays', () => {
      const deviceWithMixedTypes = {
        ...validDevice,
        screenDensities: [420, 'invalid', 480, null, undefined, 520],
        sdkVersions: [33, 'invalid', 34, null, undefined, 35]
      };

      const result = sanitizeDeviceData([deviceWithMixedTypes]);
      expect(result[0].screenDensities).toEqual([420, 480, 520]);
      expect(result[0].sdkVersions).toEqual([33, 34, 35]);
    });

    it('should handle non-array values by defaulting to empty arrays', () => {
      const deviceWithNonArrays = {
        ...validDevice,
        screenSizes: 'not an array',
        screenDensities: 'not an array',
        abis: null,
        sdkVersions: undefined,
        openGlEsVersions: 123
      };

      const result = sanitizeDeviceData([deviceWithNonArrays]);
      expect(result[0].screenSizes).toEqual([]);
      expect(result[0].screenDensities).toEqual([]);
      expect(result[0].abis).toEqual([]);
      expect(result[0].sdkVersions).toEqual([]);
      expect(result[0].openGlEsVersions).toEqual([]);
    });

    it('should convert non-string values to strings for string fields', () => {
      const deviceWithNonStrings = {
        brand: 123,
        device: null,
        manufacturer: undefined,
        modelName: true,
        ram: 8192,
        formFactor: {},
        processorName: [],
        gpu: new Date(),
        screenSizes: ['1080x2400'],
        screenDensities: [420],
        abis: ['arm64-v8a'],
        sdkVersions: [33],
        openGlEsVersions: ['3.2']
      };

      const result = sanitizeDeviceData([deviceWithNonStrings]);
      expect(typeof result[0].brand).toBe('string');
      expect(typeof result[0].device).toBe('string');
      expect(typeof result[0].manufacturer).toBe('string');
      expect(typeof result[0].modelName).toBe('string');
      expect(typeof result[0].ram).toBe('string');
      expect(typeof result[0].formFactor).toBe('string');
      expect(typeof result[0].processorName).toBe('string');
      expect(typeof result[0].gpu).toBe('string');
    });
  });

  describe('getAndroidDeviceJsonSchema', () => {
    it('should return valid JSON Schema object', () => {
      const schema = getAndroidDeviceJsonSchema();
      
      expect(schema).toHaveProperty('$schema');
      expect(schema).toHaveProperty('title');
      expect(schema).toHaveProperty('description');
      expect(schema).toHaveProperty('type');
      expect(schema).toHaveProperty('items');
      
      expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(schema.title).toBe('AndroidDeviceCatalog');
      expect(schema.type).toBe('array');
    });

    it('should have correct required fields in schema', () => {
      const schema = getAndroidDeviceJsonSchema();
      const requiredFields = schema.items.required;
      
      expect(requiredFields).toContain('brand');
      expect(requiredFields).toContain('device');
      expect(requiredFields).toContain('manufacturer');
      expect(requiredFields).toContain('modelName');
      expect(requiredFields).toContain('ram');
      expect(requiredFields).toContain('formFactor');
      expect(requiredFields).toContain('processorName');
      expect(requiredFields).toContain('gpu');
      expect(requiredFields).toContain('screenSizes');
      expect(requiredFields).toContain('screenDensities');
      expect(requiredFields).toContain('abis');
      expect(requiredFields).toContain('sdkVersions');
      expect(requiredFields).toContain('openGlEsVersions');
    });

    it('should have correct form factor enum values', () => {
      const schema = getAndroidDeviceJsonSchema();
      const formFactorEnum = schema.items.properties.formFactor.enum;
      
      expect(formFactorEnum).toContain('Phone');
      expect(formFactorEnum).toContain('TV');
      expect(formFactorEnum).toContain('Tablet');
      expect(formFactorEnum).toContain('Android Automotive');
      expect(formFactorEnum).toContain('Chromebook');
      expect(formFactorEnum).toContain('Wearable');
      expect(formFactorEnum).toContain('Google Play Games on PC');
      expect(formFactorEnum).toContain('Unknown');
    });

    it('should have correct patterns for formatted fields', () => {
      const schema = getAndroidDeviceJsonSchema();
      
      // Screen size pattern
      const screenSizePattern = schema.items.properties.screenSizes.items.pattern;
      expect(screenSizePattern).toBe('^[0-9]+x[0-9]+$');
      
      // OpenGL ES version pattern
      const openGlPattern = schema.items.properties.openGlEsVersions.items.pattern;
      expect(openGlPattern).toBe('^[0-9]+\\.[0-9]+$');
    });
  });
});