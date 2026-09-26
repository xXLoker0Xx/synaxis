import * as SunCalc from 'suncalc';

const SYNODIC_MONTH_DAYS = 29.530588853;
const OBLIQUITY_DEG = 23.4397;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export interface CircadianTimeline {
  dawn: Date | null;
  sunrise: Date | null;
  morningLightWindow: { start: Date; end: Date } | null;
  solarNoon: Date | null;
  caffeineCutoff: Date | null;
  sunset: Date | null;
  dusk: Date | null;
  blueLightWindDown: { start: Date; end: Date } | null;
  daylightProgress: number;
}

export type LunarOctant =
  | 'Luna Nueva'
  | 'Creciente'
  | 'Cuarto Creciente'
  | 'Gibosa Creciente'
  | 'Llena'
  | 'Diseminadora'
  | 'Cuarto Menguante'
  | 'Balsámica';

export type ZodiacSign =
  | 'Aries' | 'Tauro' | 'Géminis' | 'Cáncer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Escorpio' | 'Sagitario' | 'Capricornio' | 'Acuario' | 'Piscis';

export interface LunarCycleState {
  elongationDegrees: number;
  illumination: number;
  phaseProgress: number;
  cycleDay: number;
  cycleLengthDays: number;
  octant: LunarOctant;
  zodiacSign: ZodiacSign;
  waxing: boolean;
}

const zodiacSigns: readonly ZodiacSign[] = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis',
];
const octants: readonly LunarOctant[] = [
  'Luna Nueva', 'Creciente', 'Cuarto Creciente', 'Gibosa Creciente',
  'Llena', 'Diseminadora', 'Cuarto Menguante', 'Balsámica',
];

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

/**
 * Approximate apparent geocentric ecliptic longitude of the Sun (Meeus low-order terms).
 * The returned tropical longitude is sufficient to identify the tropical zodiac sign.
 */
function solarEclipticLongitude(date: Date): number {
  const julianDay = date.getTime() / 86_400_000 + 2_440_587.5;
  const centuries = (julianDay - 2_451_545) / 36_525;
  const meanLongitude = normalizeDegrees(280.46646 + centuries * (36_000.76983 + 0.0003032 * centuries));
  const meanAnomaly = normalizeDegrees(357.52911 + centuries * (35_999.05029 - 0.0001537 * centuries)) * DEG_TO_RAD;
  const equationOfCenter = (1.914602 - centuries * (0.004817 + 0.000014 * centuries)) * Math.sin(meanAnomaly)
    + (0.019993 - 0.000101 * centuries) * Math.sin(2 * meanAnomaly)
    + 0.000289 * Math.sin(3 * meanAnomaly);
  return normalizeDegrees(meanLongitude + equationOfCenter);
}

/** Low-order Meeus lunar longitude series (dominant periodic terms, degrees). */
function lunarEclipticLongitude(date: Date): number {
  const julianDay = date.getTime() / 86_400_000 + 2_440_587.5;
  const centuries = (julianDay - 2_451_545) / 36_525;
  const t2 = centuries * centuries;
  const t3 = t2 * centuries;
  const t4 = t3 * centuries;
  const meanLongitude = normalizeDegrees(218.3164477 + 481_267.88123421 * centuries - 0.0015786 * t2 + t3 / 538_841 - t4 / 65_194_000);
  const elongation = normalizeDegrees(297.8501921 + 445_267.1114034 * centuries - 0.0018819 * t2 + t3 / 545_868 - t4 / 113_065_000) * DEG_TO_RAD;
  const solarAnomaly = normalizeDegrees(357.5291092 + 35_999.0502909 * centuries - 0.0001536 * t2 + t3 / 24_490_000) * DEG_TO_RAD;
  const lunarAnomaly = normalizeDegrees(134.9633964 + 477_198.8675055 * centuries + 0.0087414 * t2 + t3 / 69_699 - t4 / 14_712_000) * DEG_TO_RAD;
  const argumentLatitude = normalizeDegrees(93.272095 + 483_202.0175233 * centuries - 0.0036539 * t2 - t3 / 3_526_000 + t4 / 863_310_000) * DEG_TO_RAD;
  const e = 1 - 0.002516 * centuries - 0.0000074 * t2;
  const sin = (angle: number) => Math.sin(angle);
  const correction = 6.289 * sin(lunarAnomaly)
    + 1.274 * sin(2 * elongation - lunarAnomaly)
    + 0.658 * sin(2 * elongation)
    + 0.214 * sin(2 * lunarAnomaly)
    - 0.186 * e * sin(solarAnomaly)
    - 0.114 * sin(2 * argumentLatitude)
    + 0.059 * sin(2 * elongation - 2 * lunarAnomaly)
    + 0.057 * e * sin(2 * elongation - solarAnomaly - lunarAnomaly)
    + 0.053 * sin(2 * elongation + lunarAnomaly)
    + 0.046 * e * sin(2 * elongation - solarAnomaly)
    + 0.041 * e * sin(solarAnomaly - lunarAnomaly)
    - 0.035 * sin(elongation)
    - 0.031 * e * sin(solarAnomaly + lunarAnomaly)
    - 0.015 * sin(2 * argumentLatitude - 2 * elongation)
    + 0.011 * sin(2 * elongation - 4 * lunarAnomaly);
  return normalizeDegrees(meanLongitude + correction);
}

