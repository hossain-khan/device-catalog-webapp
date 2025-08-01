import { AndroidDevice } from '@/types/device';
import { sanitizeDeviceData } from '@/lib/deviceValidation';

const CATALOG_URL = 'https://raw.githubusercontent.com/hossain-khan/android-device-catalog-parser/refs/heads/main/lib/src/test/resources/android-devices-catalog-min.json';

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  error: string | null;
}

/**
 * Service for loading device catalog data from remote sources
 */
export class DeviceCatalogService {
  /**
   * Load device catalog from the GitHub repository
   */
  static async loadFromGitHub(
    onProgress?: (state: LoadingState) => void
  ): Promise<AndroidDevice[]> {
    const updateProgress = (progress: number, message: string, error: string | null = null) => {
      onProgress?.({
        isLoading: progress < 100,
        progress,
        message,
        error
      });
    };

    try {
      updateProgress(10, 'Connecting to device catalog...');

      const response = await fetch(CATALOG_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      updateProgress(30, 'Downloading device data...');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      updateProgress(60, 'Processing device catalog...');

      const rawData = await response.json();
      
      updateProgress(80, 'Validating device data...');

      // Ensure we have an array of devices
      const devices = Array.isArray(rawData) ? rawData : [];
      
      if (devices.length === 0) {
        throw new Error('No devices found in catalog');
      }

      updateProgress(90, 'Finalizing catalog...');

      // Sanitize and validate the device data
      const sanitizedDevices = sanitizeDeviceData(devices);

      updateProgress(100, `Loaded ${sanitizedDevices.length} devices successfully`);

      return sanitizedDevices;

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load device catalog';
      
      updateProgress(0, '', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Check if the GitHub catalog is accessible
   */
  static async checkCatalogAvailability(): Promise<boolean> {
    try {
      const response = await fetch(CATALOG_URL, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}