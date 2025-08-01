import { AndroidDevice } from '@/types/device';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateDeviceData(data: any[]): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    return { isValid: false, errors: ['Data must be an array'] };
  }

  data.forEach((device, index) => {
    const deviceErrors = validateDevice(device, index);
    errors.push(...deviceErrors);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

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
  const validFormFactors = ['Phone', 'Tablet', 'TV', 'Watch', 'Auto'];
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