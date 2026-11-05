# Supabase Email Sync & MyCycle Account Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the header Settings gear button, add the centered "Mon cycle" heading and the 2-state Supabase email sync card (`sync-no` / `sync-yes`) inside `MyCycleView`, and synchronize `settings` and `periodDates` with Supabase via Magic Link authentication.

**Architecture:** We add `@supabase/supabase-js` with a graceful local-only fallback when environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are absent, plus a pure `syncService.ts` module that merges local (`localStorage`) and remote (`user_cycle_data`) cycle data on session start and pushes updates on every change. `MyCycleView` renders the new "Mon cycle" H1 title, wraps the right column (`chartCard` + `syncCard`) for the 2-column desktop layout, and reuses the existing `Button` atom (`primary` and `secondary` variants) with V3 design tokens.

**Tech Stack:** React 19, TypeScript, CSS Modules (V3 Design Tokens), `@supabase/supabase-js`, Node.js built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-11-05-supabase-sync-design.md`

## Global Constraints

- **CSS Design Tokens Mandatory (`AGENTS.md`):** Every CSS rule MUST use the design tokens defined in `src/index.css` (`--background-level-2`, `--border`, `--text-dark-primary`, `--spacing-2xl`, `--spacing-lg`, `--spacing-sm`, `--radius-full`, `--radius-sm`, `--typo-*`). Never hardcode hex/rgb colors or raw spacing pixel values where tokens exist.
- **Component Reuse:** Reuse `src/components/atoms/Button.tsx` (`variant="primary"`, `variant="secondary"`, `fullWidth`, `icon={false}`) for all action buttons in the sync card.
- **Graceful Offline/Unconfigured Fallback:** The app must build and run without crashing when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are not set.
- **Exact French Copy (from Figma `4332:7035`, `4332:7153`, `4332:7268`):**
  - Page heading: `Mon cycle`
  - Unsynced card title: `Synchroniser vos données`
  - Unsynced card description: `Vos données sont actuellement enregistrées dans le cache de votre navigateur. Vous pouvez saisir une adresse email pour synchroniser vos données en ligne.`
  - Input label: `Saisir une adresse email`
  - Input placeholder: `contact@gmail.com`
  - Submit button: `Créer un compte`
  - Synced card title: `Données synchronisées`
  - Synced action buttons: `Supprimer mon compte` and `Se déconnecter`

## Review Focus

- Empty or whitespace-only email submitted in the sync form must not trigger a network call and must display a validation message or be blocked by native HTML5 email validation.
- Merging local and remote `periodDates` when logging in on a second device must deduplicate and sort ISO dates (`YYYY-MM-DD`) chronologically without losing dates from either device.
- Logging in via Magic Link after clearing browser cache (when local `settings.isOnboarded` is `false` and `periodDates` is `[]`) must restore `isOnboarded: true` from cloud data so the user lands directly on the main app instead of `OnboardingWizard`.
- Clicking `Supprimer mon compte` must clear both remote Supabase data and local `localStorage` (`period_tracker_settings`, `period_tracker_dates`) and reset the app state.
- Missing `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` must not throw at import time; clicking `Créer un compte` when unconfigured must show a clear informational message in French.

---

### Task 1: Storage Clear Helper, Supabase Client, SQL Schema & Sync Service

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `supabase/schema.sql`
- Modify: `src/services/storage.ts`
- Create: `src/services/supabaseClient.ts`
- Create: `src/services/syncService.ts`
- Create: `tests/supabaseSync.test.js`

**Interfaces:**
- Produces in `src/services/storage.ts`:
  - `clearAllStorage(): void` — removes `period_tracker_settings`, `period_tracker_dates`, `cycle_pwa_settings`, and `cycle_pwa_logs` from `localStorage`.
- Produces in `src/services/supabaseClient.ts`:
  - `supabase: SupabaseClient | null`
  - `isSupabaseConfigured(): boolean`
- Produces in `src/services/syncService.ts`:
  - `export interface CloudCyclePayload { settings: UserSettings; period_dates: string[]; }`
  - `export function mergeCycleData(localSettings: UserSettings, localDates: string[], cloudPayload: CloudCyclePayload | null): { settings: UserSettings; periodDates: string[] }`
  - `export async function sendMagicLink(email: string): Promise<{ error: string | null }>`
  - `export async function pullAndMergeCloudData(userId: string, localSettings: UserSettings, localDates: string[]): Promise<{ settings: UserSettings; periodDates: string[] } | null>`
  - `export async function pushCloudData(userId: string, settings: UserSettings, periodDates: string[]): Promise<void>`
  - `export async function signOutAccount(): Promise<void>`
  - `export async function deleteUserAccount(userId: string): Promise<{ error: string | null }>`

- [ ] **Step 1: Install `@supabase/supabase-js` and write the failing test in `tests/supabaseSync.test.js`**

Run: `pnpm add @supabase/supabase-js`

Create `tests/supabaseSync.test.js` testing:
1. `supabase/schema.sql` defines `public.user_cycle_data`, enables Row Level Security (`ENABLE ROW LEVEL SECURITY`), and defines `public.delete_user_account()`.
2. `clearAllStorage` in `src/services/storage.ts` removes `SETTINGS_KEY` and `PERIOD_DATES_KEY`.
3. `mergeCycleData` in `src/services/syncService.ts` deduplicates and sorts `localDates` + `cloudPayload.period_dates`, preserves `isOnboarded: true` when cloud data exists, and falls back to local data when `cloudPayload` is `null`.
4. `sendMagicLink` rejects empty/invalid email before calling Supabase and handles unconfigured Supabase gracefully.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/supabaseSync.test.js`
Expected: FAIL (`supabase/schema.sql` and `src/services/syncService.ts` do not exist yet).

