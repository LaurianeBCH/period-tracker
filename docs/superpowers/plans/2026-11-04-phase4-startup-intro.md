# Phase 4 Startup Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compress the Phase 4 animated PNG and audio resources, and display a fullscreen startup intro with immediate animation and music playback (fading out after 3 seconds) when the user opens the app in Phase 4.

**Architecture:**
- A repeatable Python/macOS compression script (`scripts/compress-intro-media.py`) optimizes `Ressources/anim-phase4.png` (1.5 MB → ~530 KB APNG) into `public/intro/phase4-anim.png` and converts/compresses `Ressources/Ouverture — fin en douceur - usesuno.com.m4a` (63 KB Opus → ~22 KB HE-AAC) into `public/intro/phase4-audio.m4a`.
- A pure helper `shouldPlayPhaseIntro(isOnboarded, isEditingSettings, phase)` and a dedicated `PhaseIntroOverlay` component (`src/components/PhaseIntroOverlay/`) render the fullscreen overlay styled strictly with CSS design tokens (`src/index.css`), start audio playback immediately with a transparent pointer/keyboard unlock fallback, fade out at 3000 ms, and unmount at 3500 ms.
- `src/App.tsx` mounts `<PhaseIntroOverlay phase={todayInsight.phaseKey} />` when the user is onboarded and not editing settings.

**Tech Stack:** React 19, TypeScript, Vite, CSS Modules (Design Tokens), Node.js native test runner (`node --test`), Python 3 (`zlib`/`struct`) + macOS `avconvert`/`afconvert`.

**Spec:** `docs/superpowers/specs/2026-11-04-phase4-startup-intro-design.md`

## Global Constraints

- **CSS Design Tokens mandatory (`AGENTS.md`)**: Every CSS rule in `PhaseIntroOverlay.module.css` must use design tokens from `src/index.css` (`var(--background-level-1)`, `var(--spacing-*)`, `var(--radius-*)`, `var(--text-white)`). No hardcoded hex/rgb colors, spacing, or radius values.
- **No sound button or entry gate**: Audio and animation start immediately on mount with zero sound toggle UI.
- **Phase 4 scope**: Only trigger for `'Phase4-Menstrual'` and `'Phase4-Menstrual-Unconfirmed'` when `isOnboarded === true` and `isEditingSettings === false`.
- **Vite Base Path**: Prefix public asset paths with `import.meta.env.BASE_URL` so assets resolve under `/period-tracker/`.

## Review Focus

1. **APNG animation preservation after compression**: Compressing `Ressources/anim-phase4.png` must keep the `acTL` chunk and all 16 `fcTL` frame chunks intact while reducing file size below 600 KB.
2. **Audio browser compatibility & size reduction**: The output `public/intro/phase4-audio.m4a` must be valid AAC (`m4af`) and smaller than the 63 KB source (< 40 KB).
3. **Strict CSS Design Token compliance**: `PhaseIntroOverlay.module.css` must not contain any hardcoded `#hex` or `rgb()` color literals and must reference `var(--background-level-1)` and spacing/radius tokens.
4. **Browser autoplay rejection resilience**: If `audio.play()` rejects with `NotAllowedError`, the unhandled rejection must be caught and the 3-second fade-out timer must still complete and unmount the overlay.
5. **Non-Phase-4 and Onboarding isolation**: Users in Phase 1, Phase 2, Phase 3, or inside `OnboardingWizard` (`!isOnboarded || isEditingSettings`) must never see or hear the Phase 4 intro.

---

### Task 1: Compress Phase 4 Animated PNG and Audio into `public/intro/`

**Files:**
- Create: `scripts/compress-intro-media.py`
- Create: `public/intro/phase4-anim.png`
- Create: `public/intro/phase4-audio.m4a`
- Test: `tests/introMedia.test.js`

**Interfaces:**
- Consumes:
  - `Ressources/anim-phase4.png` (1.5 MB, 16-frame APNG)
  - `Ressources/Ouverture — fin en douceur - usesuno.com.m4a` (63 KB, 3.0s M4A)
