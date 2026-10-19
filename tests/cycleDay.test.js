import test from 'node:test';
import assert from 'node:assert';
import { getDayStatus } from '../src/utils/cycleEngine.ts';

test('getDayStatus calculates cycleDay and totalCycleDays', () => {
  const settings = {
    defaultCycleLength: 28,
    defaultPeriodLength: 4,
    lutealPhaseLength: 14,
    isOnboarded: true
  };

  // Period from 2026-08-01 to 2026-08-04 (4 days)
  const periodDates = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04'];

  // Day after period: 2026-08-05 should be Day 1 of Phase 1 (cycleDay 1)
  const day5 = getDayStatus('2026-08-05', settings, periodDates);
  assert.strictEqual(day5.phase, 'Phase1-Follicular');
  assert.strictEqual(day5.cycleDay, 1);
  assert.strictEqual(day5.totalCycleDays, 28);
  assert.strictEqual(day5.phaseDay, 1);
  assert.strictEqual(day5.phaseTotalDays, 6);

  // Day 6 of Phase 1: 2026-08-10 (cycleDay 6)
  const day10 = getDayStatus('2026-08-10', settings, periodDates);
  assert.strictEqual(day10.phase, 'Phase1-Follicular');
  assert.strictEqual(day10.cycleDay, 6);

  // Day 1 of Phase 2 (Ovulation): 2026-08-11 (cycleDay 7)
  const day11 = getDayStatus('2026-08-11', settings, periodDates);
  assert.strictEqual(day11.phase, 'Phase2-Ovulation');
  assert.strictEqual(day11.cycleDay, 7);

  // Day 1 of Period: 2026-08-01 (cycleDay 25)
  const day1 = getDayStatus('2026-08-01', settings, periodDates);
  assert.strictEqual(day1.phase, 'Phase4-Menstrual');
  assert.strictEqual(day1.cycleDay, 25);
});
