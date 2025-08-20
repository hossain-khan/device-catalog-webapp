import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCatalogLoader } from './useCatalogLoader';
import { DeviceCatalogService } from '@/services/deviceCatalogService';
import { useKV } from '@/hooks/useKV';

// Mock DeviceCatalogService
vi.mock('@/services/deviceCatalogService', () => ({
  DeviceCatalogService: {
    loadFromGitHub: vi.fn(),
  },
}));

// Mock useKV
vi.mock('@/hooks/useKV', () => ({
  useKV: vi.fn(),
}));

describe('useCatalogLoader', () => {
  let mockSetCatalogDevices: vi.Mock;
  let mockSetHasAttemptedLoad: vi.Mock;
  let mockCatalogDevices: any[] = [];
  let mockHasAttemptedLoad = false;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSetCatalogDevices = vi.fn((updater) => {
      mockCatalogDevices = typeof updater === 'function' ? updater(mockCatalogDevices) : updater;
    });
    mockSetHasAttemptedLoad = vi.fn((updater) => {
      mockHasAttemptedLoad = typeof updater === 'function' ? updater(mockHasAttemptedLoad) : updater;
    });

    (useKV as vi.Mock).mockImplementation((key: string, initialValue: any) => {
      if (key === 'catalog-devices') {
        mockCatalogDevices = []; // Start with empty catalog
        return [mockCatalogDevices, mockSetCatalogDevices];
      }
      if (key === 'catalog-load-attempted') {
        mockHasAttemptedLoad = false; // Start with no load attempt
        return [mockHasAttemptedLoad, mockSetHasAttemptedLoad];
      }
      if (key === 'uploaded-devices') {
        return [[], vi.fn()];
      }
      return [initialValue, vi.fn()];
    });

    (DeviceCatalogService.loadFromGitHub as vi.Mock).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should successfully load the catalog on mount', async () => {
    const mockDevices = [{ name: 'Test Device' }];
    (DeviceCatalogService.loadFromGitHub as vi.Mock).mockResolvedValue(mockDevices);

    const { result } = renderHook(() => useCatalogLoader());

    expect(result.current.loadingState.isLoading).toBe(false);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loadingState.isLoading).toBe(false);
    expect(mockSetCatalogDevices).toHaveBeenCalledWith(mockDevices);
    expect(mockSetHasAttemptedLoad).toHaveBeenCalledWith(true);
  });

  it('should handle errors during catalog load on mount', async () => {
    const error = new Error('Failed to load');
    (DeviceCatalogService.loadFromGitHub as vi.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useCatalogLoader());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loadingState.isLoading).toBe(false);
    expect(mockSetCatalogDevices).not.toHaveBeenCalled();
    expect(mockSetHasAttemptedLoad).toHaveBeenCalledWith(true);
  });

  it('should retry loading the catalog', async () => {
    (DeviceCatalogService.loadFromGitHub as vi.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useCatalogLoader());

    await act(async () => {
        result.current.retryLoad();
    });

    expect(DeviceCatalogService.loadFromGitHub).toHaveBeenCalledTimes(1);
  });

  it('should skip loading the catalog', async () => {
    const { result } = renderHook(() => useCatalogLoader());

    await act(async () => {
      result.current.skipLoad();
    });

    expect(result.current.loadingState.isLoading).toBe(false);
    expect(mockSetHasAttemptedLoad).toHaveBeenCalledWith(true);
  });

  it('should clear the catalog', async () => {
    const { result } = renderHook(() => useCatalogLoader());

    await act(async () => {
      result.current.clearCatalog();
    });

    expect(mockSetCatalogDevices).toHaveBeenCalledWith([]);
    expect(mockSetHasAttemptedLoad).toHaveBeenCalledWith(false);
  });
});