- [ ] **Step 3: Create `.env.example`, `supabase/schema.sql`, `src/services/supabaseClient.ts`, `src/services/syncService.ts`, and update `src/services/storage.ts`**

1. In `.env.example`, document `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=`.
2. In `supabase/schema.sql`, define `public.user_cycle_data` (`user_id uuid primary key references auth.users(id) on delete cascade`, `settings jsonb`, `period_dates jsonb`, `updated_at timestamptz`), RLS policies (`auth.uid() = user_id`), and `public.delete_user_account()` (`security definer` deleting `auth.users` where `id = auth.uid()`).
3. In `src/services/storage.ts`, export `clearAllStorage(): void`.
4. In `src/services/supabaseClient.ts`, read `import.meta.env?.VITE_SUPABASE_URL` and `import.meta.env?.VITE_SUPABASE_ANON_KEY` safely (supporting Node test runner where `import.meta.env` may be undefined) and instantiate `createClient` only when both are non-empty strings.
5. In `src/services/syncService.ts`, implement `mergeCycleData`, `sendMagicLink`, `pullAndMergeCloudData`, `pushCloudData`, `signOutAccount`, and `deleteUserAccount`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/supabaseSync.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example supabase/schema.sql src/services/storage.ts src/services/supabaseClient.ts src/services/syncService.ts tests/supabaseSync.test.js
git commit -m "feat(sync): add Supabase client, SQL schema, and cycle sync service"
```

---

### Task 2: Remove Header Settings Button & Add "Mon cycle" Sync UI (`MyCycleView` & `App`)

**Files:**
- Modify: `src/components/organisms/NavigationHeader.tsx`
- Modify: `src/components/MyCycle/MyCycleView.tsx`
- Modify: `src/components/MyCycle/MyCycleView.module.css`
- Modify: `src/App.tsx`
- Modify: `tests/supabaseSync.test.js`

**Interfaces:**
- Consumes: `supabase`, `sendMagicLink`, `pullAndMergeCloudData`, `pushCloudData`, `signOutAccount`, `deleteUserAccount`, `clearAllStorage`, `Button` from `../atoms`.
- Updates `MyCycleViewProps` in `src/components/MyCycle/MyCycleView.tsx`:
  ```ts
  interface MyCycleViewProps {
    settings: UserSettings;
    periodDates?: string[];
    userEmail?: string | null;
    onSendMagicLink?: (email: string) => Promise<{ error: string | null }>;
    onSignOut?: () => Promise<void>;
    onDeleteAccount?: () => Promise<{ error: string | null }>;
  }
  ```

- [ ] **Step 1: Extend `tests/supabaseSync.test.js` with UI & CSS token assertions**

Add assertions in `tests/supabaseSync.test.js` verifying:
1. `NavigationHeader.tsx` no longer renders the `Paramètres` button, and `App.tsx` no longer uses `isEditingSettings`.
2. `MyCycleView.tsx` renders `<h1 className={styles.pageTitle}>Mon cycle</h1>`.
3. `MyCycleView.tsx` renders both the unsynced state (`Synchroniser vos données`, `Saisir une adresse email`, `contact@gmail.com`, `Créer un compte` with `<Button`) and the synced state (`Données synchronisées`, `Supprimer mon compte`, `Se déconnecter` with `<Button variant="secondary"`).
4. `MyCycleView.module.css` uses only design tokens (`var(--background-level-2)`, `var(--border)`, `var(--radius-full)`, `var(--radius-sm)`, `var(--spacing-lg)`, `var(--spacing-sm)`, `var(--text-dark-primary)`) for the sync card and input field, with no hardcoded hex/rgb values.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/supabaseSync.test.js`
Expected: FAIL on the new UI and CSS assertions.

