/**
 * Color coding system for Android device categories
 * Provides visual distinction based on form factors, performance tiers, and other characteristics
 */

export interface DeviceColorScheme {
  primary: string;
  secondary: string;
  background: string;
  border: string;
  text: string;
  icon: string;
}

export interface PerformanceTier {
  name: string;
  ramThreshold: number;
  colors: DeviceColorScheme;
}

// Form factor color schemes using distinct hues for accessibility
export const FORM_FACTOR_COLORS: Record<string, DeviceColorScheme> = {
  'Phone': {
    primary: 'oklch(0.65 0.08 220)', // Blue - lighter and less saturated
    secondary: 'oklch(0.92 0.04 220)', // Much lighter secondary
    background: 'oklch(0.98 0.01 220)', // Very light background
    border: 'oklch(0.85 0.06 220)', // Lighter border
    text: 'oklch(0.25 0.18 220)',
    icon: 'oklch(0.35 0.20 220)'
  },
  'Tablet': {
    primary: 'oklch(0.65 0.08 280)', // Purple - lighter and less saturated
    secondary: 'oklch(0.92 0.04 280)',
    background: 'oklch(0.98 0.01 280)',
    border: 'oklch(0.85 0.06 280)',
    text: 'oklch(0.25 0.18 280)',
    icon: 'oklch(0.35 0.20 280)'
  },
  'TV': {
    primary: 'oklch(0.65 0.08 15)', // Red-orange - lighter and less saturated
    secondary: 'oklch(0.92 0.04 15)',
    background: 'oklch(0.98 0.01 15)',
    border: 'oklch(0.85 0.06 15)',
    text: 'oklch(0.25 0.18 15)',
    icon: 'oklch(0.35 0.20 15)'
  },
  'Wearable': {
    primary: 'oklch(0.65 0.08 120)', // Green - lighter and less saturated
    secondary: 'oklch(0.92 0.04 120)',
    background: 'oklch(0.98 0.01 120)',
    border: 'oklch(0.85 0.06 120)',
    text: 'oklch(0.25 0.18 120)',
    icon: 'oklch(0.35 0.20 120)'
  },
  'Android Automotive': {
    primary: 'oklch(0.65 0.08 60)', // Yellow-orange - lighter and less saturated
    secondary: 'oklch(0.92 0.04 60)',
    background: 'oklch(0.98 0.01 60)',
    border: 'oklch(0.85 0.06 60)',
    text: 'oklch(0.25 0.18 60)',
    icon: 'oklch(0.35 0.20 60)'
  },
  'Chromebook': {
    primary: 'oklch(0.65 0.08 180)', // Cyan - lighter and less saturated
    secondary: 'oklch(0.92 0.04 180)',
    background: 'oklch(0.98 0.01 180)',
    border: 'oklch(0.85 0.06 180)',
    text: 'oklch(0.25 0.18 180)',
    icon: 'oklch(0.35 0.20 180)'
  },
  'Google Play Games on PC': {
    primary: 'oklch(0.65 0.08 340)', // Magenta - lighter and less saturated
    secondary: 'oklch(0.92 0.04 340)',
    background: 'oklch(0.98 0.01 340)',
    border: 'oklch(0.85 0.06 340)',
    text: 'oklch(0.25 0.18 340)',
    icon: 'oklch(0.35 0.20 340)'
  },
  'Unknown': {
    primary: 'oklch(0.65 0.08 0)', // Grey - lighter and less saturated
    secondary: 'oklch(0.92 0.04 0)',
    background: 'oklch(0.98 0.01 0)',
    border: 'oklch(0.85 0.06 0)',
    text: 'oklch(0.25 0.18 0)',
    icon: 'oklch(0.35 0.20 0)'
  }
};

// Performance tier colors based on RAM
export const PERFORMANCE_TIERS: PerformanceTier[] = [
  {
    name: 'Budget',
    ramThreshold: 2048, // < 2GB
    colors: {
      primary: 'oklch(0.65 0.06 30)', // Lighter and less saturated
      secondary: 'oklch(0.92 0.03 30)',
      background: 'oklch(0.98 0.005 30)',
      border: 'oklch(0.85 0.04 30)',
      text: 'oklch(0.25 0.15 30)',
      icon: 'oklch(0.35 0.15 30)'
    }
  },
  {
    name: 'Mid-Range',
    ramThreshold: 6144, // 2GB - 6GB
    colors: {
      primary: 'oklch(0.65 0.06 50)', // Lighter and less saturated
      secondary: 'oklch(0.92 0.03 50)',
      background: 'oklch(0.98 0.005 50)',
      border: 'oklch(0.85 0.04 50)',
      text: 'oklch(0.25 0.15 50)',
      icon: 'oklch(0.35 0.15 50)'
    }
  },
  {
    name: 'Premium',
    ramThreshold: 12288, // 6GB - 12GB
    colors: {
      primary: 'oklch(0.65 0.06 90)', // Lighter and less saturated
      secondary: 'oklch(0.92 0.03 90)',
      background: 'oklch(0.98 0.005 90)',
      border: 'oklch(0.85 0.04 90)',
      text: 'oklch(0.25 0.15 90)',
      icon: 'oklch(0.35 0.15 90)'
    }
  },
  {
    name: 'Flagship',
    ramThreshold: Infinity, // > 12GB
    colors: {
      primary: 'oklch(0.65 0.06 140)', // Lighter and less saturated
      secondary: 'oklch(0.92 0.03 140)',
      background: 'oklch(0.98 0.005 140)',
      border: 'oklch(0.85 0.04 140)',
      text: 'oklch(0.25 0.15 140)',
      icon: 'oklch(0.35 0.15 140)'
    }
  }
];

