import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeviceCatalogService } from './deviceCatalogService';
import { sanitizeDeviceData } from '@/lib/deviceValidation';

// Mock the sanitizeDeviceData function
vi.mock('@/lib/deviceValidation', () => ({
  sanitizeDeviceData: vi.fn(data => data),
}));

const mockFetch = (data: any, ok = true, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: async () => data,
  } as Response);
};

const mockFetchError = (error: Error) => {
  global.fetch = vi.fn().mockRejectedValue(error);
};

describe('DeviceCatalogService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('loadFromGitHub', () => {
    it('should load, sanitize, and return device data successfully', async () => {
      const mockDevices = [{ name: 'Test Device' }];
      mockFetch(mockDevices);

      const onProgress = vi.fn();
      const result = await DeviceCatalogService.loadFromGitHub(onProgress);

      expect(result).toEqual(mockDevices);
      expect(sanitizeDeviceData).toHaveBeenCalledWith(mockDevices);
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ progress: 100, message: 'Loaded 1 devices successfully' })
      );
    });

    it('should throw an error if the network response is not ok', async () => {
      mockFetch(null, false, 404);
      const onProgress = vi.fn();

      await expect(DeviceCatalogService.loadFromGitHub(onProgress)).rejects.toThrow('HTTP 404: Not Found');
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'HTTP 404: Not Found' })
      );
    });

    it('should throw an error if the fetched data is not an array', async () => {
      mockFetch({});
      const onProgress = vi.fn();

      await expect(DeviceCatalogService.loadFromGitHub(onProgress)).rejects.toThrow('No devices found in catalog');
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No devices found in catalog' })
      );
    });

    it('should throw an error if fetching fails', async () => {
      const error = new Error('Network error');
      mockFetchError(error);
      const onProgress = vi.fn();

      await expect(DeviceCatalogService.loadFromGitHub(onProgress)).rejects.toThrow('Network error');
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Network error' })
      );
    });

    it('should call onProgress with correct states', async () => {
        const mockDevices = [{ name: 'Test Device' }];
        mockFetch(mockDevices);
        const onProgress = vi.fn();

        await DeviceCatalogService.loadFromGitHub(onProgress);

        expect(onProgress).toHaveBeenCalledWith({ isLoading: true, progress: 10, message: 'Connecting to device catalog...', error: null });
        expect(onProgress).toHaveBeenCalledWith({ isLoading: true, progress: 30, message: 'Downloading device data...', error: null });
        expect(onProgress).toHaveBeenCalledWith({ isLoading: true, progress: 60, message: 'Processing device catalog...', error: null });
        expect(onProgress).toHaveBeenCalledWith({ isLoading: true, progress: 80, message: 'Validating device data...', error: null });
        expect(onProgress).toHaveBeenCalledWith({ isLoading: true, progress: 90, message: 'Finalizing catalog...', error: null });
        expect(onProgress).toHaveBeenCalledWith({ isLoading: false, progress: 100, message: 'Loaded 1 devices successfully', error: null });
      });
  });

  describe('checkCatalogAvailability', () => {
    it('should return true if the catalog is available', async () => {
        mockFetch(null, true);
        const isAvailable = await DeviceCatalogService.checkCatalogAvailability();
        expect(isAvailable).toBe(true);
    });

    it('should return false if the catalog is not available', async () => {
        mockFetch(null, false);
        const isAvailable = await DeviceCatalogService.checkCatalogAvailability();
        expect(isAvailable).toBe(false);
    });

    it('should return false if fetch throws an error', async () => {
        mockFetchError(new Error('Network error'));
        const isAvailable = await DeviceCatalogService.checkCatalogAvailability();
        expect(isAvailable).toBe(false);
    });
  });
});
