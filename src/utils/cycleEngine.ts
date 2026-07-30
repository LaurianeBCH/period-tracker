import { UserSettings, CycleLog, DayStatus } from '../types/cycle';

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
 * Calculates the day status for any date based on user logs & cycle settings.
 */
export function getDayStatus(
  dateStr: string,
  settings: UserSettings,
  logs: CycleLog[],
  todayISO: string = getTodayISO()
): DayStatus {
  const isToday = dateStr === todayISO;

  // Check explicit logs
  const logForDate = logs.find((l) => l.date === dateStr);
  
  // Find all actual period start logs sorted chronologically
  const periodStartLogs = logs
    .filter((l) => l.type === 'period_start')
    .map((l) => l.date)
    .sort((a, b) => a.localeCompare(b));

  // Determine actual period days:
  // For each period_start, if there's a period_end after it, span is [start, end].
  // Otherwise, default to [start, start + averagePeriodLength - 1].
  let isActualPeriod = false;

  for (let i = 0; i < periodStartLogs.length; i++) {
    const start = periodStartLogs[i];
    const matchingEndLog = logs.find(
      (l) => l.type === 'period_end' && l.date >= start && (i === periodStartLogs.length - 1 || l.date < periodStartLogs[i + 1])
    );

    const end = matchingEndLog
      ? matchingEndLog.date
      : addDays(start, settings.averagePeriodLength - 1);

    if (dateStr >= start && dateStr <= end) {
      isActualPeriod = true;
      break;
    }
  }

  // If date has actual period logged, return early with predicted = false
  if (isActualPeriod) {
    return {
      dateStr,
      isToday,
      isActualPeriod: true,
      isPredictedPeriod: false,
      isOvulationDay: false,
      isFertileWindow: false,
      log: logForDate
    };
  }

  // Calculate predicted cycles:
  // Anchor is the latest period_start log on or before dateStr, or the earliest period_start log if dateStr is in the future.
  const anchorDateStr = periodStartLogs.length > 0 ? periodStartLogs[periodStartLogs.length - 1] : null;

  if (!anchorDateStr) {
    // No logs available yet
    return {
      dateStr,
      isToday,
      isActualPeriod: false,
      isPredictedPeriod: false,
      isOvulationDay: false,
      isFertileWindow: false,
      log: logForDate
    };
  }

  const cycleLen = settings.averageCycleLength || 28;
  const periodLen = settings.averagePeriodLength || 5;
  const lutealLen = settings.lutealPhaseLength || 14;

  const daysSinceAnchor = diffDays(anchorDateStr, dateStr);

  let isPredictedPeriod = false;
  let isOvulationDay = false;
  let isFertileWindow = false;

  // We project forward (and backward if dateStr > anchorDateStr)
  if (daysSinceAnchor >= 0) {
    const cycleIndex = Math.floor(daysSinceAnchor / cycleLen);
    const dayInCycle = daysSinceAnchor % cycleLen;

    // Predicted Period: Days 0 to (periodLen - 1) of the cycle
    // Note: Cycle 0 is actual period if anchorDateStr was logged, so we only predict cycleIndex > 0 or after actual period end
    if (cycleIndex > 0 && dayInCycle < periodLen) {
      isPredictedPeriod = true;
    }

    // Ovulation Day: Estimated 14 days before next period start (cycleLen - lutealLen)
    const ovulationDayInCycle = cycleLen - lutealLen;
    if (dayInCycle === ovulationDayInCycle) {
      isOvulationDay = true;
    }

    // Fertile Window: 5 days prior to ovulation up to 1 day after ovulation
    if (dayInCycle >= ovulationDayInCycle - 5 && dayInCycle <= ovulationDayInCycle + 1) {
      isFertileWindow = true;
    }
  }

  return {
    dateStr,
    isToday,
    isActualPeriod: false,
    isPredictedPeriod,
    isOvulationDay,
    isFertileWindow,
    log: logForDate
  };
}
