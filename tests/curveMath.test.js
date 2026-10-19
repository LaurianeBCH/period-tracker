import test from 'node:test';
import assert from 'node:assert/strict';

function cubicBezier(t, p0, p1, p2, p3) {
  const oneMinusT = 1 - t;
  return (
    oneMinusT * oneMinusT * oneMinusT * p0 +
    3 * oneMinusT * oneMinusT * t * p1 +
    3 * oneMinusT * t * t * p2 +
    t * t * t * p3
  );
}

function getAnalyticalCurvePoint(segmentKey, progress) {
  const t = Math.max(0, Math.min(1, progress));
  switch (segmentKey) {
    case 'phase1':
      return {
        x: cubicBezier(t, 0, 52.8437, 44.6364, 62.8715),
        y: cubicBezier(t, 162.826, 162.826, 1, 1)
      };
    case 'phase2':
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
    case 'phase3':
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
    case 'phase4':
    default:
      return {
        x: 297.242 + t * (369 - 297.242),
        y: 173.139
      };
  }
}

test('Day progression on segment 1 matches Figma avatar at t=0.25', () => {
  const pt = getAnalyticalCurvePoint('phase1', 0.25);
  // Figma avatar was at x=21.57, y=119.43
  assert.ok(Math.abs(pt.x - 21.57) < 2, `x ${pt.x} close to 21.57`);
  assert.ok(Math.abs(pt.y - 119.43) < 2, `y ${pt.y} close to 119.43`);
});

test('Segment 1 progression increases x and reaches top peak at end', () => {
  const pStart = getAnalyticalCurvePoint('phase1', 0.0);
  const pEnd = getAnalyticalCurvePoint('phase1', 1.0);
  assert.equal(Math.round(pStart.x), 0);
  assert.equal(Math.round(pStart.y), 163);
  assert.equal(Math.round(pEnd.x), 63);
  assert.equal(Math.round(pEnd.y), 1);
});

test('Segment 2 progression drops to bottom then rises slightly', () => {
  const pBottom = getAnalyticalCurvePoint('phase2', 0.65);
  const pEnd = getAnalyticalCurvePoint('phase2', 1.0);
  assert.equal(Math.round(pBottom.y), 153);
  assert.equal(Math.round(pEnd.x), 130);
  assert.equal(Math.round(pEnd.y), 139);
});

test('Segment 3 rises to broad wave peak then returns to baseline', () => {
  const pPeak = getAnalyticalCurvePoint('phase3', 0.5);
  const pEnd = getAnalyticalCurvePoint('phase3', 1.0);
  assert.equal(Math.round(pPeak.x), 203);
  assert.equal(Math.round(pPeak.y), 56);
  assert.equal(Math.round(pEnd.x), 298);
  assert.equal(Math.round(pEnd.y), 173);
});

test('Segment 4 is horizontal on baseline 173.139', () => {
  const p1 = getAnalyticalCurvePoint('phase4', 0.2);
  const p2 = getAnalyticalCurvePoint('phase4', 0.8);
  assert.equal(p1.y, 173.139);
  assert.equal(p2.y, 173.139);
  assert.ok(p2.x > p1.x);
});
