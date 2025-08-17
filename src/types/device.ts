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
  manufacturer: string; // Legacy single manufacturer support for backwards compatibility
  manufacturers: string[]; // New multi-manufacturer support
  minRam: string;
  sdkVersion: string;
  // New advanced filters
  ramRange?: [number, number]; // [min, max] in MB - optional to allow no range filter
  sdkVersionRange?: [number, number]; // [min, max] SDK version - optional to allow no range filter
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface DeviceStats {
  totalDevices: number;
  manufacturerCounts: { [key: string]: number };
  formFactorCounts: { [key: string]: number };
  ramRanges: { [key: string]: number };
  sdkVersionCounts: { [key: string]: number };
  
  // New analytics metrics
  architectureCounts: { [key: string]: number };
  multiAbiDeviceCount: number;
  arm64SupportCount: number;
  platformCompatibility: {
    legacy: number;      // API ≤ 25
    modern: number;      // API 26-30
    recent: number;      // API 31-33
    latest: number;      // API ≥ 34
  };
  averageSdkRange: number;
  screenResolutionCounts: { [key: string]: number };
  openGlVersionCounts: { [key: string]: number };
  openGlEs32SupportCount: number;
  performanceTierCounts: {
    budget: number;      // < 2GB RAM
    midRange: number;    // 2-6GB RAM
    premium: number;     // 6-12GB RAM
    flagship: number;    // 12GB+ RAM
  };
  // New analytics metrics
  processorDiversityCount: number;
  processorManufacturerCounts: { [key: string]: number };
  highResolutionSupportCount: number; // 1080p+ displays
  gpuManufacturerCounts: { [key: string]: number };
}