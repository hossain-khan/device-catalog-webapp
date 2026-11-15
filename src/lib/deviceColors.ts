/**
 * Color coding system for Android device categories
 * Provides semantic accent colors based on form factors, performance tiers, manufacturers, and SDK eras
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

// Form factor color schemes using crisp, modern hues that work in both light and dark mode
export const FORM_FACTOR_COLORS: Record<string, DeviceColorScheme> = {
  'Phone': {
    primary: 'oklch(0.60 0.16 245)',     // Technical Blue
    secondary: 'oklch(0.60 0.16 245 / 0.12)',
    background: 'oklch(0.60 0.16 245 / 0.06)',
    border: 'oklch(0.60 0.16 245 / 0.28)',
    text: 'oklch(0.55 0.16 245)',
    icon: 'oklch(0.60 0.16 245)'
  },
  'Tablet': {
    primary: 'oklch(0.60 0.17 290)',     // Indigo / Violet
    secondary: 'oklch(0.60 0.17 290 / 0.12)',
    background: 'oklch(0.60 0.17 290 / 0.06)',
    border: 'oklch(0.60 0.17 290 / 0.28)',
    text: 'oklch(0.55 0.17 290)',
    icon: 'oklch(0.60 0.17 290)'
  },
  'TV': {
    primary: 'oklch(0.62 0.18 25)',      // Coral / Rose
    secondary: 'oklch(0.62 0.18 25 / 0.12)',
    background: 'oklch(0.62 0.18 25 / 0.06)',
    border: 'oklch(0.62 0.18 25 / 0.28)',
    text: 'oklch(0.56 0.18 25)',
    icon: 'oklch(0.62 0.18 25)'
  },
  'Wearable': {
    primary: 'oklch(0.64 0.16 155)',     // Emerald
    secondary: 'oklch(0.64 0.16 155 / 0.12)',
    background: 'oklch(0.64 0.16 155 / 0.06)',
    border: 'oklch(0.64 0.16 155 / 0.28)',
    text: 'oklch(0.54 0.16 155)',
    icon: 'oklch(0.64 0.16 155)'
  },
  'Android Automotive': {
    primary: 'oklch(0.68 0.16 65)',      // Amber
    secondary: 'oklch(0.68 0.16 65 / 0.12)',
    background: 'oklch(0.68 0.16 65 / 0.06)',
    border: 'oklch(0.68 0.16 65 / 0.28)',
    text: 'oklch(0.58 0.16 65)',
    icon: 'oklch(0.68 0.16 65)'
  },
  'Chromebook': {
    primary: 'oklch(0.62 0.14 200)',     // Cyan
    secondary: 'oklch(0.62 0.14 200 / 0.12)',
    background: 'oklch(0.62 0.14 200 / 0.06)',
    border: 'oklch(0.62 0.14 200 / 0.28)',
    text: 'oklch(0.54 0.14 200)',
    icon: 'oklch(0.62 0.14 200)'
  },
  'Desktop': {
    primary: 'oklch(0.62 0.14 200)',     // Cyan
    secondary: 'oklch(0.62 0.14 200 / 0.12)',
    background: 'oklch(0.62 0.14 200 / 0.06)',
    border: 'oklch(0.62 0.14 200 / 0.28)',
    text: 'oklch(0.54 0.14 200)',
    icon: 'oklch(0.62 0.14 200)'
  },
  'Google Play Games on PC': {
    primary: 'oklch(0.62 0.18 335)',     // Magenta
    secondary: 'oklch(0.62 0.18 335 / 0.12)',
    background: 'oklch(0.62 0.18 335 / 0.06)',
    border: 'oklch(0.62 0.18 335 / 0.28)',
    text: 'oklch(0.56 0.18 335)',
    icon: 'oklch(0.62 0.18 335)'
  },
  'Unknown': {
    primary: 'oklch(0.58 0.02 250)',     // Slate
    secondary: 'oklch(0.58 0.02 250 / 0.12)',
    background: 'oklch(0.58 0.02 250 / 0.06)',
    border: 'oklch(0.58 0.02 250 / 0.28)',
    text: 'oklch(0.50 0.02 250)',
    icon: 'oklch(0.58 0.02 250)'
  }
};

// Performance tier colors based on RAM
export const PERFORMANCE_TIERS: PerformanceTier[] = [
  {
    name: 'Budget',
    ramThreshold: 2048, // < 2GB
    colors: {
      primary: 'oklch(0.60 0.12 45)',
      secondary: 'oklch(0.60 0.12 45 / 0.12)',
      background: 'oklch(0.60 0.12 45 / 0.06)',
      border: 'oklch(0.60 0.12 45 / 0.28)',
      text: 'oklch(0.55 0.12 45)',
      icon: 'oklch(0.60 0.12 45)'
    }
  },
  {
    name: 'Mid-Range',
    ramThreshold: 6144, // 2GB - 6GB
    colors: {
      primary: 'oklch(0.60 0.15 245)',
      secondary: 'oklch(0.60 0.15 245 / 0.12)',
      background: 'oklch(0.60 0.15 245 / 0.06)',
      border: 'oklch(0.60 0.15 245 / 0.28)',
      text: 'oklch(0.55 0.15 245)',
      icon: 'oklch(0.60 0.15 245)'
    }
  },
  {
    name: 'Premium',
    ramThreshold: 12288, // 6GB - 12GB
    colors: {
      primary: 'oklch(0.62 0.17 290)',
      secondary: 'oklch(0.62 0.17 290 / 0.12)',
      background: 'oklch(0.62 0.17 290 / 0.06)',
      border: 'oklch(0.62 0.17 290 / 0.28)',
      text: 'oklch(0.56 0.17 290)',
      icon: 'oklch(0.62 0.17 290)'
    }
  },
  {
    name: 'Flagship',
    ramThreshold: Infinity, // > 12GB
    colors: {
      primary: 'oklch(0.64 0.16 158)',
      secondary: 'oklch(0.64 0.16 158 / 0.12)',
      background: 'oklch(0.64 0.16 158 / 0.06)',
      border: 'oklch(0.64 0.16 158 / 0.28)',
      text: 'oklch(0.55 0.16 158)',
      icon: 'oklch(0.64 0.16 158)'
    }
  }
];

// Manufacturer color schemes for brand recognition
export const MANUFACTURER_COLORS: Record<string, DeviceColorScheme> = {
  'Google': {
    primary: 'oklch(0.62 0.16 155)',
    secondary: 'oklch(0.62 0.16 155 / 0.12)',
    background: 'oklch(0.62 0.16 155 / 0.06)',
    border: 'oklch(0.62 0.16 155 / 0.28)',
    text: 'oklch(0.54 0.16 155)',
    icon: 'oklch(0.62 0.16 155)'
  },
  'Samsung': {
    primary: 'oklch(0.58 0.17 255)',
    secondary: 'oklch(0.58 0.17 255 / 0.12)',
    background: 'oklch(0.58 0.17 255 / 0.06)',
    border: 'oklch(0.58 0.17 255 / 0.28)',
    text: 'oklch(0.54 0.17 255)',
    icon: 'oklch(0.58 0.17 255)'
  },
  'OnePlus': {
    primary: 'oklch(0.60 0.19 25)',
    secondary: 'oklch(0.60 0.19 25 / 0.12)',
    background: 'oklch(0.60 0.19 25 / 0.06)',
    border: 'oklch(0.60 0.19 25 / 0.28)',
    text: 'oklch(0.56 0.19 25)',
    icon: 'oklch(0.60 0.19 25)'
  },
  'Oppo': {
    primary: 'oklch(0.62 0.15 165)',
    secondary: 'oklch(0.62 0.15 165 / 0.12)',
    background: 'oklch(0.62 0.15 165 / 0.06)',
    border: 'oklch(0.62 0.15 165 / 0.28)',
    text: 'oklch(0.54 0.15 165)',
    icon: 'oklch(0.62 0.15 165)'
  }
};

// SDK version era colors
export const SDK_ERA_COLORS: Record<string, DeviceColorScheme> = {
  'Legacy': { // SDK < 26
    primary: 'oklch(0.60 0.16 25)',
    secondary: 'oklch(0.60 0.16 25 / 0.12)',
    background: 'oklch(0.60 0.16 25 / 0.06)',
    border: 'oklch(0.60 0.16 25 / 0.28)',
    text: 'oklch(0.55 0.16 25)',
    icon: 'oklch(0.60 0.16 25)'
  },
  'Modern': { // SDK 26-30
    primary: 'oklch(0.66 0.15 70)',
    secondary: 'oklch(0.66 0.15 70 / 0.12)',
    background: 'oklch(0.66 0.15 70 / 0.06)',
    border: 'oklch(0.66 0.15 70 / 0.28)',
    text: 'oklch(0.56 0.15 70)',
    icon: 'oklch(0.66 0.15 70)'
  },
  'Recent': { // SDK 31-33
    primary: 'oklch(0.60 0.16 245)',
    secondary: 'oklch(0.60 0.16 245 / 0.12)',
    background: 'oklch(0.60 0.16 245 / 0.06)',
    border: 'oklch(0.60 0.16 245 / 0.28)',
    text: 'oklch(0.55 0.16 245)',
    icon: 'oklch(0.60 0.16 245)'
  },
  'Latest': { // SDK >= 34
    primary: 'oklch(0.64 0.16 158)',
    secondary: 'oklch(0.64 0.16 158 / 0.12)',
    background: 'oklch(0.64 0.16 158 / 0.06)',
    border: 'oklch(0.64 0.16 158 / 0.28)',
    text: 'oklch(0.54 0.16 158)',
    icon: 'oklch(0.64 0.16 158)'
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
    case 'sdkEra': {
      const maxSdk = Math.max(...device.sdkVersions);
      return getSdkEraColors(maxSdk);
    }
    case 'formFactor':
    default:
      return getFormFactorColors(device.formFactor);
  }
}
