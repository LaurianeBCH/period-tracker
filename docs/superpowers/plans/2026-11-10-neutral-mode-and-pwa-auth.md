# Neutral First-Connection Mode, Unified "Valider" Auth & PWA Redirect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `OnboardingWizard` so the app opens directly in Neutral mode (`[data-theme="neutre"]`) when `periodDates` is empty (matching Figma `4347:9297` & `4347:9168`), rename the email submit button to `Valider`, and configure PWA link capturing + `emailRedirectTo` within `/period-tracker/`.

**Architecture:** `getDayStatus` in `src/utils/cycleEngine.ts` returns `phase: 'Neutral'` when no period blocks exist instead of fabricating an unconfirmed period on today. `App.tsx` renders the main layout directly without `OnboardingWizard`, sets `data-theme="neutre"` and suppresses `PhaseIntroOverlay` while `periodDates.length === 0`. `HomeMonthlyCalendar` and `PhaseInsightsCard` render the Figma neutral prompts and hide the curve day marker when `periodDates` is empty, while `MyCycleView`, `syncService.ts`, and `vite.config.ts` unify the email flow under `Valider` and scope the Magic Link redirect to `/period-tracker/`.

**Tech Stack:** React 19, TypeScript, CSS Modules (V3 Design Tokens), Vite PWA (`vite-plugin-pwa`), `@supabase/supabase-js`, Node.js built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-11-10-neutral-mode-and-pwa-auth-design.md`

## Global Constraints

- **CSS Design Tokens Mandatory (`AGENTS.md`):** Every new CSS rule in `src/components/Calendar/Calendar.module.css` MUST exclusively use V3 design tokens (`var(--font-family)`, `var(--typo-body-default-size)`, `var(--typo-body-default-weight)`, `var(--typo-body-default-line-height)`, `var(--text-dark-primary)`, `var(--text-dark-secondary)`, `var(--spacing-*)`). No hardcoded hex/rgb colors.
- **Exact French Copy (from Figma `4347:9297`, `4347:9168` & user request):**
  - Calendar empty prompt line 1: `Quand avez-vous eu vos dernières règles ?`
  - Calendar empty prompt line 2: `Pointer les dates dans le calendrier.`
  - Phase card empty subtitle: `Aucune information pour le moment. Renseignez vos dernières règles`
  - Email form submit button in `MyCycleView.tsx`: `Valider`

## Review Focus

- When `periodDates` is `[]`, `getDayStatus` must return `phase: 'Neutral'` with `isPredictedPeriod: false` and `isActualPeriod: false` for all dates (including today), while still setting `isToday: true` on `dateStr === todayISO`.
- Clicking a date in the calendar while in Neutral mode (`periodDates = []`) must auto-fill the period block (`togglePeriodDate`), immediately switch `data-theme` from `neutre` to `phase 4` (or the computed current phase), and trigger `PhaseIntroOverlay`.
- `PhaseIntroOverlay` must not mount or play when the app starts with `periodDates = []` (Neutral mode).
- `getAuthRedirectUrl` in `src/services/syncService.ts` must always include `/period-tracker/` (the Vite `BASE_URL`) so Magic Links match the PWA manifest `scope`.

---

### Task 1: Neutral Cycle Engine Status, PWA Manifest Scope & Redirect URL, and "Valider" Button

**Files:**
- Modify: `src/utils/cycleEngine.ts:160-240`
- Modify: `src/services/syncService.ts:50-75`
- Modify: `src/components/MyCycle/MyCycleView.tsx:380-395`
- Modify: `vite.config.ts:15-38`
- Modify: `tests/supabaseSync.test.js`

**Interfaces:**
- Produces in `src/utils/cycleEngine.ts`:
  - `getDayStatus(dateStr, settings, [])` returns `{ dateStr, isToday, phase: 'Neutral', isActualPeriod: false, isPredictedPeriod: false, isOvulationDay: false, isFertileWindow: false }`.
- Produces in `src/services/syncService.ts`:
  - `export function getAuthRedirectUrl(origin: string, baseUrl?: string): string`

- [ ] **Step 1: Update `tests/supabaseSync.test.js` with failing tests for `getDayStatus` neutral mode, `getAuthRedirectUrl`, PWA manifest scope, and `Valider` button**

Add assertions in `tests/supabaseSync.test.js` verifying:
1. `getDayStatus('2026-08-05', DEFAULT_SETTINGS, [], '2026-08-05')` returns `phase: 'Neutral'`, `isToday: true`, `isPredictedPeriod: false`.
2. `getAuthRedirectUrl('https://example.com', '/period-tracker/')` returns `'https://example.com/period-tracker/'`.
3. `vite.config.ts` includes `start_url: '/period-tracker/'`, `scope: '/period-tracker/'`, `handle_links: 'preferred'`, and `launch_handler`.
4. `MyCycleView.tsx` renders `Valider` instead of `Créer un compte`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/supabaseSync.test.js`
Expected: FAIL (`getDayStatus` returns `'Phase4-Menstrual-Unconfirmed'` instead of `'Neutral'`, `getAuthRedirectUrl` not exported).

- [ ] **Step 3: Implement changes in `src/utils/cycleEngine.ts`, `src/services/syncService.ts`, `src/components/MyCycle/MyCycleView.tsx`, and `vite.config.ts`**

