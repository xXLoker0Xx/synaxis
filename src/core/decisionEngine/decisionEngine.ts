import { format, set } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getCircadianTimeline, getLunarCycleState, type LunarOctant } from '../astronomy/astronomy';

export type DecisionCategory =
  | 'FINANZAS_CONTRATOS'
  | 'CREATIVIDAD_IDEACION'
  | 'COMUNICACION_CONFLICTO'
  | 'DESCANSO_RETIRO'
  | 'AUDITORIA_CIERRE';

export type RecommendationLevel = 'FAVORABLE' | 'PROCEDER_CON_CAUTELA' | 'PAUSA_ESTRATEGICA';

export interface DecisionInput {
  category: DecisionCategory;
  userEnergyLevel: number;
  currentTime: Date;
  lat: number;
  lon: number;
}

export interface DecisionContext {
  viabilityScore: number;
  recommendationLevel: RecommendationLevel;
  biologicalContext: string;
  archetypalContext: string;
  bestWindowToday: string;
}

interface CategoryRule {
  label: string;
  preferredHours: [number, number];
  idealEnergy: number;
  waxingBonus: number;
  waningBonus: number;
  fullMoonBonus: number;
  newMoonBonus: number;
}

const categoryRules: Record<DecisionCategory, CategoryRule> = {
  FINANZAS_CONTRATOS: {
    label: 'finanzas y contratos', preferredHours: [10, 13], idealEnergy: 4,
    waxingBonus: 5, waningBonus: 0, fullMoonBonus: 0, newMoonBonus: -3,
  },
  CREATIVIDAD_IDEACION: {
    label: 'creatividad e ideación', preferredHours: [9, 12], idealEnergy: 3,
    waxingBonus: 9, waningBonus: 0, fullMoonBonus: 5, newMoonBonus: 3,
  },
  COMUNICACION_CONFLICTO: {
    label: 'comunicación de temas difíciles', preferredHours: [10, 12], idealEnergy: 4,
    waxingBonus: 2, waningBonus: 0, fullMoonBonus: -3, newMoonBonus: 0,
  },
  DESCANSO_RETIRO: {
    label: 'descanso y retiro', preferredHours: [20, 21], idealEnergy: 2,
    waxingBonus: 0, waningBonus: 6, fullMoonBonus: 0, newMoonBonus: 5,
  },
  AUDITORIA_CIERRE: {
    label: 'auditoría y cierre', preferredHours: [14, 16], idealEnergy: 3,
    waxingBonus: 0, waningBonus: 9, fullMoonBonus: 0, newMoonBonus: 4,
  },
};

const favorableOctants: Record<DecisionCategory, readonly LunarOctant[]> = {
  FINANZAS_CONTRATOS: ['Creciente', 'Cuarto Creciente', 'Gibosa Creciente'],
  CREATIVIDAD_IDEACION: ['Luna Nueva', 'Creciente', 'Cuarto Creciente', 'Llena'],
  COMUNICACION_CONFLICTO: ['Creciente', 'Diseminadora', 'Cuarto Menguante'],
  DESCANSO_RETIRO: ['Luna Nueva', 'Balsámica', 'Cuarto Menguante'],
  AUDITORIA_CIERRE: ['Diseminadora', 'Cuarto Menguante', 'Balsámica'],
};

const archetypeCopy: Record<LunarOctant, string> = {
  'Luna Nueva': 'Marco simbólico de inicio: úsalo para aclarar una intención pequeña, no como predicción.',
  'Creciente': 'Marco de crecimiento: explora una acción de bajo riesgo y observa qué aprende.',
  'Cuarto Creciente': 'Marco de ajuste: identifica el obstáculo concreto y prueba una alternativa.',
  'Gibosa Creciente': 'Marco de refinamiento: revisa detalles y prepara una versión más clara.',
  'Llena': 'Marco de culminación y perspectiva: separa los hechos de la intensidad del momento.',
  'Diseminadora': 'Marco de integración: comparte aprendizajes y contrasta tu lectura con evidencia.',
  'Cuarto Menguante': 'Marco de revisión: recorta compromisos innecesarios y prioriza lo esencial.',
  'Balsámica': 'Marco de cierre y pausa: deja espacio para descansar antes de iniciar otro ciclo.',
};

