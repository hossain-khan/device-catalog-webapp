import { AndroidDevice, DeviceFilters, DeviceStats } from '@/types/device';

export const filterDevices = (devices: AndroidDevice[], filters: DeviceFilters): AndroidDevice[] => {
  return devices.filter(device => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchFields = [
        device.modelName,
        device.manufacturer,
        device.brand,
        device.device,
        device.processorName
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchTerm)) {
        return false;
      }
    }

    // Form factor filter
    if (filters.formFactor && filters.formFactor !== 'all') {
      if (device.formFactor !== filters.formFactor) {
        return false;
      }
    }

    // Manufacturer filter
    if (filters.manufacturer && filters.manufacturer !== 'all') {
      if (device.manufacturer !== filters.manufacturer) {
        return false;
      }
    }

    // Legacy RAM filter (for backward compatibility)
    if (filters.minRam && filters.minRam !== 'all') {
      const deviceRamMB = parseRamValue(device.ram);
      const minRamMB = parseInt(filters.minRam);
      if (deviceRamMB < minRamMB) {
        return false;
      }
    }

    // Advanced RAM range filter
    if (filters.ramRange) {
      const deviceRamMB = parseRamValue(device.ram);
      const [minRam, maxRam] = filters.ramRange;
      if (deviceRamMB < minRam || deviceRamMB > maxRam) {
        return false;
      }
    }

    // Legacy SDK version filter (for backward compatibility)
    if (filters.sdkVersion && filters.sdkVersion !== 'all') {
      const targetSdk = parseInt(filters.sdkVersion);
      if (!device.sdkVersions.includes(targetSdk)) {
        return false;
      }
    }

    // Advanced SDK version range filter
    if (filters.sdkVersionRange) {
      const [minSdk, maxSdk] = filters.sdkVersionRange;
      const hasMatchingSdk = device.sdkVersions.some(sdk => sdk >= minSdk && sdk <= maxSdk);
      if (!hasMatchingSdk) {
        return false;
      }
    }

    return true;
  });
};

export const parseRamValue = (ram: string): number => {
  const match = ram.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

export const formatRam = (ram: string): string => {
  const ramMB = parseRamValue(ram);
  if (ramMB >= 1024) {
    return `${Math.ceil(ramMB / 1024)}GB`;
  }
  return `${ramMB}MB`;
};

export const calculateDeviceStats = (devices: AndroidDevice[]): DeviceStats => {
  const stats: DeviceStats = {
    totalDevices: devices.length,
    manufacturerCounts: {},
    formFactorCounts: {},
    ramRanges: {
      '< 1GB': 0,
      '1-2GB': 0,
      '2-4GB': 0,
      '4-8GB': 0,
      '8GB+': 0
    },
    sdkVersionCounts: {}
  };

  devices.forEach(device => {
    // Manufacturer counts
    stats.manufacturerCounts[device.manufacturer] = 
      (stats.manufacturerCounts[device.manufacturer] || 0) + 1;

    // Form factor counts
    stats.formFactorCounts[device.formFactor] = 
      (stats.formFactorCounts[device.formFactor] || 0) + 1;

    // RAM ranges
    const ramMB = parseRamValue(device.ram);
    if (ramMB < 1024) {
      stats.ramRanges['< 1GB']++;
    } else if (ramMB < 2048) {
      stats.ramRanges['1-2GB']++;
    } else if (ramMB < 4096) {
      stats.ramRanges['2-4GB']++;
    } else if (ramMB < 8192) {
      stats.ramRanges['4-8GB']++;
    } else {
      stats.ramRanges['8GB+']++;
    }

    // SDK version counts
    device.sdkVersions.forEach(sdk => {
      const sdkKey = `API ${sdk}`;
      stats.sdkVersionCounts[sdkKey] = 
        (stats.sdkVersionCounts[sdkKey] || 0) + 1;
    });
  });

  return stats;
};

export const getUniqueManufacturers = (devices: AndroidDevice[]): string[] => {
  const manufacturers = [...new Set(devices.map(d => d.manufacturer))];
  return manufacturers.sort();
};

export const getUniqueFormFactors = (devices: AndroidDevice[]): string[] => {
  const formFactors = [...new Set(devices.map(d => d.formFactor))];
  return formFactors.sort();
};

export const getUniqueSdkVersions = (devices: AndroidDevice[]): number[] => {
  const sdkVersions = [...new Set(devices.flatMap(d => d.sdkVersions))];
  return sdkVersions.sort((a, b) => b - a);
};

export const getRamRange = (devices: AndroidDevice[]): [number, number] => {
  const ramValues = devices.map(device => parseRamValue(device.ram));
  const minRam = Math.min(...ramValues);
  const maxRam = Math.max(...ramValues);
  return [minRam, maxRam];
};

export const getSdkVersionRange = (devices: AndroidDevice[]): [number, number] => {
  const allSdkVersions = devices.flatMap(device => device.sdkVersions);
  const minSdk = Math.min(...allSdkVersions);
  const maxSdk = Math.max(...allSdkVersions);
  return [minSdk, maxSdk];
};

/**
 * Smoothly scrolls to the top of the page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};