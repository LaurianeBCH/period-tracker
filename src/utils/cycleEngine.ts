import { UserSettings, CycleLog, DayStatus, CyclePhase } from '../types/cycle';

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateISO(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDateISO(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateISO(date);
}

export function diffDays(startDateStr: string, endDateStr: string): number {
  const start = parseDateISO(startDateStr).getTime();
  const end = parseDateISO(endDateStr).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function getTodayISO(): string {
  return formatDateISO(new Date());
}

/**
 * Calculates the day status and ovulation cycle phase for any date based on user logs & cycle settings.
 * Phase 1 (Follicular) starts immediately on the day after the declared period end date.
 */
export function getDayStatus(
  dateStr: string,
  settings: UserSettings,
  logs: CycleLog[],
  todayISO: string = getTodayISO()
): DayStatus {
  const isToday = dateStr === todayISO;
  const logForDate = logs.find((l) => l.date === dateStr);

  const periodStartLogs = logs
    .filter((l) => l.type === 'period_start')
    .map((l) => l.date)
    .sort((a, b) => a.localeCompare(b));

  // Determine actual logged period days across all logs
  let isActualPeriod = false;

  for (let i = 0; i < periodStartLogs.length; i++) {
    const start = periodStartLogs[i];
    const matchingEndLog = logs.find(
      (l) =>
        l.type === 'period_end' &&
        l.date >= start &&
        (i === periodStartLogs.length - 1 || l.date < periodStartLogs[i + 1])
    );

    const end = matchingEndLog
      ? matchingEndLog.date
      : addDays(start, (settings.averagePeriodLength || 4) - 1);

    if (dateStr >= start && dateStr <= end) {
      isActualPeriod = true;
      break;
    }
  }

  // Anchor date: default to latest period_start, or 2026-08-01 if no logs
  const anchorDateStr =
    periodStartLogs.length > 0
      ? periodStartLogs[periodStartLogs.length - 1]
      : '2026-08-01';

  // Find declared period_end for anchorDateStr if present
  const anchorEndLog = logs.find(
    (l) => l.type === 'period_end' && l.date >= anchorDateStr
  );

  const cycleLen = settings.averageCycleLength || 28;
  const defaultPeriodLen = settings.averagePeriodLength || 4;
  const lutealLen = settings.lutealPhaseLength || 14;

  const daysSinceAnchor = diffDays(anchorDateStr, dateStr);

  // Normalize day index in cycle (works for past and future)
  const dayInCycle = ((daysSinceAnchor % cycleLen) + cycleLen) % cycleLen;

  const ovulationDayInCycle = cycleLen - lutealLen; // e.g. 14 for 28-day cycle
  const fertileStartInCycle = ovulationDayInCycle - 3; // e.g. 11
  const fertileEndInCycle = ovulationDayInCycle + 1; // e.g. 15

  const isOvulationDay = dayInCycle === ovulationDayInCycle;
  const isFertileWindow =
    dayInCycle >= fertileStartInCycle && dayInCycle <= fertileEndInCycle;

  let isPredictedPeriod = false;
  let phase: CyclePhase = 'Default';

  if (isActualPeriod) {
    phase = 'Phase4-Menstrual';
  } else if (dayInCycle < fertileStartInCycle) {
    // Check if within anchor cycle or subsequent cycles
    if (daysSinceAnchor >= 0 && daysSinceAnchor < cycleLen && anchorEndLog) {
      // User declared an explicit end date for anchor cycle
      const declaredEndDayInCycle = diffDays(anchorDateStr, anchorEndLog.date);
      if (dayInCycle > declaredEndDayInCycle) {
        // Phase 1 starts immediately after declared end date
        phase = 'Phase1-Follicular';
      } else {
        phase = 'Phase4-Menstrual';
        isActualPeriod = true;
      }
    } else if (dayInCycle < defaultPeriodLen) {
      // Future predicted cycle period or cycle without explicit end log
      phase = 'Phase4-Menstrual-Unconfirmed';
      isPredictedPeriod = true;
    } else {
      // After period, before fertile window -> Follicular phase
      phase = 'Phase1-Follicular';
    }
  } else if (dayInCycle >= fertileStartInCycle && dayInCycle <= fertileEndInCycle) {
    phase = 'Phase2-Ovulation';
  } else {
    phase = 'Phase3-Luteal';
  }

  return {
    dateStr,
    isToday,
    phase,
    isActualPeriod,
    isPredictedPeriod,
    isOvulationDay,
    isFertileWindow,
    log: logForDate
  };
}
