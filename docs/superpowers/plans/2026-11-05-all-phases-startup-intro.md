# All Phases Startup & Phase-Change Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compress all 4 phase animations (`Ressources/phase1.png`..`phase4.png`) with `num_plays = 1` (no loop), remove all audio playback, and display the matching fullscreen phase animation once at startup and once whenever a period declaration changes the current phase (`todayInsight.phaseKey`).

**Architecture:**
- `scripts/compress-intro-media.py` processes `Ressources/phase1.png`, `phase2.png`, `phase3.png`, and `phase4.png` into `public/intro/phase1-anim.png`..`phase4-anim.png`, rewrites each `acTL` chunk with `num_plays = 1` (single play, no loop), compresses frame data when smaller than source, and removes `public/intro/phase4-audio.m4a`.
- `src/components/PhaseIntroOverlay/PhaseIntroOverlay.tsx` maps each normalized phase (`Phase1-Follicular`, `Phase2-Ovulation`, `Phase3-Luteal`, `Phase4-Menstrual`) to its animation file, single-loop duration (`1568`, `1786`, `1552`, `1995` ms), and `data-theme` (`"phase 1"`..`"phase 4"`), tracks `lastPlayedPhaseRef` so it plays once on initial startup and re-triggers once whenever `phase` changes to a different phase, and appends `?run=${runId}` to `<img src>` so the browser restarts the `num_plays=1` APNG cleanly.
- `PhaseIntroOverlay.module.css` uses exclusively CSS design tokens from `src/index.css` per `AGENTS.md`.

**Tech Stack:** React 19, TypeScript, Vite, CSS Modules (Design Tokens), Node.js native test runner (`node --test`), Python 3 (`zlib`/`struct`).

**Spec:** `docs/superpowers/specs/2026-11-05-all-phases-startup-intro-design.md`

## Global Constraints

- **CSS Design Tokens mandatory (`AGENTS.md`)**: `PhaseIntroOverlay.module.css` must only use design tokens (`var(--background-level-1)`, `var(--spacing-*)`, `var(--radius-*)`). No hardcoded `#hex` or `rgb()` values.
- **No music / audio**: No `Audio` instance or `.m4a` asset anywhere in `PhaseIntroOverlay` or `public/intro/`.
- **No loop (`num_plays = 1`)**: Every output APNG in `public/intro/phase{1..4}-anim.png` must have `num_plays === 1` in its `acTL` chunk, and the overlay must fade out right at the end of a single playthrough.
- **Trigger on startup and on phase-changing declaration only**: Play once on initial mount, and replay only when `normalizeIntroPhase(phase) !== lastPlayedPhaseRef.current`.

## Review Focus

1. **Single-play APNG header (`num_plays = 1`) across all 4 animations**: Each `public/intro/phase{1..4}-anim.png` must exist, preserve all source frames (`16`, `19`, `16`, `21`), have `num_plays === 1` in `acTL`, and be smaller than or equal to its source file.
2. **Complete removal of audio**: `public/intro/phase4-audio.m4a` must not exist, and `PhaseIntroOverlay.tsx` must contain no `new Audio` or `.play()` calls.
3. **Phase-change re-triggering & cache-busting**: When a user declares period dates that change `todayInsight.phaseKey` (e.g. from `Phase1-Follicular` to `Phase4-Menstrual`), `PhaseIntroOverlay` must detect `normalizedPhase !== lastPlayedPhaseRef.current`, increment `runId`, and render `<img key={runId} src="...phase4-anim.png?run=..." />` so the browser replays the `num_plays=1` APNG from frame 0.
4. **No re-trigger when declaration does not change current phase**: If a calendar click leaves `todayInsight.phaseKey` unchanged, `lastPlayedPhaseRef.current === normalizedPhase` must prevent re-running the animation.
5. **Strict CSS Design Token compliance & per-phase theme**: `PhaseIntroOverlay.module.css` must have zero hardcoded colors and `.overlay` must set `data-theme={config.theme}` (`"phase 1"`..`"phase 4"`).

---

### Task 1: Compress All 4 Phase Animations (`num_plays = 1`) and Remove Audio

