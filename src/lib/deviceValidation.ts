import { AndroidDevice } from '@/types/device';
import { z } from 'zod';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Define the JSON schema using Zod for comprehensive validation
const AndroidDeviceSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  device: z.string().min(1, 'Device identifier is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  modelName: z.string().min(1, 'Model name is required'),
  ram: z.string().min(1, 'RAM specification is required'),
  formFactor: z.enum([
    'Phone', 
    'TV', 
    'Tablet', 
    'Android Automotive', 
    'Chromebook', 
    'Wearable', 
    'Google Play Games on PC'
  ], {
    errorMap: () => ({ 
      message: 'Form factor must be one of: Phone, TV, Tablet, Android Automotive, Chromebook, Wearable, Google Play Games on PC' 
    })
  }),
  processorName: z.string().min(1, 'Processor name is required'),
  gpu: z.string().min(1, 'GPU specification is required'),
  screenSizes: z.array(
    z.string().regex(
      /^\d+x\d+$/, 
      'Screen size must be in format WIDTHxHEIGHT (e.g., 1080x1920)'
    )
  ).min(1, 'At least one screen size is required'),
  screenDensities: z.array(
    z.number().positive('Screen density must be a positive number')
  ).min(1, 'At least one screen density is required'),
  abis: z.array(
    z.string().min(1, 'ABI cannot be empty')
  ).min(1, 'At least one ABI is required'),
  sdkVersions: z.array(
    z.number().int().positive('SDK version must be a positive integer')
  ).min(1, 'At least one SDK version is required'),
  openGlEsVersions: z.array(
    z.string().regex(
      /^\d+\.\d+$/, 
      'OpenGL ES version must be in format X.Y (e.g., 3.2)'
    )
  ).min(1, 'At least one OpenGL ES version is required')
});

const AndroidDeviceCatalogSchema = z.array(AndroidDeviceSchema);

export function validateDeviceData(data: any): ValidationResult {
  try {
    // Validate the entire array against the schema
    AndroidDeviceCatalogSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => {
        const path = issue.path.length > 0 ? `[${issue.path.join('.')}]: ` : '';
        return `${path}${issue.message}`;
      });
      return { isValid: false, errors };
    }
    
    // Handle non-Zod errors
    return { 
      isValid: false, 
      errors: [error instanceof Error ? error.message : 'Unknown validation error'] 
    };
  }
}

/**
 * Legacy validation function (kept for backward compatibility)
 * Use validateDeviceData for comprehensive JSON schema validation
 */
function validateDevice(device: any, index: number): string[] {
  const errors: string[] = [];
  const prefix = `Device ${index + 1}:`;

  // Required string fields
  const requiredStringFields = [
    'brand', 'device', 'manufacturer', 'modelName', 
    'ram', 'formFactor', 'processorName', 'gpu'
  ];

  for (const field of requiredStringFields) {
    if (!device[field] || typeof device[field] !== 'string') {
      errors.push(`${prefix} Missing or invalid '${field}' field`);
    }
  }

  // Required array fields
  const requiredArrayFields = ['screenSizes', 'abis', 'openGlEsVersions'];
  
  for (const field of requiredArrayFields) {
    if (!Array.isArray(device[field]) || device[field].length === 0) {
      errors.push(`${prefix} Missing or empty '${field}' array`);
    }
  }

  // screenSizes should be array of strings
  if (Array.isArray(device.screenSizes)) {
    device.screenSizes.forEach((size: any, i: number) => {
      if (typeof size !== 'string' || !size.match(/^\d+x\d+$/)) {
        errors.push(`${prefix} Invalid screen size format at index ${i}, expected 'WIDTHxHEIGHT'`);
      }
    });
  }

  // screenDensities should be array of numbers
  if (!Array.isArray(device.screenDensities) || device.screenDensities.length === 0) {
    errors.push(`${prefix} Missing or empty 'screenDensities' array`);
  } else {
    device.screenDensities.forEach((density: any, i: number) => {
      if (typeof density !== 'number' || density <= 0) {
        errors.push(`${prefix} Invalid screen density at index ${i}, must be a positive number`);
      }
    });
  }

  // sdkVersions should be array of numbers
  if (!Array.isArray(device.sdkVersions) || device.sdkVersions.length === 0) {
    errors.push(`${prefix} Missing or empty 'sdkVersions' array`);
  } else {
    device.sdkVersions.forEach((version: any, i: number) => {
      if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
        errors.push(`${prefix} Invalid SDK version at index ${i}, must be a positive integer`);
      }
    });
  }

  // Validate form factor
  const validFormFactors = ['Phone', 'TV', 'Tablet', 'Android Automotive', 'Chromebook', 'Wearable', 'Google Play Games on PC'];
  if (device.formFactor && !validFormFactors.includes(device.formFactor)) {
    errors.push(`${prefix} Invalid form factor '${device.formFactor}', must be one of: ${validFormFactors.join(', ')}`);
  }

  return errors;
}

