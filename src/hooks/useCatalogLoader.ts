import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@/hooks/useKV';
import { AndroidDevice } from '@/types/device';
import { DeviceCatalogService, LoadingState } from '@/services/deviceCatalogService';

interface CatalogLoadingHook {
  devices: AndroidDevice[];
  loadingState: LoadingState;
  isInitialLoad: boolean;
  retryLoad: () => void;
  skipLoad: () => void;
  clearCatalog: () => void;
}

/**
 * Hook to manage device catalog loading with automatic retry and fallback
 */
export function useCatalogLoader(): CatalogLoadingHook {
  const [catalogDevices, setCatalogDevices] = useKV<AndroidDevice[]>('catalog-devices', []);
  const [uploadedDevices, ] = useKV<AndroidDevice[]>('uploaded-devices', []);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useKV<boolean>('catalog-load-attempted', false);
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    error: null
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Determine which devices to use (priority: uploaded > catalog)
  const devices = uploadedDevices.length > 0 
    ? uploadedDevices 
    : catalogDevices.length > 0 
      ? catalogDevices 
      : [];

  const loadCatalog = useCallback(async () => {
    try {
      setLoadingState({
        isLoading: true,
        progress: 0,
        message: 'Starting catalog load...',
        error: null
      });

      const devices = await DeviceCatalogService.loadFromGitHub((state) => {
        setLoadingState(state);
      });

      setCatalogDevices(devices);
      setHasAttemptedLoad(true);
      
      // Small delay to show success message
      setTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          isLoading: false
        }));
        setIsInitialLoad(false);
      }, 500);

    } catch {
      // Error is already handled in the service and reflected in loadingState
      setHasAttemptedLoad(true);

      // Also ensure loading is stopped on error
      setLoadingState(prev => ({
        ...prev,
        isLoading: false
      }));

      setTimeout(() => {
        setIsInitialLoad(false);
      }, 100);
    }
  }, [setCatalogDevices, setHasAttemptedLoad]);

  const retryLoad = useCallback(() => {
    loadCatalog();
  }, [loadCatalog]);

  const skipLoad = useCallback(() => {
    setHasAttemptedLoad(true);
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: '',
      error: null
    });
    setIsInitialLoad(false);
  }, [setHasAttemptedLoad]);

  const clearCatalog = useCallback(() => {
    setCatalogDevices([]);
    setHasAttemptedLoad(false);
  }, [setCatalogDevices, setHasAttemptedLoad]);

  // Auto-load catalog on first app start
  useEffect(() => {
    if (!hasAttemptedLoad && catalogDevices.length === 0) {
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        loadCatalog();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // If we've already loaded or have cached data, don't show loading
      setIsInitialLoad(false);
    }
  }, [hasAttemptedLoad, catalogDevices.length, loadCatalog]);

  return {
    devices,
    loadingState,
    isInitialLoad,
    retryLoad,
    skipLoad,
    clearCatalog
  };
}