**Files:**
- Modify: `scripts/compress-intro-media.py`
- Create: `public/intro/phase1-anim.png`
- Create: `public/intro/phase2-anim.png`
- Create: `public/intro/phase3-anim.png`
- Modify: `public/intro/phase4-anim.png`
- Delete: `public/intro/phase4-audio.m4a`
- Modify: `tests/introMedia.test.js`

**Interfaces:**
- Consumes: `Ressources/phase1.png` (16 frames), `Ressources/phase2.png` (19 frames), `Ressources/phase3.png` (16 frames), `Ressources/phase4.png` (21 frames)
- Produces: `public/intro/phase1-anim.png`, `public/intro/phase2-anim.png`, `public/intro/phase3-anim.png`, `public/intro/phase4-anim.png` (each with `acTL.num_plays === 1` and size < 600 KB), and removes `public/intro/phase4-audio.m4a`.

- [ ] **Step 1: Update `tests/introMedia.test.js` with failing assertions for all 4 animations (`num_plays = 1`) and no audio**

```js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const EXPECTED_PHASES = [
  { file: 'phase1-anim.png', source: 'phase1.png', frames: 16 },
  { file: 'phase2-anim.png', source: 'phase2.png', frames: 19 },
  { file: 'phase3-anim.png', source: 'phase3.png', frames: 16 },
  { file: 'phase4-anim.png', source: 'phase4.png', frames: 21 }
];

test('All 4 phase intro animations exist, are compressed, have num_plays=1 (no loop), and audio is removed', () => {
  const audioPath = path.resolve('public/intro/phase4-audio.m4a');
  assert.strictEqual(fs.existsSync(audioPath), false, 'phase4-audio.m4a must be removed');

  for (const { file, source, frames } of EXPECTED_PHASES) {
    const outPath = path.resolve('public/intro', file);
    const srcPath = path.resolve('Ressources', source);
    assert.strictEqual(fs.existsSync(outPath), true, `${file} must exist`);

    const outBytes = fs.readFileSync(outPath);
    const srcSize = fs.statSync(srcPath).size;

    assert.ok(outBytes.length <= srcSize && outBytes.length < 600_000, `${file} size (${outBytes.length}) must be <= source (${srcSize}) and < 600KB`);

    const acTLIndex = outBytes.indexOf(Buffer.from('acTL'));
    assert.ok(acTLIndex !== -1, `${file} must contain acTL chunk`);
    const numFrames = outBytes.readUInt32BE(acTLIndex + 4);
    const numPlays = outBytes.readUInt32BE(acTLIndex + 8);
    assert.strictEqual(numFrames, frames, `${file} must preserve ${frames} frames`);
    assert.strictEqual(numPlays, 1, `${file} must have num_plays = 1 (no loop)`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/introMedia.test.js`
Expected: FAIL (`phase4-audio.m4a must be removed` / `phase1-anim.png must exist`)

- [ ] **Step 3: Update `scripts/compress-intro-media.py` and run it**

