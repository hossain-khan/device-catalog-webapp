import { createContext, useContext, ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';
import { AndroidDevice } from '@/types/device';

interface ComparisonContextType {
  comparedDevices: AndroidDevice[];
  addToComparison: (device: AndroidDevice) => void;
  removeFromComparison: (deviceId: string) => void;
  clearComparison: () => void;
  isInComparison: (deviceId: string) => boolean;
  canAddToComparison: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

interface ComparisonProviderProps {
  children: ReactNode;
}

export const ComparisonProvider = ({ children }: ComparisonProviderProps) => {
  const [comparedDevices, setComparedDevices] = useKV<AndroidDevice[]>('compared-devices', []);

  const addToComparison = (device: AndroidDevice) => {
    setComparedDevices(current => {
      const deviceId = `${device.brand}-${device.device}`;
      const exists = current.some(d => `${d.brand}-${d.device}` === deviceId);
      if (!exists && current.length < 4) {
        return [...current, device];
      }
      return current;
    });
  };

  const removeFromComparison = (deviceId: string) => {
    setComparedDevices(current => 
      current.filter(d => `${d.brand}-${d.device}` !== deviceId)
    );
  };

  const clearComparison = () => {
    setComparedDevices([]);
  };

  const isInComparison = (deviceId: string) => {
    return comparedDevices.some(d => `${d.brand}-${d.device}` === deviceId);
  };

  const canAddToComparison = comparedDevices.length < 4;

  return (
    <ComparisonContext.Provider value={{
      comparedDevices,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison,
      canAddToComparison
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};