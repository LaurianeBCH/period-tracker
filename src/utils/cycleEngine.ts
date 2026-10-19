import { UserSettings, DayStatus, CyclePhase, PeriodBlock, CycleLog } from '../types/cycle';

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
 * Groups declared period dates into continuous period blocks.
 * Dates with a gap <= 3 days are merged into the same block.
 */
export function extractPeriodBlocks(dates: string[]): PeriodBlock[] {
  if (!dates || dates.length === 0) return [];
  const sorted = Array.from(new Set(dates)).sort();
  const blocks: PeriodBlock[] = [];

  let currentStart = sorted[0];
  let currentEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const d = sorted[i];
    const gap = diffDays(currentEnd, d);
    if (gap <= 3) {
      currentEnd = d;
    } else {
      blocks.push({
        startDate: currentStart,
        endDate: currentEnd,
        duration: diffDays(currentStart, currentEnd) + 1
      });
      currentStart = d;
      currentEnd = d;
    }
  }

  blocks.push({
    startDate: currentStart,
    endDate: currentEnd,
    duration: diffDays(currentStart, currentEnd) + 1
  });

  return blocks;
}

export interface CycleMetrics {
  cycleLength: number;
  periodLength: number;
  latestBlock: PeriodBlock | null;
  previousBlock: PeriodBlock | null;
}

/**
 * Computes dynamic cycle metrics:
 * - cycleLength: gap between previous cycle startDate and latest cycle startDate (if >= 2 blocks), else default 28.
 * - periodLength: duration of previous cycle if available, else latest block duration, else default 4.
 */
export function computeCycleMetrics(
  blocks: PeriodBlock[],
  settings: UserSettings
): CycleMetrics {
  const defaultCycleLen = settings.defaultCycleLength || settings.averageCycleLength || 28;
  const defaultPeriodLen = settings.defaultPeriodLength || settings.averagePeriodLength || 4;

  if (blocks.length === 0) {
    return {
      cycleLength: defaultCycleLen,
      periodLength: defaultPeriodLen,
      latestBlock: null,
      previousBlock: null
    };
  }

  const latestBlock = blocks[blocks.length - 1];
  const previousBlock = blocks.length >= 2 ? blocks[blocks.length - 2] : null;

  let cycleLength = defaultCycleLen;
  if (previousBlock && latestBlock) {
    const gap = diffDays(previousBlock.startDate, latestBlock.startDate);
    if (gap >= 15 && gap <= 60) {
      cycleLength = gap;
    }
  }

  let periodLength = defaultPeriodLen;
  if (previousBlock) {
    periodLength = Math.max(1, previousBlock.duration);
  } else if (latestBlock) {
    periodLength = Math.max(1, latestBlock.duration);
  }

  return {
    cycleLength,
    periodLength,
    latestBlock,
    previousBlock
  };
}

/**
 * Calculates day status and cycle phase for any dateStr:
 * - Phase 4 (Menstrual) for actual declared period dates.
 * - All subsequent phases (Phase 1, Phase 2, Phase 3, and potential next period)
 *   are recalculated to start immediately after the last day of the period.
 */
