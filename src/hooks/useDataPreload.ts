import { useState, useEffect } from 'react';
import { AndroidDevice } from '@/types/device';
import { preloadDeviceCatalogWithProgress } from '@/services/dataLoader';

export interface UseDataPreloadResult {
  isLoading: boolean;
  progress: number;
  error: string | null;
  data: AndroidDevice[] | null;
  deviceCount: number;
}

export function useDataPreload(): UseDataPreloadResult {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AndroidDevice[] | null>(null);
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);

        const devices = await preloadDeviceCatalogWithProgress((progressValue) => {
          setProgress(progressValue);
        });

        setData(devices);
        setDeviceCount(devices.length);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load device catalog');
        setIsLoading(false);
        console.error('Failed to preload device catalog:', err);
      }
    };

    loadData();
  }, []);

  return {
    isLoading,
    progress,
    error,
    data,
    deviceCount
  };
}
