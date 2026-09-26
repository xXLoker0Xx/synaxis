import { Platform } from 'react-native';

export interface PlanetPosition {
  id: string;
  name: string;
  symbol: string;
  azimuthDegrees: number | null;
  elevationDegrees: number | null;
  constellation: string | null;
  status: 'ok' | 'unavailable' | 'reference';
  error?: string;
}

export interface PlanetPositionsResponse {
  source: string;
  requestedAt: string;
  observer: { latitude: number; longitude: number };
  positions: PlanetPosition[];
}

export async function fetchPlanetPositions(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<PlanetPositionsResponse> {
  const params = new URLSearchParams({ lat: String(latitude), lon: String(longitude) });
  const localProxy = typeof __DEV__ !== 'undefined' && __DEV__ && Platform.OS === 'web'
    ? 'http://localhost:3001'
    : '';
  let response: Response;
  try {
    response = await fetch(`${localProxy}/api/planet-positions?${params.toString()}`, { signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new Error(localProxy
      ? 'No conecta el proxy local de Horizons. Inicia npm run dev:api y vuelve a intentar.'
      : 'No conecta con Synaxis. Comprueba la conexión o vuelve a intentarlo.');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    if (response.status === 404) throw new Error('El proxy /api/planet-positions no está disponible. En local inicia npm run dev:api; en Vercel revisa que api/planet-positions.ts se haya desplegado.');
    throw new Error(`La respuesta del servicio no es JSON válido (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const body = typeof payload === 'object' && payload !== null
      ? payload as { code?: string; error?: string; details?: string[] }
      : {};
    const details = body.details?.join('; ') ?? '';
    const message = body.code === 'horizons_unavailable'
      ? `JPL Horizons está temporalmente saturado o no disponible. ${details} Inténtalo de nuevo en unos minutos.`
      : body.code === 'invalid_coordinates'
        ? 'Las coordenadas del observador no son válidas.'
        : body.error ?? 'No se pudo consultar la efeméride planetaria.';
    throw new Error(message);
  }

  return payload as PlanetPositionsResponse;
}
