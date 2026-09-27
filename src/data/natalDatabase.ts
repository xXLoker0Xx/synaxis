import type { ZodiacSign, PlanetaryBody } from '../core/natal/natalChart';

/**
 * Base de datos de interpretaciones astrológicas para la carta natal
 * Cada elemento contiene el significado arquetípico y cualidades asociadas
 */

export interface SignInterpretation {
  name: ZodiacSign;
  element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua';
  ruling_planet: PlanetaryBody;
  qualities: string[];
  keywords: string[];
  strengths: string[];
  challenges: string[];
  description: string;
}

export interface PlanetInterpretation {
  name: PlanetaryBody;
  symbol: string;
  archetype: string;
  keywords: string[];
  dominions: ZodiacSign[];
  exaltation?: ZodiacSign;
  fall?: ZodiacSign;
  detriment?: ZodiacSign;
  description: string;
  meanings: {
    positive: string[];
    shadow: string[];
  };
}

export interface HouseInterpretation {
  number: number;
  keywords: string[];
  theme: string;
  description: string;
}

/**
 * Interpretaciones de los 12 signos zodiacales
 */
export const ZODIAC_SIGNS: Record<ZodiacSign, SignInterpretation> = {
  Aries: {
    name: 'Aries',
    element: 'Fuego',
    ruling_planet: 'Marte',
    qualities: ['Cardinal', 'Masculino', 'Positivo'],
    keywords: ['iniciativa', 'coraje', 'impulso', 'acción', 'liderazgo', 'independencia'],
    strengths: ['Valor', 'Energía', 'Innovación', 'Determinación', 'Espontaneidad'],
    challenges: ['Impulsividad', 'Impaciencia', 'Agresividad', 'Egocentrismo'],
    description: 'Aries es el pionero del zodiaco. Representa la iniciativa, el coraje y la acción directa. Los Aries son líderes naturales, osados e independientes, siempre listos para comenzar nuevas aventuras.',
  },
  Tauro: {
    name: 'Tauro',
    element: 'Tierra',
    ruling_planet: 'Venus',
    qualities: ['Fijo', 'Masculino', 'Negativo'],
    keywords: ['estabilidad', 'seguridad', 'practicidad', 'sensualidad', 'lealtad', 'recursos'],
    strengths: ['Confiabilidad', 'Paciencia', 'Pragmatismo', 'Sensibilidad estética', 'Lealtad'],
    challenges: ['Terquedad', 'Posesividad', 'Materialismo', 'Inflexibilidad'],
    description: 'Tauro es el constructo del zodiaco. Representa la estabilidad, la seguridad material y la belleza. Los Tauro son confiables, prácticos y valoran la comodidad y la calidad de vida.',
  },
  Géminis: {
    name: 'Géminis',
    element: 'Aire',
    ruling_planet: 'Mercurio',
    qualities: ['Mutable', 'Masculino', 'Positivo'],
    keywords: ['comunicación', 'versatilidad', 'curiosidad', 'inteligencia', 'adaptabilidad', 'intercambio'],
    strengths: ['Comunicación', 'Inteligencia', 'Adaptabilidad', 'Curiosidad', 'Wit'],
    challenges: ['Superficialidad', 'Dispersión', 'Inconsistencia', 'Nerviosismo'],
    description: 'Géminis es el comunicador del zodiaco. Representa la expresión, el intercambio de ideas y la versatilidad mental. Los Géminis son curiosos, ingeniosos y sociales.',
  },
  Cáncer: {
    name: 'Cáncer',
    element: 'Agua',
    ruling_planet: 'Luna',
    qualities: ['Cardinal', 'Femenino', 'Negativo'],
    keywords: ['emociones', 'intuición', 'familia', 'protección', 'sensibilidad', 'crianza'],
    strengths: ['Intuición', 'Empatía', 'Protección', 'Imaginación', 'Dedicación'],
    challenges: ['Sensibilidad excesiva', 'Apego', 'Irritabilidad', 'Introspección excesiva'],
    description: 'Cáncer es el cuidador del zodiaco. Representa la emoción, la familia y la seguridad emocional. Los Cáncer son intuitivos, protectores y profundamente conectados a sus raíces.',
  },
  Leo: {
    name: 'Leo',
    element: 'Fuego',
    ruling_planet: 'Sol',
    qualities: ['Fijo', 'Masculino', 'Positivo'],
    keywords: ['creatividad', 'expresión', 'liderazgo', 'generosidad', 'confianza', 'vitalidad'],
    strengths: ['Creatividad', 'Generosidad', 'Confianza', 'Carisma', 'Pasión'],
    challenges: ['Orgullo', 'Arrogancia', 'Dramatismo', 'Búsqueda de admiración'],
    description: 'Leo es el creador del zodiaco. Representa la auto-expresión, la creatividad y el liderazgo natural. Los Leo son apasionados, generosos y aman ser el centro de atención.',
  },
  Virgo: {
    name: 'Virgo',
    element: 'Tierra',
    ruling_planet: 'Mercurio',
    qualities: ['Mutable', 'Femenino', 'Negativo'],
    keywords: ['análisis', 'servicio', 'perfeccionismo', 'discriminación', 'utilidad', 'orden'],
    strengths: ['Atención al detalle', 'Análisis', 'Servicio', 'Practicidad', 'Humildad'],
    challenges: ['Perfeccionismo', 'Crítica', 'Preocupación', 'Autocrítica'],
    description: 'Virgo es el analista del zodiaco. Representa el servicio, la discriminación y la mejora continua. Los Virgo son atentos, prácticos y tienen un gran ojo para los detalles.',
  },
  Libra: {
    name: 'Libra',
    element: 'Aire',
    ruling_planet: 'Venus',
    qualities: ['Cardinal', 'Femenino', 'Positivo'],
    keywords: ['equilibrio', 'justicia', 'relaciones', 'diplomacia', 'armonía', 'belleza'],
    strengths: ['Diplomacia', 'Justicia', 'Equilibrio', 'Sociabilidad', 'Estética'],
    challenges: ['Indecisión', 'Complacencia', 'Superficialidad', 'Codependencia'],
    description: 'Libra es el equilibrador del zodiaco. Representa la armonía, la justicia y las relaciones. Los Libra son diplomáticos, sociables y valoran la belleza y el equilibrio.',
  },
  Escorpio: {
    name: 'Escorpio',
    element: 'Agua',
    ruling_planet: 'Plutón',
    qualities: ['Fijo', 'Femenino', 'Negativo'],
    keywords: ['transformación', 'profundidad', 'poder', 'intensidad', 'regeneración', 'investigación'],
    strengths: ['Profundidad', 'Determinación', 'Lealtad', 'Magnetismo', 'Investigación'],
    challenges: ['Obsesión', 'Destructividad', 'Secretismo', 'Venganza'],
    description: 'Escorpio es el transformador del zodiaco. Representa la profundidad, el poder oculto y la regeneración. Los Escorpio son intensos, apasionados y tienen un gran poder personal.',
  },
  Sagitario: {
    name: 'Sagitario',
    element: 'Fuego',
    ruling_planet: 'Júpiter',
    qualities: ['Mutable', 'Masculino', 'Positivo'],
    keywords: ['expansión', 'exploración', 'filosofía', 'optimismo', 'libertad', 'aventura'],
    strengths: ['Optimismo', 'Aventura', 'Filosofía', 'Generosidad', 'Libertad'],
    challenges: ['Irreverencia', 'Exceso', 'Falta de tacto', 'Irresponsabilidad'],
    description: 'Sagitario es el explorador del zodiaco. Representa la expansión, la búsqueda de significado y la aventura. Los Sagitario son optimistas, aventureros y aman aprender y explorar.',
  },
  Capricornio: {
    name: 'Capricornio',
    element: 'Tierra',
    ruling_planet: 'Saturno',
    qualities: ['Cardinal', 'Femenino', 'Negativo'],
    keywords: ['estructura', 'autoridad', 'responsabilidad', 'ambición', 'madurez', 'tradición'],
    strengths: ['Responsabilidad', 'Disciplina', 'Ambición', 'Madurez', 'Pragmatismo'],
    challenges: ['Pesimismo', 'Rigidez', 'Frialdad', 'Represión emocional'],
    description: 'Capricornio es el arquitecto del zodiaco. Representa la estructura, la autoridad y la responsabilidad. Los Capricornio son disciplinados, ambiciosos y tienen un gran sentido del deber.',
  },
  Acuario: {
    name: 'Acuario',
    element: 'Aire',
    ruling_planet: 'Urano',
    qualities: ['Fijo', 'Masculino', 'Positivo'],
    keywords: ['innovación', 'humanitarismo', 'originalidad', 'independencia', 'reforma', 'comunidad'],
    strengths: ['Innovación', 'Humanitarismo', 'Independencia', 'Inteligencia', 'Originalidad'],
    challenges: ['Desapego', 'Excentricidad', 'Rebeldía sin causa', 'Frialdad'],
    description: 'Acuario es el innovador del zodiaco. Representa la reforma, la comunidad y la originalidad. Los Acuario son inventivos, humanitarios e independientes.',
  },
  Piscis: {
    name: 'Piscis',
    element: 'Agua',
    ruling_planet: 'Neptuno',
    qualities: ['Mutable', 'Femenino', 'Negativo'],
    keywords: ['imaginación', 'compasión', 'espiritualidad', 'disolución', 'intuición', 'sacrificio'],
    strengths: ['Compasión', 'Intuición', 'Espiritualidad', 'Imaginación', 'Empatía'],
    challenges: ['Escapismo', 'Ilusiones', 'Confusión', 'Autosacrificio'],
    description: 'Piscis es el místico del zodiaco. Representa la espiritualidad, la compasión y la imaginación. Los Piscis son intuitivos, empáticos y tienen una conexión profunda con lo intangible.',
  },
};

