export interface UserSettings {
  averageCycleLength: number; // default: 28 days
  averagePeriodLength: number; // default: 5 days
  lutealPhaseLength: number; // default: 14 days
  isOnboarded: boolean;
}

export type LogType = 'period_start' | 'period_end';

export interface CycleLog {
  date: string; // ISO format 'YYYY-MM-DD'
  type: LogType;
}

export interface DayStatus {
  dateStr: string; // 'YYYY-MM-DD'
  isToday: boolean;
  isActualPeriod: boolean;
  isPredictedPeriod: boolean;
  isOvulationDay: boolean;
  isFertileWindow: boolean;
  log?: CycleLog;
}
