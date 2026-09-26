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
  const response = await fetch(`/api/planet-positions?${params.toString()}`, { signal });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload
      ? String(payload.error)
      : 'No se pudo consultar la efeméride planetaria.';
    throw new Error(message);
  }

  return payload as PlanetPositionsResponse;
}