1. In `src/utils/cycleEngine.ts`, when `blocks.length === 0`, return `{ dateStr, isToday, phase: 'Neutral', isActualPeriod: false, isPredictedPeriod: false, isOvulationDay: false, isFertileWindow: false }` immediately.
2. In `src/services/syncService.ts`, export `getAuthRedirectUrl(origin: string, baseUrl: string = '/period-tracker/'): string` returning `new URL(baseUrl, origin).href` and use it in `sendMagicLink`.
3. In `src/components/MyCycle/MyCycleView.tsx`, change the submit button text from `Créer un compte` to `Valider`.
4. In `vite.config.ts`, add `start_url: '/period-tracker/'`, `scope: '/period-tracker/'`, `handle_links: 'preferred'`, and `launch_handler: { client_mode: ['navigate-existing', 'auto'] }` to the `VitePWA` manifest object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/supabaseSync.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/cycleEngine.ts src/services/syncService.ts src/components/MyCycle/MyCycleView.tsx vite.config.ts tests/supabaseSync.test.js
git commit -m "feat(sync): return Neutral phase when empty, rename button to Valider, and configure PWA link scope"
```

---

### Task 2: Remove `OnboardingWizard` & Implement Neutral Mode UI (`App`, `HomeMonthlyCalendar`, `PhaseInsightsCard`)

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Calendar/HomeMonthlyCalendar.tsx`
- Modify: `src/components/Calendar/PhaseInsightsCard.tsx`
- Modify: `src/components/Calendar/Calendar.module.css`
- Modify: `tests/supabaseSync.test.js`

**Interfaces:**
- Consumes: `phase: 'Neutral'` from `getDayStatus` when `periodDates` is `[]`.
- Updates `src/App.tsx`:
  - Removes `OnboardingWizard` import and conditional return.
  - Sets `data-theme="neutre"` on `document.documentElement` when `periodDates.length === 0`.
  - Renders `<PhaseIntroOverlay phase={todayInsight.phaseKey} />` only when `periodDates.length > 0`.

- [ ] **Step 1: Add failing UI & CSS token tests in `tests/supabaseSync.test.js`**

Add a test in `tests/supabaseSync.test.js` verifying:
1. `src/App.tsx` does not render `OnboardingWizard`, sets `'neutre'` theme when `periodDates.length === 0`, and only renders `PhaseIntroOverlay` when `periodDates.length > 0`.
2. `src/components/Calendar/HomeMonthlyCalendar.tsx` renders `Quand avez-vous eu vos dernières règles ?` and `Pointer les dates dans le calendrier.` when `effectiveDates.length === 0`.
3. `src/components/Calendar/PhaseInsightsCard.tsx` renders `Aucune information pour le moment. Renseignez vos dernières règles` and hides `dayMarkerGroup` when in neutral/empty state.
4. New CSS classes in `src/components/Calendar/Calendar.module.css` (`.emptyCalendarPrompt`, `.emptyPromptQuestion`, `.emptyPromptHint`, `.insightsEmptySubtitle`) use only V3 design tokens (`AGENTS.md`).

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/supabaseSync.test.js`
Expected: FAIL on the new Neutral Mode UI assertions.

- [ ] **Step 3: Update `src/App.tsx`, `src/components/Calendar/HomeMonthlyCalendar.tsx`, `src/components/Calendar/PhaseInsightsCard.tsx`, and `src/components/Calendar/Calendar.module.css`**

1. In `src/App.tsx`:
   - Remove `OnboardingWizard` import, `handleOnboardingComplete`, and `if (!settings.isOnboarded)` block.
   - In the theme `useEffect`, if `periodDates.length === 0`, set `document.documentElement.setAttribute('data-theme', 'neutre')` and `document.body.style.backgroundColor = 'var(--background-level-1)'`.
   - Render `{periodDates.length > 0 && <PhaseIntroOverlay phase={todayInsight.phaseKey} />}`.
2. In `src/components/Calendar/HomeMonthlyCalendar.tsx`:
   - Above `.monthHeader` inside `.calendarCard`, when `effectiveDates.length === 0`, render:
     ```tsx
     {effectiveDates.length === 0 && (
       <p className={styles.emptyCalendarPrompt}>
         <span className={styles.emptyPromptQuestion}>
           Quand avez-vous eu vos dernières règles ?
         </span>
         <br />
         <span className={styles.emptyPromptHint}>
           Pointer les dates dans le calendrier.
         </span>
       </p>
     )}
     ```
3. In `src/components/Calendar/PhaseInsightsCard.tsx`:
   - Compute `const isNeutral = activeStatus?.phase === 'Neutral';`.
   - In `.insightsHeader`, when `isNeutral` is true, render `<p className={styles.insightsEmptySubtitle}>Aucune information pour le moment. Renseignez vos dernières règles</p>` instead of `<p className={styles.insightsPhaseSubtitle}>{insight.title}</p>`.
   - In the SVG, wrap `<g className={styles.dayMarkerGroup} ...>` with `{!isNeutral && (...)}`.
4. In `src/components/Calendar/Calendar.module.css`:
   - Add `.emptyCalendarPrompt`, `.emptyPromptQuestion`, `.emptyPromptHint`, and `.insightsEmptySubtitle` using V3 design tokens (`var(--font-family)`, `var(--typo-body-default-size)`, `var(--typo-body-default-weight)`, `var(--typo-body-default-line-height)`, `var(--text-dark-primary)`, `var(--text-dark-secondary)`).

- [ ] **Step 4: Run all tests and production build to verify**

Run: `node --test tests/tokens.test.js tests/introMedia.test.js tests/phaseIntroOverlay.test.js tests/recipes.test.js tests/supabaseSync.test.js && npm run build`
Expected: PASS (0 failures) and clean `vite build`.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/Calendar/HomeMonthlyCalendar.tsx src/components/Calendar/PhaseInsightsCard.tsx src/components/Calendar/Calendar.module.css tests/supabaseSync.test.js
git commit -m "feat(calendar): replace onboarding with Neutral mode and empty-state prompts"
```