export function sanitizeDeviceData(devices: any[]): AndroidDevice[] {
  return devices.map(device => ({
    brand: String(device.brand || '').trim(),
    device: String(device.device || '').trim(),
    manufacturer: String(device.manufacturer || '').trim(),
    modelName: String(device.modelName || '').trim(),
    ram: String(device.ram || '').trim(),
    formFactor: String(device.formFactor || '').trim(),
    processorName: String(device.processorName || '').trim(),
    gpu: String(device.gpu || '').trim(),
    screenSizes: Array.isArray(device.screenSizes) ? device.screenSizes.map((s: any) => String(s).trim()) : [],
    screenDensities: Array.isArray(device.screenDensities) ? device.screenDensities.filter((d: any) => typeof d === 'number') : [],
    abis: Array.isArray(device.abis) ? device.abis.map((a: any) => String(a).trim()) : [],
    sdkVersions: Array.isArray(device.sdkVersions) ? device.sdkVersions.filter((v: any) => typeof v === 'number') : [],
    openGlEsVersions: Array.isArray(device.openGlEsVersions) ? device.openGlEsVersions.map((v: any) => String(v).trim()) : []
  }));
}

/**
 * Get the JSON Schema definition for Android Device Catalog
 * This can be used for documentation and external validation
 */
export function getAndroidDeviceJsonSchema() {
  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "AndroidDeviceCatalog",
    "description": "A list of Android device specifications as found in the Google Play Device Catalog.",
    "type": "array",
    "items": {
      "type": "object",
      "required": [
        "brand",
        "device",
        "manufacturer",
        "modelName",
        "ram",
        "formFactor",
        "processorName",
        "gpu",
        "screenSizes",
        "screenDensities",
        "abis",
        "sdkVersions",
        "openGlEsVersions"
      ],
      "properties": {
        "brand": {
          "type": "string",
          "description": "Device brand name (e.g., samsung, google, vivo)."
        },
        "device": {
          "type": "string",
          "description": "Device code name or identifier."
        },
        "manufacturer": {
          "type": "string",
          "description": "Device manufacturer (e.g., Samsung, Google, Vivo)."
        },
        "modelName": {
          "type": "string",
          "description": "Device model name as marketed."
        },
        "ram": {
          "type": "string",
          "description": "Amount of RAM in MB, may be a range (e.g., 3894-6003MB)."
        },
        "formFactor": {
          "type": "string",
          "enum": ["Phone", "TV", "Tablet", "Android Automotive", "Chromebook", "Wearable", "Google Play Games on PC"],
          "description": "Device form factor."
        },
        "processorName": {
          "type": "string",
          "description": "System-on-chip (SoC) or processor name."
        },
        "gpu": {
          "type": "string",
          "description": "Graphics processor unit (GPU) details."
        },
        "screenSizes": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[0-9]+x[0-9]+$",
            "description": "Screen resolution in WIDTHxHEIGHT format (e.g., 1080x1920)."
          },
          "minItems": 1,
          "description": "List of supported screen resolutions."
        },
        "screenDensities": {
          "type": "array",
          "items": {
            "type": "integer",
            "minimum": 1,
            "description": "Screen density in dpi (e.g., 320)."
          },
          "minItems": 1,
          "description": "List of supported screen densities."
        },
        "abis": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1,
            "description": "Supported CPU ABIs (e.g., arm64-v8a, armeabi-v7a)."
          },
          "minItems": 1,
          "description": "List of supported CPU ABIs."
        },
        "sdkVersions": {
          "type": "array",
          "items": {
            "type": "integer",
            "minimum": 1,
            "description": "Supported Android SDK versions (e.g., 30, 31)."
          },
          "minItems": 1,
          "description": "List of supported Android SDK versions."
        },
        "openGlEsVersions": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[0-9]+\\.[0-9]+$",
            "description": "Supported OpenGL ES version (e.g., 3.2)."
          },
          "minItems": 1,
          "description": "List of supported OpenGL ES versions."
        }
      },
      "additionalProperties": false
    }
  };
}