/**
 * Interpretaciones de los 10 cuerpos celestes (planetas y puntos luminosos)
 */
export const PLANETS: Record<PlanetaryBody, PlanetInterpretation> = {
  Sol: {
    name: 'Sol',
    symbol: '☉',
    archetype: 'El Yo Central',
    keywords: ['identidad', 'voluntad', 'ego', 'propósito', 'vitalidad', 'autoridad'],
    dominions: ['Leo'],
    exaltation: 'Aries',
    description: 'El Sol representa el núcleo de tu identidad y propósito de vida. Es tu expresión más auténtica.',
    meanings: {
      positive: ['Autoexpresión', 'Vitalidad', 'Liderazgo', 'Confianza', 'Creatividad'],
      shadow: ['Egocentrismo', 'Arrogancia', 'Dramatismo', 'Autoritarismo'],
    },
  },
  Luna: {
    name: 'Luna',
    symbol: '☽',
    archetype: 'Las Emociones y el Inconsciente',
    keywords: ['emociones', 'instinto', 'subconsciente', 'crianza', 'seguridad', 'hábitos'],
    dominions: ['Cáncer'],
    exaltation: 'Tauro',
    description: 'La Luna representa tus emociones, instintos y necesidades emocionales profundas.',
    meanings: {
      positive: ['Intuición', 'Empatía', 'Compasión', 'Seguridad', 'Cuidado'],
      shadow: ['Emotividad excesiva', 'Apego', 'Cambios de humor', 'Dependencia'],
    },
  },
  Mercurio: {
    name: 'Mercurio',
    symbol: '☿',
    archetype: 'El Comunicador',
    keywords: ['comunicación', 'pensamiento', 'escritura', 'comercio', 'intercambio', 'curiosidad'],
    dominions: ['Géminis', 'Virgo'],
    exaltation: 'Virgo',
    description: 'Mercurio representa tu mente, comunicación y la forma en que procesas la información.',
    meanings: {
      positive: ['Inteligencia', 'Comunicación clara', 'Adaptabilidad', 'Curiosidad', 'Ingenio'],
      shadow: ['Superficialidad', 'Mentira', 'Nerviosismo', 'Dispersión'],
    },
  },
  Venus: {
    name: 'Venus',
    symbol: '♀',
    archetype: 'El Amor y la Belleza',
    keywords: ['amor', 'belleza', 'valores', 'dinero', 'placer', 'relaciones'],
    dominions: ['Tauro', 'Libra'],
    exaltation: 'Piscis',
    description: 'Venus representa tu capacidad de amar, apreciar la belleza y conectar con otros.',
    meanings: {
      positive: ['Amor', 'Belleza', 'Harmonía', 'Valores', 'Generosidad'],
      shadow: ['Vanidad', 'Superficialidad', 'Indulgencia', 'Codependencia'],
    },
  },
  Marte: {
    name: 'Marte',
    symbol: '♂',
    archetype: 'La Voluntad y la Acción',
    keywords: ['acción', 'pasión', 'coraje', 'agresión', 'deseo', 'conflicto'],
    dominions: ['Aries', 'Escorpio'],
    exaltation: 'Capricornio',
    description: 'Marte representa tu impulso, pasión, agresión y la forma en que luchas por lo que quieres.',
    meanings: {
      positive: ['Coraje', 'Acción', 'Pasión', 'Determinación', 'Vigor'],
      shadow: ['Agresividad', 'Impulsividad', 'Ira', 'Conflictividad'],
    },
  },
  Júpiter: {
    name: 'Júpiter',
    symbol: '♃',
    archetype: 'El Benefactor',
    keywords: ['expansión', 'abundancia', 'sabiduría', 'filosofía', 'fe', 'suerte'],
    dominions: ['Sagitario'],
    exaltation: 'Cáncer',
    description: 'Júpiter representa tu capacidad de expansión, abundancia y búsqueda de significado.',
    meanings: {
      positive: ['Abundancia', 'Suerte', 'Sabiduría', 'Generosidad', 'Fe'],
      shadow: ['Exceso', 'Arrogancia', 'Desperdicio', 'Fanatismo'],
    },
  },
  Saturno: {
    name: 'Saturno',
    symbol: '♄',
    archetype: 'El Maestro',
    keywords: ['limitación', 'responsabilidad', 'tiempo', 'madurez', 'disciplina', 'karma'],
    dominions: ['Capricornio'],
    exaltation: 'Libra',
    description: 'Saturno representa tus limitaciones, responsabilidades y la sabiduría que ganas con la experiencia.',
    meanings: {
      positive: ['Disciplina', 'Responsabilidad', 'Madurez', 'Estructura', 'Sabiduría'],
      shadow: ['Represión', 'Rigidez', 'Pesimismo', 'Miedo'],
    },
  },
  Urano: {
    name: 'Urano',
    symbol: '♅',
    archetype: 'El Revolucionario',
    keywords: ['cambio', 'revolución', 'innovación', 'libertad', 'lo inesperado', 'tecnología'],
    dominions: ['Acuario'],
    description: 'Urano representa tu capacidad de innovación, cambio y liberación de lo convencional.',
    meanings: {
      positive: ['Innovación', 'Libertad', 'Genialidad', 'Originalidad', 'Reformismo'],
      shadow: ['Rebeldía sin sentido', 'Excentricidad', 'Inestabilidad', 'Desapego'],
    },
  },
  Neptuno: {
    name: 'Neptuno',
    symbol: '♆',
    archetype: 'El Místico',
    keywords: ['espiritualidad', 'imaginación', 'ilusión', 'compasión', 'disolución', 'sueños'],
    dominions: ['Piscis'],
    description: 'Neptuno representa tu espiritualidad, imaginación y conexión con lo trascendental.',
    meanings: {
      positive: ['Espiritualidad', 'Compasión', 'Imaginación', 'Intuición', 'Sacrificio noble'],
      shadow: ['Ilusión', 'Confusión', 'Escapismo', 'Engaño', 'Adicción'],
    },
  },
  Plutón: {
    name: 'Plutón',
    symbol: '♇',
    archetype: 'El Transformador',
    keywords: ['transformación', 'poder', 'regeneración', 'muerte y renacimiento', 'lo oculto', 'psique profunda'],
    dominions: ['Escorpio'],
    description: 'Plutón representa tu poder de transformación, la muerte y renacimiento de aspectos de ti mismo.',
    meanings: {
      positive: ['Transformación', 'Poder personal', 'Regeneración', 'Investigación', 'Sanación profunda'],
      shadow: ['Obsesión', 'Control', 'Destructividad', 'Secretos', 'Trauma'],
    },
  },
};

