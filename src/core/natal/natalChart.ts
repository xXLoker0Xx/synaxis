import * as SunCalc from 'suncalc';

/**
 * Signos del Zodíaco Tropical (12)
 * El zodiaco se divide en 30° por signo, comenzando en el Equinoccio de Primavera (0° = Aries)
 */
export type ZodiacSign = 'Aries' | 'Tauro' | 'Géminis' | 'Cáncer' | 'Leo' | 'Virgo' | 'Libra' | 'Escorpio' | 'Sagitario' | 'Capricornio' | 'Acuario' | 'Piscis';

export type House = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Cuerpos celestes utilizados en la carta natal
 */
export type PlanetaryBody = 'Sol' | 'Luna' | 'Mercurio' | 'Venus' | 'Marte' | 'Júpiter' | 'Saturno' | 'Urano' | 'Neptuno' | 'Plutón';

/**
 * Posición de un planeta o punto sensible en la carta natal
 */
export interface PlanetaryPosition {
  body: PlanetaryBody;
  zodiacSign: ZodiacSign;
  degreesInSign: number; // 0-30
  totalDegrees: number; // 0-360
  house?: House;
  retrograde?: boolean;
}

/**
 * Puntos sensibles de la carta (Ascendente, MC, etc.)
 */
export interface ChartAngles {
  ascendant: {
    sign: ZodiacSign;
    degrees: number;
  };
  midheaven: {
    sign: ZodiacSign;
    degrees: number;
  };
  descendant: {
    sign: ZodiacSign;
    degrees: number;
  };
  imumCoeli: {
    sign: ZodiacSign;
    degrees: number;
  };
}

/**
 * Carta natal completa
 */
export interface NatalChart {
  birthDate: Date;
  birthLocation: { latitude: number; longitude: number; name: string };
  solarSign: ZodiacSign;
  lunarSign: ZodiacSign;
  ascendant: ZodiacSign;
  planets: PlanetaryPosition[];
  angles: ChartAngles;
}

/**
 * Convierte grados decimales a signo zodiacal y grados dentro del signo
 */
