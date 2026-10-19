export interface Point {
  x: number;
  y: number;
}

export type CycleSegmentKey = 'phase1' | 'phase2' | 'phase3' | 'phase4';

export const CURVE_SEGMENTS = {
  phase1: {
    key: 'phase1' as const,
    label: "Prise d’élan (folliculaire)",
    badge: '1',
    startX: 0,
    endX: 62.8715,
    pathD: "M 0 162.826 C 52.8437 162.826, 44.6364 1, 62.8715 1"
  },
  phase2: {
    key: 'phase2' as const,
    label: "Debout sur la planche (ovulation)",
    badge: '2',
    startX: 62.8715,
    endX: 130.0,
    pathD: "M 62.8715 1 C 81.7275 1, 73.9072 153.32, 106.2893 153.32 C 117.7733 153.32, 122.1795 147.343, 129.9982 139.06"
  },
  phase3: {
    key: 'phase3' as const,
    label: "Dans le tube de la vague (lutéale)",
    badge: '3',
    startX: 130.0,
    endX: 297.242,
    pathD: "M 130.813 141.005 C 152.086 111.197, 165.23 56.302, 202.54 56.302 C 266.026 56.302, 266.874 173.139, 298.056 173.139"
  },
  phase4: {
    key: 'phase4' as const,
    label: "Repos avant la prochaine vague (règle)",
    badge: 'waterdrop',
    startX: 297.242,
    endX: 369.0,
    pathD: "M 297.242 173.139 H 369"
  }
};

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const oneMinusT = 1 - t;
  return (
    oneMinusT * oneMinusT * oneMinusT * p0 +
    3 * oneMinusT * oneMinusT * t * p1 +
    3 * oneMinusT * t * t * p2 +
    t * t * t * p3
  );
}

/**
 * Computes coordinate (x, y) on the cycle curve for a given phase and day progress.
 * @param segmentKey 'phase1' | 'phase2' | 'phase3' | 'phase4'
 * @param progress 0.0 to 1.0 within the segment
 */
export function getAnalyticalCurvePoint(segmentKey: CycleSegmentKey, progress: number): Point {
  const t = Math.max(0, Math.min(1, progress));

  switch (segmentKey) {
    case 'phase1': {
      // Single cubic bezier
      return {
        x: cubicBezier(t, 0, 52.8437, 44.6364, 62.8715),
        y: cubicBezier(t, 162.826, 162.826, 1, 1)
      };
    }
    case 'phase2': {
      // Split in 2 sub-curves at t=0.65 (where curve reaches bottom)
      if (t < 0.65) {
        const subT = t / 0.65;
        return {
          x: cubicBezier(subT, 62.8715, 81.7275, 73.9072, 106.2893),
          y: cubicBezier(subT, 1, 1, 153.32, 153.32)
        };
      } else {
        const subT = (t - 0.65) / 0.35;
        return {
          x: cubicBezier(subT, 106.2893, 117.7733, 122.1795, 129.9982),
          y: cubicBezier(subT, 153.32, 153.32, 147.343, 139.06)
        };
      }
    }
    case 'phase3': {
      // Split in 2 sub-curves: rising to peak (t < 0.5) and descending to baseline (t >= 0.5)
      if (t < 0.5) {
        const subT = t / 0.5;
        return {
          x: cubicBezier(subT, 130.813, 152.086, 165.23, 202.54),
          y: cubicBezier(subT, 141.005, 111.197, 56.302, 56.302)
        };
      } else {
        const subT = (t - 0.5) / 0.5;
        return {
          x: cubicBezier(subT, 202.54, 266.026, 266.874, 298.056),
          y: cubicBezier(subT, 56.302, 56.302, 173.139, 173.139)
        };
      }
    }
    case 'phase4':
    default: {
      // Flat horizontal line
      return {
        x: 297.242 + t * (369 - 297.242),
        y: 173.139
      };
    }
  }
}

/**
 * Maps DayStatus phase string to segment key
 */
export function getSegmentKeyFromPhase(phase: string): CycleSegmentKey {
  switch (phase) {
    case 'Phase1-Follicular':
      return 'phase1';
    case 'Phase2-Ovulation':
      return 'phase2';
    case 'Phase3-Luteal':
      return 'phase3';
    case 'Phase4-Menstrual':
    case 'Phase4-Menstrual-Unconfirmed':
    default:
      return 'phase4';
  }
}

/**
 * Calculates day progress [0..1] and (x, y) point for today's status
 */
export function calculateTodayCurvePosition(
  phase: string,
  phaseDay: number = 1,
  phaseTotalDays: number = 1
): { segmentKey: CycleSegmentKey; progress: number; point: Point } {
  const segmentKey = getSegmentKeyFromPhase(phase);
  const total = Math.max(1, phaseTotalDays);
  const day = Math.max(1, Math.min(total, phaseDay));

  // Equidistant day advancement: day 1 is at 0.5/total, day N is at (N - 0.5)/total
  const progress = (day - 0.5) / total;
  const point = getAnalyticalCurvePoint(segmentKey, progress);

  return { segmentKey, progress, point };
}