/**
 * Interpretaciones de las 12 casas astrológicas
 */
export const HOUSES: Record<number, HouseInterpretation> = {
  1: {
    number: 1,
    keywords: ['identidad', 'aparencia', 'yo', 'comienzos', 'máscara'],
    theme: 'Casa del Yo',
    description: 'La Primera Casa representa cómo te presents al mundo, tu apariencia y tu identidad.',
  },
  2: {
    number: 2,
    keywords: ['posesiones', 'valores', 'finanzas', 'autoestima', 'talento'],
    theme: 'Casa de los Valores',
    description: 'La Segunda Casa trata sobre tus valores, posesiones materiales y autoestima.',
  },
  3: {
    number: 3,
    keywords: ['comunicación', 'hermanos', 'corto plazo', 'pensamiento', 'aprendizaje'],
    theme: 'Casa de la Comunicación',
    description: 'La Tercera Casa rige la comunicación, los hermanos y el aprendizaje temprano.',
  },
  4: {
    number: 4,
    keywords: ['hogar', 'familia', 'raíces', 'infancia', 'base'],
    theme: 'Casa del Hogar',
    description: 'La Cuarta Casa representa tu hogar, familia y fundamento psicológico.',
  },
  5: {
    number: 5,
    keywords: ['creatividad', 'romance', 'diversión', 'hijos', 'autoexpresión'],
    theme: 'Casa de la Creatividad',
    description: 'La Quinta Casa rige la creatividad, el romance y la expresión personal.',
  },
  6: {
    number: 6,
    keywords: ['trabajo', 'salud', 'servicio', 'hábitos', 'mascotas'],
    theme: 'Casa del Trabajo',
    description: 'La Sexta Casa trata sobre el trabajo, la salud y los hábitos diarios.',
  },
  7: {
    number: 7,
    keywords: ['relaciones', 'matrimonio', 'asociaciones', 'enemigos abiertos', 'contrato'],
    theme: 'Casa de las Relaciones',
    description: 'La Séptima Casa rige las relaciones, el matrimonio y las asociaciones.',
  },
  8: {
    number: 8,
    keywords: ['muerte', 'sexualidad', 'poder', 'herencia', 'recursos compartidos'],
    theme: 'Casa de la Transformación',
    description: 'La Octava Casa trata sobre la muerte, sexualidad, poder y transformación.',
  },
  9: {
    number: 9,
    keywords: ['filosofía', 'viajes', 'educación superior', 'espiritualidad', 'expansión'],
    theme: 'Casa de la Filosofía',
    description: 'La Novena Casa rige la filosofía, los viajes y la educación superior.',
  },
  10: {
    number: 10,
    keywords: ['carrera', 'reputación', 'autoridad', 'pública imagen', 'éxito'],
    theme: 'Casa de la Carrera',
    description: 'La Décima Casa representa tu carrera, reputación y posición social.',
  },
  11: {
    number: 11,
    keywords: ['amistades', 'grupos', 'esperanzas', 'comunidad', 'ideales'],
    theme: 'Casa de la Comunidad',
    description: 'La Undécima Casa rige las amistades, grupos y aspiraciones colectivas.',
  },
  12: {
    number: 12,
    keywords: ['inconsciente', 'lo oculto', 'instituciones', 'retiro', 'renacimiento'],
    theme: 'Casa del Inconsciente',
    description: 'La Duodécima Casa trata sobre el inconsciente, lo oculto y la espiritualidad.',
  },
};

/**
 * Obtiene la interpretación de un signo zodiacal
 */
export function getSignInterpretation(sign: ZodiacSign): SignInterpretation {
  return ZODIAC_SIGNS[sign];
}

/**
 * Obtiene la interpretación de un planeta
 */
export function getPlanetInterpretation(planet: PlanetaryBody): PlanetInterpretation {
  return PLANETS[planet];
}

/**
 * Obtiene la interpretación de una casa
 */
export function getHouseInterpretation(houseNumber: number): HouseInterpretation | null {
  return HOUSES[houseNumber] || null;
}