export function degreesToZodiacSign(degrees: number): { sign: ZodiacSign, degreesInSign: number } {
  const normalized = ((degrees % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const zodiacSigns: ZodiacSign[] = [
    'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
    'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
  ];
  
  return {
    sign: zodiacSigns[Math.min(signIndex, 11)],
    degreesInSign: normalized % 30,
  };
}

/**
 * Calcula el Ascendente basado en la hora de nacimiento
 * El Ascendente es el signo zodiacal que estaba en el horizonte oriental en el momento del nacimiento
 * Simplificado: usa la ecuación del tiempo y la posición del Sol al mediodía
 */
export function calculateAscendant(
  birthDate: Date,
  latitude: number,
  longitude: number
): ZodiacSign {
  // Para un cálculo simplificado, usamos la posición del Sol y ajustamos por la hora local
  const sun = SunCalc.getPosition(birthDate, latitude, longitude);
  
  // El Ascendente es aproximadamente 90° antes del MC (Midheaven)
  // MC se estima como la longitud del Sol a mediodía
  // Esta es una aproximación; un cálculo exacto requeriría tablas estelares
  const approximateAscendant = (sun.azimuth * 180 / Math.PI + 90 + 180) % 360;
  
  return degreesToZodiacSign(approximateAscendant).sign;
}

/**
 * Calcula el signo solar basado en la fecha de nacimiento
 * El signo solar es el signo zodiacal en el que estaba el Sol al nacer
 */
export function calculateSolarSign(birthDate: Date): ZodiacSign {
  // Fechas aproximadas de cambio de signo (para el Zodíaco Tropical)
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Días del año en los que cambia cada signo (aprox.)
  const signBoundaries = [
    0,   // Aries comienza ~21 de marzo (día 80)
    80,  // Tauro comienza ~20 de abril (día 110)
    110, // Géminis comienza ~21 de mayo (día 141)
    141, // Cáncer comienza ~21 de junio (día 172)
    172, // Leo comienza ~23 de julio (día 204)
    204, // Virgo comienza ~23 de agosto (día 235)
    235, // Libra comienza ~23 de septiembre (día 266)
    266, // Escorpio comienza ~23 de octubre (día 296)
    296, // Sagitario comienza ~22 de noviembre (día 327)
    327, // Capricornio comienza ~22 de diciembre (día 355)
    355, // Acuario comienza ~20 de enero (día 20 del año siguiente)
    20,  // Piscis comienza ~19 de febrero (día 50)
  ];
  
  const zodiacSigns: ZodiacSign[] = [
    'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
    'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
  ];
  
  const adjustedDay = dayOfYear < 80 ? dayOfYear + 365 : dayOfYear;
  
  for (let i = 0; i < signBoundaries.length; i++) {
    const nextI = (i + 1) % signBoundaries.length;
    if (adjustedDay >= signBoundaries[i] && adjustedDay < signBoundaries[nextI]) {
      return zodiacSigns[i];
    }
  }
  
  return 'Aries'; // fallback
}

/**
 * Calcula el signo lunar basado en la fase y ciclo lunar
 * Usa el mismo patrón que el signo solar, pero el signo lunar es donde estaba la Luna
 */
export function calculateLunarSign(birthDate: Date): ZodiacSign {
  // Para un cálculo simplificado, usamos la fecha + una aproximación cíclica
  // La Luna se mueve a través del zodiaco aproximadamente cada 29.5 días
  const epochDate = new Date(1900, 0, 1); // Referencia: Luna Nueva tropical
  const daysSinceEpoch = (birthDate.getTime() - epochDate.getTime()) / 86400000;
  const lunarCycle = 29.530588; // Ciclo lunar sinódico
  const positionInCycle = (daysSinceEpoch % lunarCycle) / lunarCycle;
  const lunarDegrees = positionInCycle * 360;
  
  return degreesToZodiacSign(lunarDegrees).sign;
}

/**
 * Simula un conjunto básico de posiciones planetarias
 * Para un cálculo completo se usarían efeméridas astronómicas reales
 */
export function calculatePlanetaryPositions(
  birthDate: Date,
  _latitude: number,
  _longitude: number
): PlanetaryPosition[] {
  // Para este MVP, generamos posiciones simuladas pero coherentes
  // Un sistema real usaría librerías como `astronomy-engine` o acceso a efeméridas
  
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = birthDate.getTime();
  
  const planets: PlanetaryBody[] = ['Mercurio', 'Venus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón'];
  
  return planets.map((planet, index) => {
    // Simular movimiento planetario con velocidades realistas (grados/día)
    const speeds: Record<PlanetaryBody, number> = {
      Sol: 1, Luna: 13.2, Mercurio: 1.3, Venus: 1.6, Marte: 0.5, Júpiter: 0.08, Saturno: 0.03, Urano: 0.01, Neptuno: 0.01, Plutón: 0.002
    };
    
    const basePosition = (seed / 1000 + index * 30) % 360;
    const totalDegrees = (basePosition + dayOfYear * (speeds[planet] || 0.1)) % 360;
    
    const { sign, degreesInSign } = degreesToZodiacSign(totalDegrees);
    
    return {
      body: planet,
      zodiacSign: sign,
      degreesInSign,
      totalDegrees,
      retrograde: Math.random() < 0.3, // Aproximadamente 30% de probabilidad
    };
  });
}

/**
 * Calcula los ángulos principales de la carta: Ascendente, MC, Descendente, IC
 */
export function calculateChartAngles(
  birthDate: Date,
  latitude: number,
  longitude: number
): ChartAngles {
  const ascendantSign = calculateAscendant(birthDate, latitude, longitude);
  
  // MC (Midheaven): aproximadamente opuesto al IC
  // Para simplificar, usamos la posición del Sol como referencia
  const sun = SunCalc.getPosition(birthDate, latitude, longitude);
  const mcDegrees = (sun.azimuth * 180 / Math.PI + 90) % 360;
  const { sign: mcSign, degreesInSign: mcDegreesInSign } = degreesToZodiacSign(mcDegrees);
  
  // Descendante: opuesto al Ascendante (180°)
  const descendantDegrees = (degreesToZodiacSign(0).sign === ascendantSign ? 180 : 0); // placeholder
  const { sign: descendantSign } = degreesToZodiacSign(descendantDegrees);
  
  // IC: opuesto al MC
  const icDegrees = (mcDegrees + 180) % 360;
  const { sign: icSign, degreesInSign: icDegreesInSign } = degreesToZodiacSign(icDegrees);
  
  return {
    ascendant: { sign: ascendantSign, degrees: 0 },
    midheaven: { sign: mcSign, degrees: mcDegreesInSign },
    descendant: { sign: descendantSign, degrees: 0 },
    imumCoeli: { sign: icSign, degrees: icDegreesInSign },
  };
}

/**
 * Calcula la carta natal completa
 */
export function calculateNatalChart(
  birthDate: Date,
  latitude: number,
  longitude: number,
  locationName: string
): NatalChart {
  const solarSign = calculateSolarSign(birthDate);
  const lunarSign = calculateLunarSign(birthDate);
  const ascendant = calculateAscendant(birthDate, latitude, longitude);
  const planets = calculatePlanetaryPositions(birthDate, latitude, longitude);
  const angles = calculateChartAngles(birthDate, latitude, longitude);
  
  return {
    birthDate,
    birthLocation: { latitude, longitude, name: locationName },
    solarSign,
    lunarSign,
    ascendant,
    planets,
    angles,
  };
}
