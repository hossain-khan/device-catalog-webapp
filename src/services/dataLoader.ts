import { AndroidDevice } from '@/types/device';
import { sanitizeDeviceData } from '@/lib/deviceValidation';

export interface DataLoadingState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  data: AndroidDevice[] | null;
}

/**
 * Preloads the full Android device catalog data
 * This loads the JSON file asynchronously to avoid blocking the main bundle
 */
export async function preloadDeviceCatalog(): Promise<AndroidDevice[]> {
  try {
    // Dynamically import the JSON file to avoid blocking the main bundle
    const response = await fetch('/android-devices-catalog.min.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch device catalog: ${response.statusText}`);
    }
    
    const rawData = await response.json() as AndroidDevice[];
    
    // Sanitize the data using existing validation
    const sanitizedData = sanitizeDeviceData(rawData);
    
    return sanitizedData;
  } catch (error) {
    throw new Error(`Failed to load device catalog: ${error}`);
  }
}

/**
 * Preloads device catalog with progress updates
 */
export async function preloadDeviceCatalogWithProgress(
  onProgress?: (progress: number) => void
): Promise<AndroidDevice[]> {
  try {
    // Start progress
    if (onProgress) {
      onProgress(10);
    }
    
    // Fetch the data
    const response = await fetch('/android-devices-catalog.min.json');
    
    if (onProgress) {
      onProgress(40);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch device catalog: ${response.statusText}`);
    }
    
    if (onProgress) {
      onProgress(70);
    }
    
    const rawData = await response.json() as AndroidDevice[];
    
    if (onProgress) {
      onProgress(90);
    }
    
    // Sanitize the data
    const sanitizedData = sanitizeDeviceData(rawData);
    
    // Complete the progress
    if (onProgress) {
      onProgress(100);
    }
    
    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return sanitizedData;
  } catch (error) {
    throw new Error(`Failed to load device catalog: ${error}`);
  }
}