export function getDayStatus(
  dateStr: string,
  settings: UserSettings,
  periodDatesOrLogs: string[] | CycleLog[],
  todayISO: string = getTodayISO()
): DayStatus {
  const isToday = dateStr === todayISO;

  // Convert inputs if legacy CycleLog[] passed
  const dates: string[] =
    periodDatesOrLogs.length > 0 && typeof periodDatesOrLogs[0] !== 'string'
      ? (periodDatesOrLogs as CycleLog[]).map((l) => l.date)
      : (periodDatesOrLogs as string[]);

  const dateSet = new Set(dates);
  const isActualPeriod = dateSet.has(dateStr);

  const blocks = extractPeriodBlocks(dates);
  const metrics = computeCycleMetrics(blocks, settings);
  const periodLen = metrics.periodLength;

  // If explicitly declared in periodDates:
  if (isActualPeriod) {
    return {
      dateStr,
      isToday,
      phase: 'Phase4-Menstrual',
      isActualPeriod: true,
      isPredictedPeriod: false,
      isOvulationDay: false,
      isFertileWindow: false
    };
  }

  // Anchor selection
  let anchorDate: string;
  let anchorPeriodEnd: string;
  let isSkippedOnboarding = false;

  if (blocks.length === 0) {
    // Onboarding skipped / no logs: anchor at todayISO as potential period
    anchorDate = todayISO;
    anchorPeriodEnd = addDays(todayISO, periodLen - 1);
    isSkippedOnboarding = true;
  } else {
    // Find matching block for dateStr or use latest
    let matchedBlock = blocks[blocks.length - 1];
    for (let i = 0; i < blocks.length; i++) {
      const nextStart = i < blocks.length - 1 ? blocks[i + 1].startDate : null;
      if (dateStr >= blocks[i].startDate && (!nextStart || dateStr < nextStart)) {
        matchedBlock = blocks[i];
        break;
      }
    }
    anchorDate = matchedBlock.startDate;
    anchorPeriodEnd = matchedBlock.endDate;
  }

  // Phase durations configured to start sequentially after the last day of rules:
  // Phase 1 (Prise d'élan): 6 days
  // Phase 2 (Debout sur la planche / Ovulation): 5 days (peak on day 3 of window)
  // Phase 3 (Dans le tube de la vague): 13 days
  // Total cycle non-period span: 24 days
  const follicularDuration = 6;
  const fertileDuration = 5;
  const lutealDuration = 13;
  const cycleAfterPeriod = follicularDuration + fertileDuration + lutealDuration; // 24 days
  const currentPeriodDuration = Math.max(1, diffDays(anchorDate, anchorPeriodEnd) + 1);
  const totalCycleLen = currentPeriodDuration + cycleAfterPeriod;

  // If explicitly declared in periodDates:
  if (isActualPeriod) {
    const periodDay = Math.max(1, Math.min(currentPeriodDuration, diffDays(anchorDate, dateStr) + 1));
    const cycleDay = cycleAfterPeriod + periodDay;
    return {
      dateStr,
      isToday,
      phase: 'Phase4-Menstrual',
      isActualPeriod: true,
      isPredictedPeriod: false,
      isOvulationDay: false,
      isFertileWindow: false,
      cycleDay,
      totalCycleDays: totalCycleLen,
      phaseDay: periodDay,
      phaseTotalDays: currentPeriodDuration
    };
  }

  // If during skipped onboarding unconfirmed period:
  if (isSkippedOnboarding && dateStr >= anchorDate && dateStr <= anchorPeriodEnd) {
    const periodDay = Math.max(1, Math.min(currentPeriodDuration, diffDays(anchorDate, dateStr) + 1));
    const cycleDay = cycleAfterPeriod + periodDay;
    return {
      dateStr,
      isToday,
      phase: 'Phase4-Menstrual-Unconfirmed',
      isActualPeriod: false,
      isPredictedPeriod: true,
      isOvulationDay: false,
      isFertileWindow: false,
      cycleDay,
      totalCycleDays: totalCycleLen,
      phaseDay: periodDay,
      phaseTotalDays: currentPeriodDuration
    };
  }

  const daysAfterPeriod = diffDays(anchorPeriodEnd, dateStr);

  if (daysAfterPeriod > 0) {
    const normalizedDayAfter = ((daysAfterPeriod - 1) % totalCycleLen) + 1;
    const cycleDay = normalizedDayAfter;

    if (normalizedDayAfter <= follicularDuration) {
      return {
        dateStr,
        isToday,
        phase: 'Phase1-Follicular',
        isActualPeriod: false,
        isPredictedPeriod: false,
        isOvulationDay: false,
        isFertileWindow: false,
        cycleDay,
        totalCycleDays: totalCycleLen,
        phaseDay: normalizedDayAfter,
        phaseTotalDays: follicularDuration
      };
    } else if (normalizedDayAfter <= follicularDuration + fertileDuration) {
      const isOvulationDay = normalizedDayAfter === follicularDuration + 3;
      const phaseDay = normalizedDayAfter - follicularDuration;
      return {
        dateStr,
        isToday,
        phase: 'Phase2-Ovulation',
        isActualPeriod: false,
        isPredictedPeriod: false,
        isOvulationDay,
        isFertileWindow: true,
        cycleDay,
        totalCycleDays: totalCycleLen,
        phaseDay,
        phaseTotalDays: fertileDuration
      };
    } else if (normalizedDayAfter <= cycleAfterPeriod) {
      const phaseDay = normalizedDayAfter - (follicularDuration + fertileDuration);
      return {
        dateStr,
        isToday,
        phase: 'Phase3-Luteal',
        isActualPeriod: false,
        isPredictedPeriod: false,
        isOvulationDay: false,
        isFertileWindow: false,
        cycleDay,
        totalCycleDays: totalCycleLen,
        phaseDay,
        phaseTotalDays: lutealDuration
      };
    } else {
      // Projected period in future cycle
      const phaseDay = normalizedDayAfter - cycleAfterPeriod;
      return {
        dateStr,
        isToday,
        phase: 'Phase4-Menstrual-Unconfirmed',
        isActualPeriod: false,
        isPredictedPeriod: true,
        isOvulationDay: false,
        isFertileWindow: false,
        cycleDay,
        totalCycleDays: totalCycleLen,
        phaseDay,
        phaseTotalDays: currentPeriodDuration
      };
    }
  }

  // If date is within anchor block (between anchorDate and anchorPeriodEnd):
  if (dateStr >= anchorDate && dateStr <= anchorPeriodEnd) {
    const periodDay = Math.max(1, Math.min(currentPeriodDuration, diffDays(anchorDate, dateStr) + 1));
    const cycleDay = cycleAfterPeriod + periodDay;
    return {
      dateStr,
      isToday,
      phase: 'Phase4-Menstrual',
      isActualPeriod: true,
      isPredictedPeriod: false,
      isOvulationDay: false,
      isFertileWindow: false,
      cycleDay,
      totalCycleDays: totalCycleLen,
      phaseDay: periodDay,
      phaseTotalDays: currentPeriodDuration
    };
  }

  // For dates prior to anchor block:
  const daysBeforeAnchor = diffDays(dateStr, anchorDate);
  const normalizedPrior = ((daysBeforeAnchor % totalCycleLen) + totalCycleLen) % totalCycleLen;
  const cycleDay = ((totalCycleLen - normalizedPrior) % totalCycleLen) + 1;

  let phase: CyclePhase = 'Default';
  let isOvulationDay = false;
  let isFertileWindow = false;
  let phaseDay = 1;
  let phaseTotalDays = follicularDuration;

  if (normalizedPrior <= currentPeriodDuration) {
    phase = 'Phase4-Menstrual-Unconfirmed';
    phaseDay = currentPeriodDuration - normalizedPrior + 1;
    phaseTotalDays = currentPeriodDuration;
  } else if (normalizedPrior <= currentPeriodDuration + lutealDuration) {
    phase = 'Phase3-Luteal';
    phaseDay = currentPeriodDuration + lutealDuration - normalizedPrior + 1;
    phaseTotalDays = lutealDuration;
  } else if (normalizedPrior <= currentPeriodDuration + lutealDuration + fertileDuration) {
    phase = 'Phase2-Ovulation';
    isFertileWindow = true;
    isOvulationDay = normalizedPrior === currentPeriodDuration + lutealDuration + 3;
    phaseDay = currentPeriodDuration + lutealDuration + fertileDuration - normalizedPrior + 1;
    phaseTotalDays = fertileDuration;
  } else {
    phase = 'Phase1-Follicular';
    phaseDay = totalCycleLen - normalizedPrior;
    phaseTotalDays = follicularDuration;
  }

  return {
    dateStr,
    isToday,
    phase,
    isActualPeriod: false,
    isPredictedPeriod: phase === 'Phase4-Menstrual-Unconfirmed',
    isOvulationDay,
    isFertileWindow,
    cycleDay,
    totalCycleDays: totalCycleLen,
    phaseDay,
    phaseTotalDays
  };
}
