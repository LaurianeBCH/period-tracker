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

  // Determine actual logged period days
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

  const cycleLen = settings.averageCycleLength || 28;
  const periodLen = settings.averagePeriodLength || 4;
  const lutealLen = settings.lutealPhaseLength || 14;

  const daysSinceAnchor = diffDays(anchorDateStr, dateStr);

  // Normalize day index in cycle (works for past and future)
  const dayInCycle = ((daysSinceAnchor % cycleLen) + cycleLen) % cycleLen;

  const ovulationDayInCycle = cycleLen - lutealLen; // e.g. 14 for 28-day cycle with 14-day luteal
  const fertileStartInCycle = ovulationDayInCycle - 3; // e.g. 11
  const fertileEndInCycle = ovulationDayInCycle + 1; // e.g. 15

  const isOvulationDay = dayInCycle === ovulationDayInCycle;
  const isFertileWindow =
    dayInCycle >= fertileStartInCycle && dayInCycle <= fertileEndInCycle;

  let isPredictedPeriod = false;
  let phase: CyclePhase = 'Default';

  if (isActualPeriod) {
    phase = 'Phase4-Menstrual';
  } else if (dayInCycle < periodLen) {
    // Menstrual phase but not confirmed by explicit log
    phase = 'Phase4-Menstrual-Unconfirmed';
    isPredictedPeriod = true;
  } else if (dayInCycle >= periodLen && dayInCycle < fertileStartInCycle) {
    phase = 'Phase1-Follicular';
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