// Manufacturer color schemes for brand recognition
export const MANUFACTURER_COLORS: Record<string, DeviceColorScheme> = {
  'Google': {
    primary: 'oklch(0.65 0.08 220)', // Lighter and less saturated
    secondary: 'oklch(0.92 0.04 220)',
    background: 'oklch(0.98 0.01 220)',
    border: 'oklch(0.85 0.06 220)',
    text: 'oklch(0.25 0.18 220)',
    icon: 'oklch(0.35 0.20 220)'
  },
  'Samsung': {
    primary: 'oklch(0.65 0.08 250)', // Lighter and less saturated
    secondary: 'oklch(0.92 0.04 250)',
    background: 'oklch(0.98 0.01 250)',
    border: 'oklch(0.85 0.06 250)',
    text: 'oklch(0.25 0.18 250)',
    icon: 'oklch(0.35 0.20 250)'
  },
  'OnePlus': {
    primary: 'oklch(0.65 0.08 15)', // Lighter and less saturated
    secondary: 'oklch(0.92 0.04 15)',
    background: 'oklch(0.98 0.01 15)',
    border: 'oklch(0.85 0.06 15)',
    text: 'oklch(0.25 0.18 15)',
    icon: 'oklch(0.35 0.20 15)'
  },
  'Oppo': {
    primary: 'oklch(0.65 0.08 120)', // Lighter and less saturated
    secondary: 'oklch(0.92 0.04 120)',
    background: 'oklch(0.98 0.01 120)',
    border: 'oklch(0.85 0.06 120)',
    text: 'oklch(0.25 0.18 120)',
    icon: 'oklch(0.35 0.20 120)'
  }
};

// SDK version era colors
export const SDK_ERA_COLORS: Record<string, DeviceColorScheme> = {
  'Legacy': { // SDK < 26
    primary: 'oklch(0.60 0.05 30)', // Lighter and less saturated
    secondary: 'oklch(0.90 0.025 30)',
    background: 'oklch(0.98 0.005 30)',
    border: 'oklch(0.85 0.04 30)',
    text: 'oklch(0.30 0.12 30)',
    icon: 'oklch(0.35 0.12 30)'
  },
  'Modern': { // SDK 26-30
    primary: 'oklch(0.65 0.06 180)', // Lighter and less saturated
    secondary: 'oklch(0.92 0.03 180)',
    background: 'oklch(0.98 0.005 180)',
    border: 'oklch(0.85 0.04 180)',
    text: 'oklch(0.25 0.15 180)',
    icon: 'oklch(0.35 0.15 180)'
  },
  'Recent': { // SDK 31-33
    primary: 'oklch(0.65 0.08 140)', // Lighter and less saturated
    secondary: 'oklch(0.92 0.04 140)',
    background: 'oklch(0.98 0.01 140)',
    border: 'oklch(0.85 0.06 140)',
    text: 'oklch(0.25 0.18 140)',
    icon: 'oklch(0.35 0.20 140)'
  },
  'Latest': { // SDK >= 34
    primary: 'oklch(0.65 0.09 240)', // Lighter and less saturated
    secondary: 'oklch(0.92 0.05 240)',
    background: 'oklch(0.98 0.015 240)',
    border: 'oklch(0.85 0.08 240)',
    text: 'oklch(0.25 0.20 240)',
    icon: 'oklch(0.35 0.22 240)'
  }
};

// Utility functions
export function getFormFactorColors(formFactor: string): DeviceColorScheme {
  return FORM_FACTOR_COLORS[formFactor] || FORM_FACTOR_COLORS['Phone'];
}

export function getPerformanceTierColors(ramMB: number): DeviceColorScheme {
  const tier = PERFORMANCE_TIERS.find(tier => ramMB < tier.ramThreshold) || PERFORMANCE_TIERS[PERFORMANCE_TIERS.length - 1];
  return tier.colors;
}

export function getManufacturerColors(manufacturer: string): DeviceColorScheme {
  return MANUFACTURER_COLORS[manufacturer] || getFormFactorColors('Phone');
}

export function getSdkEraColors(maxSdk: number): DeviceColorScheme {
  if (maxSdk < 26) return SDK_ERA_COLORS['Legacy'];
  if (maxSdk <= 30) return SDK_ERA_COLORS['Modern'];
  if (maxSdk <= 33) return SDK_ERA_COLORS['Recent'];
  return SDK_ERA_COLORS['Latest'];
}

export function parseRamMB(ramString: string): number {
  // Parse RAM strings like "3742MB", "1992-4116MB"
  const match = ramString.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function getDeviceCategoryLabel(formFactor: string, ramMB: number): string {
  const perfTier = PERFORMANCE_TIERS.find(tier => ramMB < tier.ramThreshold) || PERFORMANCE_TIERS[PERFORMANCE_TIERS.length - 1];
  return `${perfTier.name} ${formFactor}`;
}

export type ColorMode = 'formFactor' | 'performance' | 'manufacturer' | 'sdkEra';

export function getDeviceColors(
  device: { formFactor: string; ram: string; manufacturer: string; sdkVersions: number[] },
  mode: ColorMode = 'formFactor'
): DeviceColorScheme {
  switch (mode) {
    case 'performance':
      return getPerformanceTierColors(parseRamMB(device.ram));
    case 'manufacturer':
      return getManufacturerColors(device.manufacturer);
    case 'sdkEra':
      const maxSdk = Math.max(...device.sdkVersions);
      return getSdkEraColors(maxSdk);
    case 'formFactor':
    default:
      return getFormFactorColors(device.formFactor);
  }
}