- [ ] **Step 3: Update `NavigationHeader.tsx`, `MyCycleView.tsx`, `MyCycleView.module.css`, and `App.tsx`**

1. **`src/components/organisms/NavigationHeader.tsx`**:
   - Remove the `onSettingsClick` button from JSX so only `<h1 className={styles.headerTitle}>{title}</h1>` is rendered inside `.headerInner`.
2. **`src/components/MyCycle/MyCycleView.tsx`**:
   - Add `<h1 className={styles.pageTitle}>Mon cycle</h1>` at the top of `<main className={styles.cycleContainer}>`.
   - Wrap the right side (`chartCard` + `syncCard`) inside `<div className={styles.rightColumn}>`.
   - When `userEmail` is falsy (`sync-no` state — Figma `4332:7035` & `4332:7268`):
     - Render `<section className={styles.syncCard} aria-labelledby="sync-card-title">` with title `Synchroniser vos données`, description text, form with `<label htmlFor="sync-email">Saisir une adresse email</label>`, `<input id="sync-email" type="email" required placeholder="contact@gmail.com" ... />`, and `<Button type="submit" variant="primary" fullWidth icon={false}>Créer un compte</Button>`, plus status feedback message when submitted.
   - When `userEmail` is truthy (`sync-yes` state — Figma `4332:7153`):
     - Render `<section className={styles.syncCard} aria-labelledby="sync-card-title">` with title `Données synchronisées`, `<p className={styles.syncEmailText}>{userEmail}</p>`, and two `<Button variant="secondary" fullWidth icon={false}>` buttons: `Supprimer mon compte` and `Se déconnecter`.
3. **`src/components/MyCycle/MyCycleView.module.css`**:
   - Style `.pageTitle` (`grid-column: 1 / -1`, `text-align: center`, `font-size: var(--typo-h1-size)`, `font-weight: var(--typo-h1-weight)`, `color: var(--text-dark-primary)`, `margin: 0`).
   - Style `.rightColumn` (`display: flex; flex-direction: column; gap: var(--spacing-lg); width: 100%`).
   - Style `.syncCard`, `.syncDescription`, `.syncForm`, `.syncFieldGroup`, `.syncLabel`, `.syncInput`, `.syncHeaderGroup`, `.syncEmailText`, `.syncActionsGroup`, `.syncFeedback` strictly using V3 design tokens.
4. **`src/App.tsx`**:
   - Remove `isEditingSettings` state and `onSettingsClick` prop on `NavigationHeader`.
   - Track `sessionUser` (`{ id: string; email: string } | null`) via `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange(...)`.
   - When a user session becomes active, call `pullAndMergeCloudData(user.id, getSettings(), getPeriodDates())` and update `settings` and `periodDates` in state and `localStorage`.
   - Whenever `settings` or `periodDates` change while `sessionUser` is present (and after initial cloud pull completes), call `pushCloudData(sessionUser.id, settings, periodDates)`.
   - Pass `userEmail={sessionUser?.email ?? null}`, `onSendMagicLink={sendMagicLink}`, `onSignOut={handleSignOut}`, and `onDeleteAccount={handleDeleteAccount}` to `<MyCycleView />`.

- [ ] **Step 4: Run test suite and production build to verify everything passes**

Run: `node --test tests/tokens.test.js tests/introMedia.test.js tests/phaseIntroOverlay.test.js tests/recipes.test.js tests/supabaseSync.test.js && npm run build`
Expected: PASS (0 failures) and clean `vite build`.

- [ ] **Step 5: Commit**

```bash
git add src/components/organisms/NavigationHeader.tsx src/components/MyCycle/MyCycleView.tsx src/components/MyCycle/MyCycleView.module.css src/App.tsx tests/supabaseSync.test.js
git commit -m "feat(cycle): add Supabase email sync card in MyCycleView and remove header settings icon"
```
