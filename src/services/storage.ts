import { UserSettings, CycleLog } from '../types/cycle';
import { addDays, extractPeriodBlocks } from '../utils/cycleEngine';

const SETTINGS_KEY = 'period_tracker_settings';
const PERIOD_DATES_KEY = 'period_tracker_dates';

const LEGACY_SETTINGS_KEY = 'cycle_pwa_settings';
const LEGACY_LOGS_KEY = 'cycle_pwa_logs';

export const DEFAULT_SETTINGS: UserSettings = {
  defaultCycleLength: 28,
  defaultPeriodLength: 4,
  lutealPhaseLength: 14,
  isOnboarded: false,
  averageCycleLength: 28,
  averagePeriodLength: 4
};

export function getSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
    // Migration from legacy settings if available
    const legacyRaw = localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      const migrated: UserSettings = {
        defaultCycleLength: parsed.averageCycleLength || 28,
        defaultPeriodLength: parsed.averagePeriodLength || 4,
        lutealPhaseLength: parsed.lutealPhaseLength || 14,
        isOnboarded: Boolean(parsed.isOnboarded)
      };
      saveSettings(migrated);
      return migrated;
    }
    return DEFAULT_SETTINGS;
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

/**
 * Returns all confirmed period dates (sorted ISO string array 'YYYY-MM-DD').
 * Automatically migrates legacy period_start/period_end logs if present.
 */
export function getPeriodDates(): string[] {
  try {
    const raw = localStorage.getItem(PERIOD_DATES_KEY);
    if (raw) {
      const dates: string[] = JSON.parse(raw);
      return Array.from(new Set(dates)).sort();
    }

    // Migration from legacy logs
    const legacyRaw = localStorage.getItem(LEGACY_LOGS_KEY);
    if (legacyRaw) {
      const logs: CycleLog[] = JSON.parse(legacyRaw);
      const migratedDates = new Set<string>();

      const startLogs = logs.filter((l) => l.type === 'period_start').map((l) => l.date).sort();
      for (const start of startLogs) {
        const endLog = logs.find((l) => l.type === 'period_end' && l.date >= start);
        const end = endLog ? endLog.date : addDays(start, 3);
        let curr = start;
        while (curr <= end) {
          migratedDates.add(curr);
          curr = addDays(curr, 1);
        }
      }

      const result = Array.from(migratedDates).sort();
      if (result.length > 0) {
        savePeriodDates(result);
      }
      return result;
    }

    return [];
  } catch (err) {
    console.error('Error reading period dates from localStorage:', err);
    return [];
  }
}

export function savePeriodDates(dates: string[]): void {
  try {
    const clean = Array.from(new Set(dates)).sort();
    localStorage.setItem(PERIOD_DATES_KEY, JSON.stringify(clean));
  } catch (err) {
    console.error('Error saving period dates to localStorage:', err);
  }
}

/**
 * Toggles a period date:
 * - If dateStr is already present in a period block:
 *   removes dateStr AND all subsequent days of that period block (marked as non-period).
 * - If dateStr is not present:
 *   - If distant from any existing period date (> 10 days): autofill dateStr + (autofillLength - 1) days.
 *   - If adjacent or close to an existing period block (<= 10 days): just add dateStr.
 */
export function togglePeriodDate(dateStr: string, autofillLength: number = 4): string[] {
  const current = getPeriodDates();
  const set = new Set(current);

  if (set.has(dateStr)) {
    // Locate the block containing dateStr
    const blocks = extractPeriodBlocks(current);
    const block = blocks.find((b) => dateStr >= b.startDate && dateStr <= b.endDate);
    if (block) {
      // Remove dateStr and all subsequent days of this block
      for (const d of current) {
        if (d >= dateStr && d <= block.endDate) {
          set.delete(d);
        }
      }
    } else {
      set.delete(dateStr);
    }
  } else {
    // Determine whether this click is isolated / new cycle start
    // Check if there is an existing date within 10 days
    const hasNearby = current.some((d) => {
      const diff = Math.abs((new Date(d).getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 10;
    });

    if (!hasNearby && autofillLength > 1) {
      // Auto-fill the period duration
      for (let i = 0; i < autofillLength; i++) {
        set.add(addDays(dateStr, i));
      }
    } else {
      set.add(dateStr);
    }
  }

  const updated = Array.from(set).sort();
  savePeriodDates(updated);
  return updated;
}
