import { UserSettings, CycleLog } from '../types/cycle';

const SETTINGS_KEY = 'cycle_pwa_settings';
const LOGS_KEY = 'cycle_pwa_logs';

export const DEFAULT_SETTINGS: UserSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lutealPhaseLength: 14,
  isOnboarded: false
};

export function getSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

export function getLogs(): CycleLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading logs from localStorage:', err);
    return [];
  }
}

export function saveLogs(logs: CycleLog[]): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Error saving logs to localStorage:', err);
  }
}

export function logPeriodStart(dateStr: string): CycleLog[] {
  const current = getLogs();
  // Remove existing log for this date if present
  const filtered = current.filter((l) => l.date !== dateStr);
  const updated = [...filtered, { date: dateStr, type: 'period_start' as const }];
  saveLogs(updated);
  return updated;
}

export function logPeriodEnd(dateStr: string): CycleLog[] {
  const current = getLogs();
  const filtered = current.filter((l) => l.date !== dateStr);
  const updated = [...filtered, { date: dateStr, type: 'period_end' as const }];
  saveLogs(updated);
  return updated;
}

export function removeLogForDate(dateStr: string): CycleLog[] {
  const current = getLogs();
  const updated = current.filter((l) => l.date !== dateStr);
  saveLogs(updated);
  return updated;
}
