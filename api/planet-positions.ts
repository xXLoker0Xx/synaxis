interface PlanetDefinition {
  id: string;
  name: string;
  symbol: string;
}

interface HorizonsPayload {
  signature?: { source?: string; version?: string };
  result?: string;
  error?: string;
}

interface VercelRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
}

interface PlanetResult extends PlanetDefinition {
  azimuthDegrees: number | null;
  elevationDegrees: number | null;
  constellation: string | null;
  status: 'ok' | 'unavailable' | 'reference';
  error?: string;
}

const HORIZONS_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const PLANETS: readonly PlanetDefinition[] = [
  { id: '199', name: 'Mercurio', symbol: '☿' },
  { id: '299', name: 'Venus', symbol: '♀' },
  { id: '499', name: 'Marte', symbol: '♂' },
  { id: '599', name: 'Júpiter', symbol: '♃' },
  { id: '699', name: 'Saturno', symbol: '♄' },
  { id: '799', name: 'Urano', symbol: '♅' },
  { id: '899', name: 'Neptuno', symbol: '♆' },
];

const EARTH_REFERENCE: PlanetResult = {
  id: '399',
  name: 'Tierra',
  symbol: '⊕',
  azimuthDegrees: null,
  elevationDegrees: null,
  constellation: null,
  status: 'reference',
};

function parseCsvRow(row: string): string[] {
  const columns: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"') {
      if (quoted && row[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      columns.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }
  columns.push(value.trim());
  return columns;
}

function numericColumn(value: string | undefined): number | null {
  if (!value || value === '*' || value.toLowerCase() === 'n.a.') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseHorizonsResult(payload: HorizonsPayload): Pick<PlanetResult, 'azimuthDegrees' | 'elevationDegrees' | 'constellation'> {
  if (payload.error) throw new Error(payload.error);
  if (!payload.signature?.source?.includes('Horizons') || !payload.signature.version || !/^1\.\d+$/.test(payload.signature.version) || !payload.result) {
    throw new Error('La respuesta de Horizons no tiene el formato esperado.');
  }

  const start = payload.result.indexOf('$$SOE');
  const end = payload.result.indexOf('$$EOE');
  if (start < 0 || end <= start) throw new Error('Horizons no devolvió una posición para esta fecha.');
  const row = payload.result.slice(start + 5, end).split(/\r?\n/).find((line) => line.trim());
  if (!row) throw new Error('Horizons devolvió una efeméride vacía.');

  // Horizons CSV observer output: time, Sun/Moon markers, azimuth, elevation,
  // range, range-rate, Sun-target-observer angle, and IAU constellation code.
  const columns = parseCsvRow(row);
  if (columns.length < 9) throw new Error('No se pudieron interpretar las columnas de la respuesta de Horizons.');
  return {
    azimuthDegrees: numericColumn(columns[3]),
    elevationDegrees: numericColumn(columns[4]),
    constellation: columns[8] && columns[8] !== 'n.a.' ? columns[8] : null,
  };
}

async function fetchPlanet(
  planet: PlanetDefinition,
  latitude: number,
  longitude: number,
  requestedAt: Date,
): Promise<PlanetResult> {
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: `'${planet.id}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'OBSERVER',
    CENTER: 'coord',
    COORD_TYPE: 'GEODETIC',
    SITE_COORD: `'${longitude},${latitude},0'`,
    TLIST: `'${requestedAt.toISOString().slice(0, 16).replace('T', ' ')}'`,
    QUANTITIES: "'4,20,24,29'",
    ANG_FORMAT: 'DEG',
    CSV_FORMAT: 'YES',
  });
  const response = await fetch(`${HORIZONS_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(18_000),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Horizons respondió HTTP ${response.status}.`);

  const payload = await response.json() as HorizonsPayload;
  return { ...planet, ...parseHorizonsResult(payload), status: 'ok' };
}

async function fetchInBatches(latitude: number, longitude: number, requestedAt: Date): Promise<PlanetResult[]> {
  const results: PlanetResult[] = [];
  const batchSize = 4;
  for (let start = 0; start < PLANETS.length; start += batchSize) {
    const batch = PLANETS.slice(start, start + batchSize);
    const batchResults = await Promise.all(batch.map(async (planet): Promise<PlanetResult> => {
      try {
        return await fetchPlanet(planet, latitude, longitude, requestedAt);
      } catch (error) {
        return {
          ...planet,
          azimuthDegrees: null,
          elevationDegrees: null,
          constellation: null,
          status: 'unavailable',
          error: error instanceof Error ? error.message : 'Error al consultar este planeta.',
        };
      }
    }));
    results.push(...batchResults);
  }
  return results;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Método no permitido.' });
  }

  const latitude = Number(request.query.lat);
  const longitude = Number(request.query.lon);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return response.status(400).json({ error: 'Indica latitud y longitud válidas para calcular las posiciones.' });
  }

  const requestedAt = new Date();
  const positions = await fetchInBatches(latitude, longitude, requestedAt);
  if (positions.every((position) => position.status === 'unavailable')) {
    return response.status(502).json({ error: 'JPL Horizons no está disponible ahora. Inténtalo de nuevo en unos minutos.' });
  }

  response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return response.status(200).json({
    source: 'NASA/JPL Horizons API',
    requestedAt: requestedAt.toISOString(),
    observer: { latitude, longitude },
    positions: [EARTH_REFERENCE, ...positions],
  });
}
