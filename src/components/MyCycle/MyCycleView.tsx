import { FC, useMemo } from 'react';
import { UserSettings } from '../../types/cycle';
import { extractPeriodBlocks, diffDays, parseDateISO } from '../../utils/cycleEngine';
import { WaterDropIcon } from '../atoms';
import styles from './MyCycleView.module.css';

interface MyCycleViewProps {
  settings: UserSettings;
  periodDates?: string[];
}

interface CycleBarData {
  dateLabel: string;
  cycleDays: number;
  periodDays: number;
}

export const MyCycleView: FC<MyCycleViewProps> = ({ settings, periodDates = [] }) => {
  // Compute metrics from user's logged period dates, strictly filtering out unlogged gaps (>50 days)
  const cycleStats = useMemo(() => {
    const blocks = extractPeriodBlocks(periodDates);

    // Period length for each declared block
    const periodLengths = blocks.map((b) => b.duration);

    // Calculate cycle intervals ONLY between consecutive declared blocks within physiological range (18 to 50 days).
    // Gaps > 50 days represent missed/untracked months and must NOT be considered as long cycles.
    const validCycleIntervals: number[] = [];
    const validCycleBars: CycleBarData[] = [];

    for (let i = 1; i < blocks.length; i++) {
      const prev = blocks[i - 1];
      const curr = blocks[i];
      const intervalDays = diffDays(prev.startDate, curr.startDate);

      if (intervalDays >= 18 && intervalDays <= 50) {
        validCycleIntervals.push(intervalDays);

        const d = parseDateISO(curr.startDate);
        const dayStr = String(d.getDate()).padStart(2, '0');
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        validCycleBars.push({
          dateLabel: `${dayStr}/${monthStr}`,
          cycleDays: intervalDays,
          periodDays: prev.duration
        });
      }
    }

    // Average period length across all declared period blocks
    const avgPeriodVal =
      periodLengths.length > 0
        ? periodLengths.reduce((sum, v) => sum + v, 0) / periodLengths.length
        : settings.defaultPeriodLength || 4;

    const formattedAvgPeriod = avgPeriodVal.toLocaleString('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });

    if (validCycleIntervals.length > 0) {
      // Find most frequent cycle length (mode)
      const freqMap: Record<number, number> = {};
      let mostFreq = validCycleIntervals[0];
      let maxCount = 0;
      for (const len of validCycleIntervals) {
        freqMap[len] = (freqMap[len] || 0) + 1;
        if (freqMap[len] > maxCount) {
          maxCount = freqMap[len];
          mostFreq = len;
        }
      }

      const shortest = Math.min(...validCycleIntervals);
      const longest = Math.max(...validCycleIntervals);

      return {
        hasData: true,
        mostFrequent: mostFreq,
        frequentFraction: `${maxCount} / ${validCycleIntervals.length} ${
          validCycleIntervals.length > 1 ? 'cycles' : 'cycle'
        }`,
        shortest: String(shortest),
        longest: String(longest),
        averagePeriod: formattedAvgPeriod,
        recentCycles: validCycleBars.slice(-6)
      };
    }

    // When no completed valid cycles are declared yet (0 or 1 period, or only non-consecutive periods)
    const fallbackCycle = settings.defaultCycleLength || 28;
    return {
      hasData: false,
      mostFrequent: fallbackCycle,
      frequentFraction: 'Cycle estimé',
      shortest: '—',
      longest: '—',
      averagePeriod: formattedAvgPeriod,
      recentCycles: []
    };
  }, [periodDates, settings]);

  return (
    <main className={styles.cycleContainer}>
      {/* Left Column (Desktop) / Top Cards (Mobile) */}
      <div className={styles.leftColumn}>
        {/* Card 1: Durée la plus fréquente de mon cycle */}
        <section className={styles.cycleLengthCard} aria-labelledby="cycle-freq-title">
          <div className={styles.cycleLengthTop}>
            <h2 id="cycle-freq-title" className={styles.cardTitle}>
              Durée la plus fréquente de mon cycle
            </h2>
            <div className={styles.cycleLengthRow}>
              <div className={styles.statGroup}>
                <div className={styles.symbolCircle} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7.35 18.5C8.66 17.56 10.26 17 12 17C13.74 17 15.34 17.56 16.65 18.5C15.34 19.44 13.74 20 12 20C10.26 20 8.66 19.44 7.35 18.5ZM18.14 17.12C16.45 15.8 14.32 15 12 15C9.68 15 7.55 15.8 5.86 17.12C4.7 15.73 4 13.95 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 13.95 19.3 15.73 18.14 17.12Z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 6C10.07 6 8.5 7.57 8.5 9.5C8.5 11.43 10.07 13 12 13C13.93 13 15.5 11.43 15.5 9.5C15.5 7.57 13.93 6 12 6ZM12 11C11.17 11 10.5 10.33 10.5 9.5C10.5 8.67 11.17 8 12 8C12.83 8 13.5 8.67 13.5 9.5C13.5 10.33 12.83 11 12 11Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className={styles.bigStatNumber}>{cycleStats.mostFrequent}</p>
                <p className={styles.unitText}>jours</p>
              </div>
              <div className={styles.cyclesBadge}>
                {cycleStats.frequentFraction}
              </div>
            </div>
          </div>

          <div className={styles.cycleLengthBottom}>
            <div className={styles.subStatItem}>
              <p className={styles.cardTitle}>Durée la plus courte</p>
              <div className={styles.subStatRow}>
                <p className={styles.mediumStatNumber}>{cycleStats.shortest}</p>
                {cycleStats.shortest !== '—' && <p className={styles.subUnitText}>jours</p>}
              </div>
            </div>

            <div className={`${styles.subStatItem} ${styles.subStatDivider}`}>
              <p className={styles.cardTitle}>Durée la plus longue</p>
              <div className={styles.subStatRow}>
                <p className={styles.mediumStatNumber}>{cycleStats.longest}</p>
                {cycleStats.longest !== '—' && <p className={styles.subUnitText}>jours</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Card 2: Durée moyenne de mes règles */}
        <section className={styles.periodAverageCard} aria-labelledby="period-avg-title">
          <h2 id="period-avg-title" className={styles.cardTitle}>
            Durée moyenne de mes règles
          </h2>
          <div className={styles.statGroup}>
            <div className={styles.symbolCircle} aria-hidden="true">
              <WaterDropIcon size={24} />
            </div>
            <p className={styles.bigStatNumber}>{cycleStats.averagePeriod}</p>
            <p className={styles.unitText}>jours</p>
          </div>
        </section>
      </div>

      {/* Right Column (Desktop) / Bottom Card (Mobile) */}
      <section className={styles.chartCard} aria-labelledby="chart-title">
        <div className={styles.chartHeader}>
          <h2 id="chart-title" className={styles.cardTitle}>
            Evolutions de mes derniers cycles
          </h2>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDotCycle} aria-hidden="true" />
              <p className={styles.legendLabel}>Cycle</p>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDotPeriod} aria-hidden="true" />
              <p className={styles.legendLabel}>Règles</p>
            </div>
          </div>
        </div>

        {/* Plot Area with 0 to 40 axis & stacked bars */}
        <div className={styles.plotArea} role="img" aria-label="Graphique des durées de cycle et de règles des derniers mois">
          {/* Horizontal gridlines: 40, 30, 20, 10, 0 (step = 40px, 4px per day) */}
          {[
            { value: 40, top: 0 },
            { value: 30, top: 40 },
            { value: 20, top: 80 },
            { value: 10, top: 120 },
            { value: 0, top: 160 }
          ].map((grid) => (
            <div
              key={grid.value}
              className={styles.yAxisRow}
              style={{ top: `${grid.top}px` }}
            >
              <span className={styles.yAxisLabel}>{grid.value}</span>
              <span className={styles.yAxisDivider} />
            </div>
          ))}

          {/* Stacked Bars for each recent cycle */}
          <div className={styles.barsContainer}>
            {cycleStats.recentCycles.length > 0 ? (
              cycleStats.recentCycles.map((cycle, idx) => {
                // Scale: 0 to 40 days mapped to 0 to 160px (4px per day)
                const totalDays = Math.min(Math.max(cycle.cycleDays, 0), 40);
                const periodDays = Math.min(Math.max(cycle.periodDays, 0), totalDays);

                const totalHeightPx = totalDays * 4;
                const periodHeightPx = periodDays * 4;
                const cycleHeightPx = totalHeightPx - periodHeightPx;

                const topOfTotalBarPx = 160 - totalHeightPx;
                const topOfPeriodPx = 160 - periodHeightPx;

                return (
                  <div key={`${cycle.dateLabel}-${idx}`} className={styles.barColumn}>
                    <div className={styles.barStack}>
                      {/* Dark Cycle Bar (Upper portion, with rounded top corners) */}
                      <div
                        className={styles.barCyclePart}
                        style={{
                          top: `${topOfTotalBarPx}px`,
                          height: `${cycleHeightPx}px`
                        }}
                        title={`Cycle total : ${cycle.cycleDays} jours`}
                      />
                      {/* Yellow Period Bar (Lower portion) */}
                      <div
                        className={styles.barPeriodPart}
                        style={{
                          top: `${topOfPeriodPx}px`,
                          height: `${periodHeightPx}px`
                        }}
                        title={`Règles : ${cycle.periodDays} jours`}
                      />
                    </div>
                    <span className={styles.xAxisLabel}>{cycle.dateLabel}</span>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyChartMessage}>
                <p>Enregistrez vos prochaines règles pour afficher l’évolution de vos cycles.</p>
              </div>
            )}
          </div>
        </div>

        {/* Informative text below chart matching Figma */}
        <p className={styles.chartDescription}>
          Le cycle dure en moyenne 28,5 jours et peut varier de 21 à 35 jours. D’un mois à un autre, il peut raccourcir ou rallonger de 4 à 5 jours. La durée du cycle a tendance à se réduire progressivement en vieillissant.
        </p>
      </section>
    </main>
  );
};
