import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('PhaseIntroOverlay supports all 4 phases, uses design tokens, has no audio, and triggers on startup and phase change', () => {
  const tsxPath = path.resolve('src/components/PhaseIntroOverlay/PhaseIntroOverlay.tsx');
  const cssPath = path.resolve('src/components/PhaseIntroOverlay/PhaseIntroOverlay.module.css');
  const appPath = path.resolve('src/App.tsx');

  const css = fs.readFileSync(cssPath, 'utf-8');
  assert.match(css, /var\(--background-level-1\)/, 'Overlay background must use --background-level-1 token');
  assert.match(css, /var\(--spacing-/, 'Overlay spacing must use --spacing-* token');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}|rgba?\(/, 'CSS must not contain hardcoded color values (AGENTS.md)');

  const tsx = fs.readFileSync(tsxPath, 'utf-8');
  for (const file of ['phase1-anim.png', 'phase2-anim.png', 'phase3-anim.png', 'phase4-anim.png']) {
    assert.ok(tsx.includes(file), `PhaseIntroOverlay must configure ${file}`);
  }
  for (const theme of ['phase 1', 'phase 2', 'phase 3', 'phase 4']) {
    assert.ok(tsx.includes(theme), `PhaseIntroOverlay must configure data-theme "${theme}"`);
  }
  assert.doesNotMatch(tsx, /new Audio|\.m4a|\.play\(/, 'PhaseIntroOverlay must not contain any audio playback');
  assert.match(tsx, /shouldTriggerPhaseIntro/, 'PhaseIntroOverlay must export shouldTriggerPhaseIntro');
  assert.match(tsx, /lastPlayedPhaseRef/, 'PhaseIntroOverlay must track lastPlayedPhaseRef to trigger on startup and phase change');

  const appCode = fs.readFileSync(appPath, 'utf-8');
  assert.match(appCode, /<PhaseIntroOverlay\s+phase=\{todayInsight\.phaseKey\}/, 'App.tsx must pass todayInsight.phaseKey to PhaseIntroOverlay');
});
