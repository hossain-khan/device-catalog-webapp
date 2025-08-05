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
      '8-12GB': 0,
      '12GB+': 0
    },
    sdkVersionCounts: {},
    
    // New analytics metrics
    architectureCounts: {},
    multiAbiDeviceCount: 0,
    arm64SupportCount: 0,
    platformCompatibility: {
      legacy: 0,
      modern: 0,
      recent: 0,
      latest: 0
    },
    averageSdkRange: 0,
    screenResolutionCounts: {},
    openGlVersionCounts: {},
    performanceTierCounts: {
      budget: 0,
      midRange: 0,
      premium: 0,
      flagship: 0
    }
  };

  let totalSdkRange = 0;

  devices.forEach(device => {
    // Manufacturer counts
    stats.manufacturerCounts[device.manufacturer] = 
      (stats.manufacturerCounts[device.manufacturer] || 0) + 1;

    // Form factor counts
    stats.formFactorCounts[device.formFactor] = 
      (stats.formFactorCounts[device.formFactor] || 0) + 1;

    // RAM ranges and performance tiers
    const ramMB = parseRamValue(device.ram);
    if (ramMB < 1024) {
      stats.ramRanges['< 1GB']++;
      stats.performanceTierCounts.budget++;
    } else if (ramMB < 2048) {
      stats.ramRanges['1-2GB']++;
      stats.performanceTierCounts.budget++;
    } else if (ramMB < 4096) {
      stats.ramRanges['2-4GB']++;
      stats.performanceTierCounts.midRange++;
    } else if (ramMB < 8192) {
      stats.ramRanges['4-8GB']++;
      stats.performanceTierCounts.midRange++;
    } else if (ramMB < 12288) {
      stats.ramRanges['8-12GB']++;
      stats.performanceTierCounts.premium++;
    } else {
      stats.ramRanges['12GB+']++;
      stats.performanceTierCounts.flagship++;
    }

    // Architecture analysis
    const hasArm64 = device.abis.includes('arm64-v8a');
    const hasArm32 = device.abis.includes('armeabi-v7a') || device.abis.includes('armeabi');
    const hasX86 = device.abis.some(abi => abi.includes('x86'));
    
    if (hasArm64) {
      stats.arm64SupportCount++;
    }
    
    if (device.abis.length > 1) {
      stats.multiAbiDeviceCount++;
    }

    // Architecture categorization
    if (hasArm64 && hasArm32) {
      stats.architectureCounts['ARM64 + ARM32'] = (stats.architectureCounts['ARM64 + ARM32'] || 0) + 1;
    } else if (hasArm64) {
      stats.architectureCounts['ARM64 only'] = (stats.architectureCounts['ARM64 only'] || 0) + 1;
    } else if (hasArm32) {
      stats.architectureCounts['ARM32 only'] = (stats.architectureCounts['ARM32 only'] || 0) + 1;
    } else if (hasX86) {
      stats.architectureCounts['x86'] = (stats.architectureCounts['x86'] || 0) + 1;
    } else {
      stats.architectureCounts['Other'] = (stats.architectureCounts['Other'] || 0) + 1;
    }

    // SDK version analysis
    const minSdk = Math.min(...device.sdkVersions);
    const maxSdk = Math.max(...device.sdkVersions);
    totalSdkRange += (maxSdk - minSdk + 1);
    
    // Platform compatibility
    if (maxSdk <= 25) {
      stats.platformCompatibility.legacy++;
    } else if (maxSdk <= 30) {
      stats.platformCompatibility.modern++;
    } else if (maxSdk <= 33) {
      stats.platformCompatibility.recent++;
    } else {
      stats.platformCompatibility.latest++;
    }

    // SDK version counts (individual)
    device.sdkVersions.forEach(sdk => {
      const sdkKey = sdk.toString();
      stats.sdkVersionCounts[sdkKey] = 
        (stats.sdkVersionCounts[sdkKey] || 0) + 1;
    });

    // Screen resolution analysis
    device.screenSizes.forEach(size => {
      const [width, height] = size.split('x').map(Number);
      let category = 'Other';
      
      if (width >= 3840 || height >= 3840) {
        category = '4K+';
      } else if (width >= 2560 || height >= 2560) {
        category = 'QHD+';
      } else if (width >= 1920 || height >= 1920) {
        category = 'FHD+';
      } else if (width >= 1280 || height >= 1280) {
        category = 'HD+';
      } else {
        category = 'SD';
      }
      
      stats.screenResolutionCounts[category] = (stats.screenResolutionCounts[category] || 0) + 1;
    });

    // OpenGL ES version analysis
    device.openGlEsVersions.forEach(version => {
      stats.openGlVersionCounts[`OpenGL ES ${version}`] = 
        (stats.openGlVersionCounts[`OpenGL ES ${version}`] || 0) + 1;
    });
  });

  // Calculate average SDK range
  stats.averageSdkRange = devices.length > 0 ? totalSdkRange / devices.length : 0;

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