Update `scripts/compress-intro-media.py` to:
1. Remove `public/intro/phase4-audio.m4a` if present.
2. Loop over `phase1.png`..`phase4.png` in `Ressources/` and output `phase1-anim.png`..`phase4-anim.png` in `public/intro/`.
3. Rewrite the `acTL` chunk payload as `struct.pack(">II", num_frames, 1)` (`num_plays = 1`).
4. For each frame, pick the smaller of the quantized-recompressed payload or the original compressed frame stream so already-small files (`phase1.png`) never grow.
5. Run `python3 scripts/compress-intro-media.py`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/introMedia.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/compress-intro-media.py public/intro/ tests/introMedia.test.js
git commit -m "feat(media): compress all 4 phase animations with num_plays=1 and remove audio"
```

---

### Task 2: Update `PhaseIntroOverlay` for All 4 Phases, No Audio, Single Play & Phase-Change Trigger

**Files:**
- Modify: `src/components/PhaseIntroOverlay/PhaseIntroOverlay.tsx`
- Modify: `src/components/PhaseIntroOverlay/index.ts`
- Modify: `tests/phaseIntroOverlay.test.js`

**Interfaces:**
- Consumes: `CyclePhase` from `src/types/cycle.ts`, `public/intro/phase{1..4}-anim.png`
- Produces:
  - `PHASE_INTRO_CONFIG: Record<'Phase1-Follicular' | 'Phase2-Ovulation' | 'Phase3-Luteal' | 'Phase4-Menstrual', { animFile: string; durationMs: number; theme: string }>`
  - `normalizeIntroPhase(phase: CyclePhase): 'Phase1-Follicular' | 'Phase2-Ovulation' | 'Phase3-Luteal' | 'Phase4-Menstrual'`
  - `shouldTriggerPhaseIntro(lastPlayedPhase: CyclePhase | null, nextPhase: CyclePhase): boolean`
  - `<PhaseIntroOverlay phase={CyclePhase} durationMs?: number onComplete?: () => void />`

- [ ] **Step 1: Update `tests/phaseIntroOverlay.test.js` with failing assertions**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/phaseIntroOverlay.test.js`
Expected: FAIL (`PhaseIntroOverlay must configure phase1-anim.png`)

- [ ] **Step 3: Implement all-phases logic in `PhaseIntroOverlay.tsx` and `index.ts`**

Update `src/components/PhaseIntroOverlay/PhaseIntroOverlay.tsx` to:
- Define `PHASE_INTRO_CONFIG` for all 4 phases with their exact single-play durations (`1568`, `1786`, `1552`, `1995` ms), `animFile` (`phase1-anim.png`..`phase4-anim.png`), and `theme` (`'phase 1'`..`'phase 4'`).
- Implement `normalizeIntroPhase(phase: CyclePhase)` and `shouldTriggerPhaseIntro(lastPlayedPhase: CyclePhase | null, nextPhase: CyclePhase): boolean` (`lastPlayedPhase === null || normalizeIntroPhase(lastPlayedPhase) !== normalizeIntroPhase(nextPhase)`).
- Track `lastPlayedPhaseRef = useRef<CyclePhase | null>(null)` and `[activePhase, setActivePhase] = useState(() => normalizeIntroPhase(phase))`, `[runId, setRunId] = useState(0)`, `[isVisible, setIsVisible] = useState(true)`, `[isFadingOut, setIsFadingOut] = useState(false)`.
- In `useEffect([phase, durationMs, onComplete])`:
  - Check `if (!shouldTriggerPhaseIntro(lastPlayedPhaseRef.current, phase)) return;`.
  - Set `const normalized = normalizeIntroPhase(phase);`, update `setActivePhase(normalized)`, `setIsVisible(true)`, `setIsFadingOut(false)`, `setRunId((n) => n + 1)`.
  - Schedule `fadeTimer` at `effectiveDuration` (`durationMs ?? PHASE_INTRO_CONFIG[normalized].durationMs`) to set `isFadingOut(true)` and `lastPlayedPhaseRef.current = normalized` (inside `fadeTimer` so React StrictMode's immediate dev re-mount does not skip the startup animation!).
  - Schedule `unmountTimer` at `effectiveDuration + PHASE_FADE_MS` to set `isVisible(false)` and call `onComplete?.()`.
- Render `<div className={...} data-theme={config.theme} ...><img key={runId} src={`${normalizedBase}intro/${config.animFile}?run=${runId}`} ... /></div>`.

- [ ] **Step 4: Run all tests and production build to verify everything passes**

Run: `node --test tests/tokens.test.js tests/introMedia.test.js tests/phaseIntroOverlay.test.js && npm run build`
Expected: PASS (`0 fail`, `vite build` succeeds)

- [ ] **Step 5: Commit**

```bash
git add src/components/PhaseIntroOverlay/ tests/phaseIntroOverlay.test.js docs/superpowers/specs/2026-11-05-all-phases-startup-intro-design.md docs/superpowers/plans/2026-11-05-all-phases-startup-intro.md
git commit -m "feat(intro): play phase 1-4 animations once on startup and phase change without audio"
```