- Produces:
  - `public/intro/phase4-anim.png` (valid 16-frame APNG, < 600 KB)
  - `public/intro/phase4-audio.m4a` (valid AAC `.m4a`, < 40 KB)

- [ ] **Step 1: Write the failing test in `tests/introMedia.test.js`**

```js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Compressed Phase 4 intro media assets exist, are smaller than sources, and preserve APNG frames', () => {
  const animPath = path.resolve('public/intro/phase4-anim.png');
  const audioPath = path.resolve('public/intro/phase4-audio.m4a');

  assert.strictEqual(fs.existsSync(animPath), true, 'public/intro/phase4-anim.png must exist');
  assert.strictEqual(fs.existsSync(audioPath), true, 'public/intro/phase4-audio.m4a must exist');

  const animStat = fs.statSync(animPath);
  const audioStat = fs.statSync(audioPath);

  assert.ok(animStat.size > 10_000 && animStat.size < 600_000, `Expected anim size < 600KB, got ${animStat.size}`);
  assert.ok(audioStat.size > 5_000 && audioStat.size < 45_000, `Expected audio size < 45KB, got ${audioStat.size}`);

  const animBytes = fs.readFileSync(animPath);
  assert.ok(animBytes.includes(Buffer.from('acTL')), 'Compressed PNG must remain an animated PNG (acTL chunk present)');
  let fcTLCount = 0;
  let idx = 0;
  while ((idx = animBytes.indexOf(Buffer.from('fcTL'), idx)) !== -1) {
    fcTLCount++;
    idx += 4;
  }
  assert.strictEqual(fcTLCount, 16, 'Compressed APNG must preserve all 16 frames');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/introMedia.test.js`
Expected: FAIL (`public/intro/phase4-anim.png must exist`)

- [ ] **Step 3: Implement `scripts/compress-intro-media.py` and generate compressed assets**

Create `scripts/compress-intro-media.py` that:
1. Reads `Ressources/anim-phase4.png`, unfilters each of the 16 `339x480` RGBA frames (`IDAT` + `fdAT`), quantizes noise (`v = 255 if v >= 248 else (v & 0xF0)`), applies PNG Sub filter (`type 1`), recompresses with `zlib.compress(data, 9)`, recalculates CRC32 (`zlib.crc32`) and sequence numbers for `fcTL`/`IDAT`/`fdAT`, and writes `public/intro/phase4-anim.png`.
2. Runs macOS `avconvert --preset PresetAppleM4A` to a temp file and `afconvert -f m4af -d aach -b 48000` to produce `public/intro/phase4-audio.m4a`.
3. Execute `python3 scripts/compress-intro-media.py`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/introMedia.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/compress-intro-media.py public/intro/phase4-anim.png public/intro/phase4-audio.m4a tests/introMedia.test.js
git commit -m "feat(media): compress Phase 4 animated PNG and audio into public/intro"
```

---

### Task 2: Build `PhaseIntroOverlay` Component with Design Tokens & Autoplay Handling

**Files:**
- Create: `src/components/PhaseIntroOverlay/PhaseIntroOverlay.tsx`
- Create: `src/components/PhaseIntroOverlay/PhaseIntroOverlay.module.css`
- Create: `src/components/PhaseIntroOverlay/index.ts`
- Test: `tests/phaseIntroOverlay.test.js`

**Interfaces:**
- Consumes: `CyclePhase` from `src/types/cycle.ts`, CSS tokens from `src/index.css`
- Produces:
  - `shouldPlayPhaseIntro(isOnboarded: boolean, isEditingSettings: boolean, phase: CyclePhase): boolean`
  - `PHASE4_INTRO_DURATION_MS = 3000`
  - `PHASE4_FADE_MS = 500`
  - `<PhaseIntroOverlay phase={CyclePhase} durationMs?: number onComplete?: () => void />`

- [ ] **Step 1: Write the failing test in `tests/phaseIntroOverlay.test.js`**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/phaseIntroOverlay.test.js`
Expected: FAIL (`PhaseIntroOverlay.tsx must exist`)

