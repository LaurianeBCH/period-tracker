import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('All 3 tabs (Calendrier, Recommandations, Mon cycle) render the Figma Title pill using design tokens', () => {
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
    assert.match(css, /\.pageTitleRow\s*\{/, `${cssFile} must define .pageTitleRow`);
    assert.match(css, /\.pageTitle\s*\{[\s\S]*?background-color:\s*var\(--background-level-2\)/, `${cssFile} .pageTitle must use var(--background-level-2)`);
    assert.match(css, /\.pageTitle\s*\{[\s\S]*?padding:\s*var\(--spacing-sm\)\s+var\(--spacing-lg\)/, `${cssFile} .pageTitle must use token padding`);
    assert.match(css, /\.pageTitle\s*\{[\s\S]*?border-radius:\s*var\(--radius-md\)/, `${cssFile} .pageTitle must use var(--radius-md)`);
    assert.match(css, /\.pageTitle\s*\{[\s\S]*?font-size:\s*var\(--typo-h0-size\)/, `${cssFile} .pageTitle must use var(--typo-h0-size)`);
  }
});
