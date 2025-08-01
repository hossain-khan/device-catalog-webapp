export interface AndroidDevice {
  brand: string;
  device: string;
  manufacturer: string;
  modelName: string;
  ram: string;
  formFactor: string;
  processorName: string;
  gpu: string;
  screenSizes: string[];
  screenDensities: number[];
  abis: string[];
  sdkVersions: number[];
  openGlEsVersions: string[];
}

export interface DeviceFilters {
  search: string;
  formFactor: string;
  manufacturer: string;
  minRam: string;
  sdkVersion: string;
  // New advanced filters
  ramRange: [number, number]; // [min, max] in MB
  sdkVersionRange: [number, number]; // [min, max] SDK version
}

export interface DeviceStats {
  totalDevices: number;
  manufacturerCounts: { [key: string]: number };
  formFactorCounts: { [key: string]: number };
  ramRanges: { [key: string]: number };
  sdkVersionCounts: { [key: string]: number };
}