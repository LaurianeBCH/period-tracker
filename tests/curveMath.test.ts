import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTodayCurvePosition,
  getSegmentKeyFromPhase,
  CURVE_SEGMENTS
} from '../src/utils/curveMath.ts';

test('getSegmentKeyFromPhase maps all cycle phases correctly', () => {
  assert.equal(getSegmentKeyFromPhase('Phase1-Follicular'), 'phase1');
  assert.equal(getSegmentKeyFromPhase('Phase2-Ovulation'), 'phase2');
  assert.equal(getSegmentKeyFromPhase('Phase3-Luteal'), 'phase3');
  assert.equal(getSegmentKeyFromPhase('Phase4-Menstrual'), 'phase4');
  assert.equal(getSegmentKeyFromPhase('Phase4-Menstrual-Unconfirmed'), 'phase4');
  assert.equal(getSegmentKeyFromPhase('Default'), 'phase4');
});

test('Segment 1 (Folliculaire) advances day after day within x boundaries [0, 62.87]', () => {
  const totalDays = 6;
  let prevX = -1;
  let prevY = 200;

  for (let day = 1; day <= totalDays; day++) {
    const { point, segmentKey } = calculateTodayCurvePosition('Phase1-Follicular', day, totalDays);
    assert.equal(segmentKey, 'phase1');
    assert.ok(point.x >= 0 && point.x <= CURVE_SEGMENTS.phase1.endX, `x=${point.x} in bounds`);
    assert.ok(point.y >= 1 && point.y <= 163, `y=${point.y} in bounds`);
    assert.ok(point.x > prevX, `day ${day} x (${point.x}) should be greater than prev x (${prevX})`);
    assert.ok(point.y < prevY, `day ${day} y (${point.y}) should climb higher than prev y (${prevY})`);
    prevX = point.x;
    prevY = point.y;
  }
});

test('Segment 2 (Ovulation) advances within x boundaries [62.87, 130]', () => {
  const totalDays = 5;
  for (let day = 1; day <= totalDays; day++) {
    const { point, segmentKey } = calculateTodayCurvePosition('Phase2-Ovulation', day, totalDays);
    assert.equal(segmentKey, 'phase2');
    assert.ok(point.x >= CURVE_SEGMENTS.phase2.startX && point.x <= CURVE_SEGMENTS.phase2.endX);
    assert.ok(point.y >= 1 && point.y <= 160);
  }
});

test('Segment 3 (Lutéale) advances within x boundaries [130, 297.24]', () => {
  const totalDays = 13;
  let prevX = 129;
  for (let day = 1; day <= totalDays; day++) {
    const { point, segmentKey } = calculateTodayCurvePosition('Phase3-Luteal', day, totalDays);
    assert.equal(segmentKey, 'phase3');
    assert.ok(point.x >= CURVE_SEGMENTS.phase3.startX && point.x <= CURVE_SEGMENTS.phase3.endX);
    assert.ok(point.x > prevX, `Day ${day} x must increase monotonically`);
    prevX = point.x;
  }
});

test('Segment 4 (Menstruation) stays flat on baseline y=173.139 and advances horizontally [297.24, 369]', () => {
  const totalDays = 4;
  let prevX = 296;
  for (let day = 1; day <= totalDays; day++) {
    const { point, segmentKey } = calculateTodayCurvePosition('Phase4-Menstrual', day, totalDays);
    assert.equal(segmentKey, 'phase4');
    assert.ok(point.x >= CURVE_SEGMENTS.phase4.startX && point.x <= CURVE_SEGMENTS.phase4.endX);
    assert.equal(Math.round(point.y), 173);
    assert.ok(point.x > prevX, `Day ${day} x must advance horizontally`);
    prevX = point.x;
  }
});
