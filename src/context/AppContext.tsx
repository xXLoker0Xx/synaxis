import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
  label: string;
}

interface AppContextValue {
  coordinates: Coordinates;
  locationStatus: string;
  requestLocation: () => Promise<void>;
}

const DEFAULT_COORDINATES: Coordinates = {
  latitude: 19.4326,
  longitude: -99.1332,
  label: 'Ciudad de México · ubicación aproximada',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDINATES);
  const [locationStatus, setLocationStatus] = useState('Usando ubicación de referencia');

  const requestLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationStatus('Permiso de ubicación denegado · usando referencia');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: 'Ubicación GPS actual',
      });
      setLocationStatus('GPS actualizado');
    } catch {
      setLocationStatus('No se pudo obtener GPS · usando referencia');
    }
  };

  const value = useMemo(() => ({ coordinates, locationStatus, requestLocation }), [coordinates, locationStatus]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useBioLunar(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useBioLunar debe usarse dentro de AppProvider');
  return context;
}
