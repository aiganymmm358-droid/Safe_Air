import React, { createContext, useContext, ReactNode } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

type GeolocationContextType = ReturnType<typeof useGeolocation>;

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const geolocation = useGeolocation();

  return (
    <GeolocationContext.Provider value={geolocation}>
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocationContext() {
  const context = useContext(GeolocationContext);
  if (context === undefined) {
    throw new Error('useGeolocationContext must be used within a GeolocationProvider');
  }
  return context;
}
