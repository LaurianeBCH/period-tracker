import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CURVE_SEGMENTS,
  getAnalyticalCurvePoint,
  getCurvePointAtProgress,
  getTargetCurveProgress
} from '../src/utils/curveMath.ts';

test('CURVE_SEGMENTS connects Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 without gap', () => {
  // Analytical endpoints
  const p1End = getAnalyticalCurvePoint('phase1', 1);
  const p2Start = getAnalyticalCurvePoint('phase2', 0);
  const p2End = getAnalyticalCurvePoint('phase2', 1);
  const p3Start = getAnalyticalCurvePoint('phase3', 0);
  const p3End = getAnalyticalCurvePoint('phase3', 1);
  const p4Start = getAnalyticalCurvePoint('phase4', 0);

  // Phase 1 end == Phase 2 start
  assert.equal(p1End.x, p2Start.x);
  assert.equal(p1End.y, p2Start.y);

  // Phase 2 end == Phase 3 start (specifically requested by user)
  assert.equal(p2End.x, p3Start.x);
  assert.equal(p2End.y, p3Start.y);

  // Phase 3 end == Phase 4 start
  assert.equal(p3End.x, p4Start.x);
  assert.equal(p3End.y, p4Start.y);

  // Verify SVG pathD string for phase2 ends where phase3 starts
  const phase2EndMatch = CURVE_SEGMENTS.phase2.pathD.trim().match(/([\d.]+)\s+([\d.]+)$/);
  const phase3StartMatch = CURVE_SEGMENTS.phase3.pathD.trim().match(/^M\s+([\d.]+)\s+([\d.]+)/);
  assert.ok(phase2EndMatch, 'phase2.pathD should end with x y coordinates');
  assert.ok(phase3StartMatch, 'phase3.pathD should start with M x y coordinates');
  assert.equal(Number(phase2EndMatch[1]), Number(phase3StartMatch[1]));
  assert.equal(Number(phase2EndMatch[2]), Number(phase3StartMatch[2]));
});

test('getCurvePointAtProgress interpolates continuously from start of curve to target day', () => {
  const start = getCurvePointAtProgress(0);
  const p1Start = getAnalyticalCurvePoint('phase1', 0);
  assert.deepEqual(start, p1Start);

  const junction23 = getCurvePointAtProgress(2);
  const p3Start = getAnalyticalCurvePoint('phase3', 0);
  assert.deepEqual(junction23, p3Start);

  const targetProgress = getTargetCurveProgress('Phase3-Luteal', 3, 6);
  assert.ok(targetProgress > 2 && targetProgress < 3);
});

test('PhaseInsightsCard and Calendar.module.css satisfy marker shadow, no-hover/no-label, and curve animation requirements', () => {
  const cardTsx = fs.readFileSync(
    path.resolve('src/components/Calendar/PhaseInsightsCard.tsx'),
    'utf-8'
  );
  const calendarCss = fs.readFileSync(
    path.resolve('src/components/Calendar/Calendar.module.css'),
    'utf-8'
  );

  // 1. No tooltip/label or hover handlers on dayMarkerCircle / dayMarkerGroup
  assert.doesNotMatch(cardTsx, /showTooltip/);
  assert.doesNotMatch(cardTsx, /markerTooltip/);
  assert.doesNotMatch(cardTsx, /Jour J \(J/);
  assert.doesNotMatch(calendarCss, /\.dayMarkerGroup:hover/);
  assert.doesNotMatch(calendarCss, /\.markerTooltip/);

  // 2. Shadow of dayMarkerCircle uses var(--accent) instead of hardcoded #FBFF24
  assert.doesNotMatch(cardTsx, /#FBFF24/i);
  assert.match(cardTsx, /var\(--accent\)/);

  // 3. Animates along the curve via requestAnimationFrame
  assert.match(cardTsx, /requestAnimationFrame/);
});
