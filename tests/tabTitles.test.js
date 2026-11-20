import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  diffDays,
  extractPeriodBlocks,
  computeCycleMetrics
} from '../src/utils/cycleEngine.ts';

test('All 3 tabs hide the Title pill on mobile and keep it sticky at the top on desktop using design tokens', () => {
  const indexCss = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');
  assert.match(indexCss, /--typo-h0-size:\s*24px/);
  assert.match(indexCss, /--typo-h0-weight:\s*700/);

  const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.match(appTsx, /<h1[^>]*className=\{styles\.pageTitle\}[^>]*>\s*Calendrier\s*<\/h1>/);

  const recTsx = fs.readFileSync(
    path.resolve('src/components/Recommendations/RecommendationsView.tsx'),
    'utf-8'
  );
  assert.match(recTsx, /<h1[^>]*className=\{styles\.pageTitle\}[^>]*>\s*Recommandations\s*<\/h1>/);

  const cycleTsx = fs.readFileSync(
    path.resolve('src/components/MyCycle/MyCycleView.tsx'),
    'utf-8'
  );
  assert.match(cycleTsx, /<h1[^>]*className=\{styles\.pageTitle\}[^>]*>\s*Mon cycle\s*<\/h1>/);

  for (const cssFile of [
    'src/components/Calendar/Calendar.module.css',
    'src/components/Recommendations/RecommendationsView.module.css',
    'src/components/MyCycle/MyCycleView.module.css'
  ]) {
    const css = fs.readFileSync(path.resolve(cssFile), 'utf-8');
    // Hidden on mobile by default
    assert.match(
      css,
      /\.pageTitleRow\s*\{\s*display:\s*none;\s*\}/,
      `${cssFile} must hide .pageTitleRow on mobile`
    );
    // Sticky on desktop
    assert.match(
      css,
      /\.pageTitleRow\s*\{[^}]*position:\s*sticky;/,
      `${cssFile} must make .pageTitleRow sticky on desktop`
    );
    assert.match(
      css,
      /\.pageTitle\s*\{[\s\S]*?background-color:\s*var\(--background-level-2\)/,
      `${cssFile} .pageTitle must use var(--background-level-2)`
    );
    assert.match(
      css,
      /\.pageTitle\s*\{[\s\S]*?padding:\s*var\(--spacing-sm\)\s+var\(--spacing-lg\)/,
      `${cssFile} .pageTitle must use token padding`
    );
    assert.match(
      css,
      /\.pageTitle\s*\{[\s\S]*?border-radius:\s*var\(--radius-md\)/,
      `${cssFile} .pageTitle must use var(--radius-md)`
    );
    assert.match(
      css,
      /\.pageTitle\s*\{[\s\S]*?font-size:\s*var\(--typo-h0-size\)/,
      `${cssFile} .pageTitle must use var(--typo-h0-size)`
    );
  }
});

test('extractPeriodBlocks counts exact declared days and MyCycleView renders hover/click tooltip with design tokens', () => {
  // Exact day count even if 1 day is skipped inside a <=3 day merge window
  const blocksWithGap = extractPeriodBlocks([
    '2026-07-01',
    '2026-07-02',
    '2026-07-04',
    '2026-07-29',
    '2026-07-30',
    '2026-07-31',
    '2026-08-01'
  ]);
  assert.equal(blocksWithGap.length, 2);
  assert.equal(blocksWithGap[0].duration, 3);
  assert.equal(blocksWithGap[1].duration, 4);
  assert.equal(diffDays(blocksWithGap[0].startDate, blocksWithGap[1].startDate), 28);

  const metrics = computeCycleMetrics(blocksWithGap, {
    defaultCycleLength: 28,
    defaultPeriodLength: 4,
    lutealPhaseLength: 14,
    isOnboarded: true
  });
  assert.equal(metrics.cycleLength, 28);
  assert.equal(metrics.periodLength, 4);

  const cycleTsx = fs.readFileSync(
    path.resolve('src/components/MyCycle/MyCycleView.tsx'),
    'utf-8'
  );
  // Uses prev.startDate for cycle bar dateLabel
  assert.match(cycleTsx, /parseDateISO\(prev\.startDate\)/);
  // Supports hover on desktop (onPointerEnter) and click on mobile (onClick) for chart tooltip
  assert.match(cycleTsx, /onPointerEnter=/);
  assert.match(cycleTsx, /onClick=/);
  assert.match(cycleTsx, /role="tooltip"/);

  const cycleCss = fs.readFileSync(
    path.resolve('src/components/MyCycle/MyCycleView.module.css'),
    'utf-8'
  );
  assert.match(cycleCss, /\.barTooltip\s*\{[\s\S]*?background-color:\s*var\(--background-level-1\)/);
  assert.match(cycleCss, /\.barTooltip\s*\{[\s\S]*?border:\s*1px solid var\(--border\)/);
});