/** Solar events are calculated locally for the supplied coordinates and calendar date. */
export function getCircadianTimeline(lat: number, lon: number, date: Date): CircadianTimeline {
  const times = SunCalc.getTimes(date, lat, lon);
  const sunrise = times.sunrise && Number.isFinite(times.sunrise.getTime()) ? times.sunrise : null;
  const sunset = times.sunset && Number.isFinite(times.sunset.getTime()) ? times.sunset : null;
  const dawn = times.dawn && Number.isFinite(times.dawn.getTime()) ? times.dawn : null;
  const dusk = times.dusk && Number.isFinite(times.dusk.getTime()) ? times.dusk : null;
  const solarNoon = times.solarNoon && Number.isFinite(times.solarNoon.getTime()) ? times.solarNoon : null;
  // Default assumption: bedtime at 22:30 local time, so cutoff is 10 hours earlier.
  // A future profile setting can replace this fixed bedtime assumption.
  const caffeineCutoff = new Date(date);
  caffeineCutoff.setHours(12, 30, 0, 0);
  const now = date.getTime();
  const daylightProgress = sunrise && sunset && sunset > sunrise
    ? clamp((now - sunrise.getTime()) / (sunset.getTime() - sunrise.getTime()), 0, 1)
    : 0;

  return {
    dawn,
    sunrise,
    morningLightWindow: sunrise ? { start: sunrise, end: addMinutes(sunrise, 30) } : null,
    solarNoon,
    caffeineCutoff,
    sunset,
    dusk,
    blueLightWindDown: sunset ? { start: sunset, end: addMinutes(sunset, 90) } : null,
    daylightProgress,
  };
}

/** Backward-compatible spelling matching the original product brief. */
export const getCiracdianTimeline = getCircadianTimeline;

/**
 * Lunar phase uses SunCalc's locally-computed illumination. Elongation and lunar
 * tropical sign are derived from geocentric ecliptic longitudes, not an API.
 */
export function getLunarCycleState(date: Date): LunarCycleState {
  const illumination = SunCalc.getMoonIllumination(date);
  const phaseProgress = normalizeDegrees(illumination.phase * 360) / 360;
  const elongationDegrees = normalizeDegrees(lunarEclipticLongitude(date) - solarEclipticLongitude(date));
  const octantIndex = Math.floor((elongationDegrees + 22.5) / 45) % 8;
  const lunarLongitude = lunarEclipticLongitude(date);

  return {
    elongationDegrees,
    illumination: clamp(illumination.fraction, 0, 1),
    phaseProgress,
    cycleDay: phaseProgress * SYNODIC_MONTH_DAYS + 1,
    cycleLengthDays: SYNODIC_MONTH_DAYS,
    octant: octants[octantIndex],
    zodiacSign: zodiacSigns[Math.floor(lunarLongitude / 30) % 12],
    waxing: illumination.phase < 0.5,
  };
}
