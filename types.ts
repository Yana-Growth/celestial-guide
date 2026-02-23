
export interface BirthData {
  name: string;
  maidenName?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace: string;
  currentCity: string;
  gender: 'male' | 'female' | 'other';
}

export interface PlanetaryPosition {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  retrograde: boolean;
  logic?: string;
}

export interface ProgressScale {
  label: string;
  value: number; // 0-100
  color: string;
}

export interface NatalChartData {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  planets: PlanetaryPosition[];
  summary: string;
  progressScales: {
    missing: ProgressScale[];
    excess: ProgressScale[];
    workOn: ProgressScale[];
    focusOn: ProgressScale[];
  };
  elements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  calculationLogic: string;
}

export interface NumerologyData {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  interpretation: string;
  calculationMethod: string;
}

export interface DailyForecast {
  date: string;
  lunarPhase: string;
  lunarDay: number;
  moonPhaseDescription: string; // Waxing/Waning/Full in Russian
  mood: string;
  energyScale: {
    value: number;
    difficulty: 'легкий' | 'средний' | 'сложный' | 'критический';
    description: string;
  };
  warnings: {
    type: 'conflict' | 'magnetic_storm' | 'health' | 'financial';
    title: string;
    advice: string;
  }[];
  recommendations: {
    career: string;
    love: string;
    health: string;
    spirituality: string;
    haircut: string;
    sports: string;
    nutrition: string;
    activity: string;
    communication: string;
  };
  justification: string;
}

export interface CompatibilityData {
  score: number;
  summary: string;
  aspects: {
    emotional: number;
    intellectual: number;
    physical: number;
    karmic: number;
  };
  challenges: string[];
  tips: string[];
}

export interface FatefulMoment {
  period: string;
  event: string;
  description: string;
  type: 'career' | 'love' | 'spiritual' | 'health';
}

export interface MonthForecast {
  month: string;
  prediction: string;
}

export interface UserState {
  birthData: BirthData | null;
  natalChart: NatalChartData | null;
  numerology: NumerologyData | null;
  dailyForecast: DailyForecast | null;
  fatefulMoments: FatefulMoment[] | null;
  yearlyForecast: MonthForecast[] | null;
}