- [ ] **Step 3: Implement `PhaseIntroOverlay.module.css`, `PhaseIntroOverlay.tsx`, and `index.ts`**

- In `src/components/PhaseIntroOverlay/PhaseIntroOverlay.module.css`, define `.overlay`, `.fadeOut`, and `.animationImage` using only CSS variables (`var(--background-level-1)`, `var(--spacing-xl)`, `var(--radius-md)`).
- In `src/components/PhaseIntroOverlay/PhaseIntroOverlay.tsx`:
  - Export `shouldPlayPhaseIntro(isOnboarded: boolean, isEditingSettings: boolean, phase: CyclePhase): boolean` returning `Boolean(isOnboarded && !isEditingSettings && (phase === 'Phase4-Menstrual' || phase === 'Phase4-Menstrual-Unconfirmed'))`.
  - In `PhaseIntroOverlay`, initialize `isVisible` (`phase === 'Phase4-Menstrual' || phase === 'Phase4-Menstrual-Unconfirmed'`) and `isFadingOut` (`false`).
  - On mount, create `new Audio(`${import.meta.env.BASE_URL}intro/phase4-audio.m4a`)`, call `audio.play().catch(...)`, and register a one-time `pointerdown` / `keydown` listener on `window` to retry `audio.play().catch(() => {})` if autoplay was blocked.
  - Set a timer for `durationMs` (default `3000` ms) to set `isFadingOut = true`, and a timer for `durationMs + 500` ms to pause audio, set `isVisible = false`, and call `onComplete?.()`.
- Export `PhaseIntroOverlay` and `shouldPlayPhaseIntro` from `src/components/PhaseIntroOverlay/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/phaseIntroOverlay.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/PhaseIntroOverlay/ tests/phaseIntroOverlay.test.js
git commit -m "feat(intro): add PhaseIntroOverlay component with design tokens and audio playback"
```

---

### Task 3: Integrate `PhaseIntroOverlay` into `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`
- Test: `tests/phaseIntroOverlay.test.js`

**Interfaces:**
- Consumes: `PhaseIntroOverlay`, `shouldPlayPhaseIntro` from `src/components/PhaseIntroOverlay`
- Produces: Startup Phase 4 intro overlay mounted in `App.tsx` when onboarded and in Phase 4.

- [ ] **Step 1: Add integration assertion to `tests/phaseIntroOverlay.test.js`**

Append a test verifying that `src/App.tsx` imports `PhaseIntroOverlay` and renders `<PhaseIntroOverlay` with `todayInsight.phaseKey` (or `todayStatus.phase`).

```js
test('App.tsx mounts PhaseIntroOverlay for the active phase', () => {
  const appCode = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.match(appCode, /PhaseIntroOverlay/, 'App.tsx must import and render PhaseIntroOverlay');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/phaseIntroOverlay.test.js`
Expected: FAIL (`App.tsx must import and render PhaseIntroOverlay`)

- [ ] **Step 3: Update `src/App.tsx` to render `<PhaseIntroOverlay phase={todayInsight.phaseKey} />`**

- Import `{ PhaseIntroOverlay } from './components/PhaseIntroOverlay';` in `src/App.tsx`.
- Render `<PhaseIntroOverlay phase={todayInsight.phaseKey} />` at the top of `<div className={...}>` in `src/App.tsx` (after the `!settings.isOnboarded || isEditingSettings` guard so it only plays for onboarded users on startup).

- [ ] **Step 4: Run all tests and production build to verify everything passes**

Run: `node --test tests/tokens.test.js tests/atoms.test.js tests/introMedia.test.js tests/phaseIntroOverlay.test.js && npm run build`
Expected: PASS (`0 fail`, `vite build` succeeds)

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx tests/phaseIntroOverlay.test.js
git commit -m "feat(app): integrate PhaseIntroOverlay on startup for Phase 4"
```

