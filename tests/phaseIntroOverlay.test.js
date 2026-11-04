import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('PhaseIntroOverlay component and CSS adhere to design tokens and Phase 4 rules', () => {
  const tsxPath = path.resolve('src/components/PhaseIntroOverlay/PhaseIntroOverlay.tsx');
  const cssPath = path.resolve('src/components/PhaseIntroOverlay/PhaseIntroOverlay.module.css');
  const indexPath = path.resolve('src/components/PhaseIntroOverlay/index.ts');

  assert.strictEqual(fs.existsSync(tsxPath), true, 'PhaseIntroOverlay.tsx must exist');
  assert.strictEqual(fs.existsSync(cssPath), true, 'PhaseIntroOverlay.module.css must exist');
  assert.strictEqual(fs.existsSync(indexPath), true, 'index.ts must exist');

  const css = fs.readFileSync(cssPath, 'utf-8');
  assert.match(css, /var\(--background-level-1\)/, 'Overlay background must use --background-level-1 token');
  assert.match(css, /var\(--spacing-/, 'Overlay spacing must use --spacing-* token');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}|rgba?\(/, 'CSS must not contain hardcoded color values (AGENTS.md)');

  const tsx = fs.readFileSync(tsxPath, 'utf-8');
  assert.match(tsx, /shouldPlayPhaseIntro/, 'Must export shouldPlayPhaseIntro helper');
  assert.match(tsx, /Phase4-Menstrual/, 'Must check for Phase4-Menstrual');
  assert.match(tsx, /phase4-anim\.png/, 'Must reference compressed phase4-anim.png');
  assert.match(tsx, /phase4-audio\.m4a/, 'Must reference compressed phase4-audio.m4a');
  assert.match(tsx, /\.play\(\)\.catch\(/, 'Must handle browser autoplay rejection gracefully');
  assert.doesNotMatch(tsx, /<button/i, 'Must not render any sound button on the intro overlay');
});

test('App.tsx mounts PhaseIntroOverlay for the active phase and plays once on Phase 4 entry', () => {
  const appCode = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.match(appCode, /PhaseIntroOverlay/, 'App.tsx must import and render PhaseIntroOverlay');

  const tsx = fs.readFileSync(path.resolve('src/components/PhaseIntroOverlay/PhaseIntroOverlay.tsx'), 'utf-8');
  assert.match(tsx, /hasPlayedRef/, 'PhaseIntroOverlay must track playback via hasPlayedRef so it plays on startup or post-onboarding Phase 4 entry');
});