function biologicalReadout(hour: number, hasSunrise: boolean, hasSunset: boolean): string {
  if (!hasSunrise || !hasSunset) {
    return 'No hay salida y puesta solar convencionales para estas coordenadas/fecha. El consejo es orientativo; prioriza tu rutina y descanso habituales.';
  }
  if (hour >= 9 && hour < 12) {
    return 'Franja diurna de buena disponibilidad para tareas exigentes en muchas rutinas. La luz matutina apoya el anclaje del reloj biológico; no mide tus niveles hormonales individuales.';
  }
  if (hour >= 7 && hour < 9) {
    return 'La mañana temprana puede ser útil para activación gradual y exposición a luz exterior. Ajusta la carga a tu sueño y cronotipo.';
  }
  if (hour >= 13 && hour < 16) {
    return 'A primera hora de la tarde algunas personas notan una bajada de alerta. Conviene dividir el trabajo y hacer una pausa breve si lo necesitas.';
  }
  if (hour >= 20 || hour < 6) {
    return 'Es una franja próxima a la noche o de sueño habitual. Reduce exigencias y luz intensa; el efecto depende del horario y cronotipo personales.';
  }
  return 'La luz natural y el horario aportan contexto general, no una medición de cortisol o dopamina. Considera sueño, alimentación y tu patrón individual.';
}

function bestWindowText(category: DecisionCategory, date: Date, timeline: ReturnType<typeof getCircadianTimeline>): string {
  const [fromHour, toHour] = categoryRules[category].preferredHours;
  let start = set(date, { hours: fromHour, minutes: 0, seconds: 0, milliseconds: 0 });
  let end = set(date, { hours: toHour, minutes: 0, seconds: 0, milliseconds: 0 });
  if (timeline.sunrise && start < timeline.sunrise) start = timeline.sunrise;
  if (timeline.sunset && end > timeline.sunset) end = timeline.sunset;
  if (end <= start) {
    return 'Sin ventana diurna estimable hoy; elige un momento descansado según tu rutina local.';
  }
  return `${format(start, 'h:mm a', { locale: enUS })} – ${format(end, 'h:mm a', { locale: enUS })}`;
}

/** Heuristic reflection aid only; it does not predict outcomes or replace professional advice. */
export function evaluateDecisionContext(input: DecisionInput): DecisionContext {
  const energy = Math.min(5, Math.max(1, Math.round(input.userEnergyLevel)));
  const rule = categoryRules[input.category];
  const timeline = getCircadianTimeline(input.lat, input.lon, input.currentTime);
  const moon = getLunarCycleState(input.currentTime);
  const hour = input.currentTime.getHours() + input.currentTime.getMinutes() / 60;

  const isAlertWindow = hour >= 9 && hour < 12;
  const isAfternoonDip = hour >= 13 && hour < 16;
  const isNight = hour >= 20 || hour < 6;
  const energyDelta = energy - rule.idealEnergy;
  let score = 52 + energyDelta * 9;

  if (isAlertWindow) score += 12;
  if (isAfternoonDip) score -= 10;
  if (isNight && input.category !== 'DESCANSO_RETIRO') score -= 17;
  if (input.category === 'DESCANSO_RETIRO' && isNight) score += 12;
  if (favorableOctants[input.category].includes(moon.octant)) score += 7;
  score += moon.waxing ? rule.waxingBonus : rule.waningBonus;
  if (moon.octant === 'Llena') score += rule.fullMoonBonus;
  if (moon.octant === 'Luna Nueva') score += rule.newMoonBonus;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const recommendationLevel: RecommendationLevel = score >= 70
    ? 'FAVORABLE'
    : score >= 45 ? 'PROCEDER_CON_CAUTELA' : 'PAUSA_ESTRATEGICA';

  return {
    viabilityScore: score,
    recommendationLevel,
    biologicalContext: biologicalReadout(hour, Boolean(timeline.sunrise), Boolean(timeline.sunset)),
    archetypalContext: `${archetypeCopy[moon.octant]} La fase es un recurso de journaling, no una causa demostrada del resultado.`,
    bestWindowToday: bestWindowText(input.category, input.currentTime, timeline),
  };
}
