export interface UserSettings {
  defaultCycleLength: number; // default: 28 days
  defaultPeriodLength: number; // default: 4 days
  lutealPhaseLength: number; // default: 14 days
  isOnboarded: boolean;
  // Compatibilité ascendante
  averageCycleLength?: number;
  averagePeriodLength?: number;
}

export interface PeriodBlock {
  startDate: string; // ISO format 'YYYY-MM-DD'
  endDate: string; // ISO format 'YYYY-MM-DD'
  duration: number; // number of days
}

export type LogType = 'period_start' | 'period_end';

export interface CycleLog {
  date: string; // ISO format 'YYYY-MM-DD'
  type: LogType;
}

export type CyclePhase =
  | 'Phase1-Follicular'
  | 'Phase2-Ovulation'
  | 'Phase3-Luteal'
  | 'Phase4-Menstrual'
  | 'Phase4-Menstrual-Unconfirmed'
  | 'Default';

export interface DayStatus {
  dateStr: string; // 'YYYY-MM-DD'
  isToday: boolean;
  phase: CyclePhase;
  isActualPeriod: boolean;
  isPredictedPeriod: boolean;
  isOvulationDay: boolean;
  isFertileWindow: boolean;
  log?: CycleLog;
  cycleDay?: number;
  totalCycleDays?: number;
  phaseDay?: number;
  phaseTotalDays?: number;
}
