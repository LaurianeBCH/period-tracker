# Seasonal & Phase Recipes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 160 seasonal recipes (10 per cycle phase × 4 seasons from `/Users/lauriane/Downloads/recettes.md`) with automatic season detection and display the 10 matching recipes inside `RecommendationsView` using the existing `<Button variant="secondary">` atom.

**Architecture:**
- `src/data/recipesData.ts` stores the 160 cleaned recipes (`RECIPES_BY_SEASON_AND_PHASE`) without numbering (`1. `..`40. `), without `Dessert : `, and without `(V)`, plus `getSeasonForDate(date)` (astronomical/calendar northern hemisphere seasons) and `getRecipesForPhase(phaseId, date)`.
- `src/components/Recommendations/RecommendationsView.tsx` renders the `Idées de recettes` subsection inside the `Nutrition` section using the existing `<Button variant="secondary" fullWidth>` atom (`src/components/atoms/Button.tsx`), opening each recipe's Google search URL in a new tab (`window.open(recipe.url, '_blank', 'noopener,noreferrer')`).
- `src/components/Recommendations/RecommendationsView.module.css` and `src/components/atoms/Button.module.css` use strictly CSS design tokens (`src/index.css` / `AGENTS.md`) for the 1-column mobile / 2-column desktop (`>= 992px`) grid and multi-line secondary button alignment.

**Tech Stack:** React 19, TypeScript, Vite, CSS Modules (Design Tokens), Node.js native test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-11-05-seasonal-phase-recipes-design.md`

## Global Constraints

- **CSS Design Tokens mandatory (`AGENTS.md`)**: All new CSS rules in `RecommendationsView.module.css` and `Button.module.css` must use design tokens from `src/index.css` (`var(--spacing-*)`, `var(--typo-*)`, `var(--text-dark-primary)`). No hardcoded `#hex` or `rgb()` colors.
- **Reuse existing `<Button variant="secondary">` atom**: Do not create a custom button component or raw `<a className={...}>` replacement; import `Button` from `../atoms` and render `<Button variant="secondary" fullWidth ...>`.
- **Clean recipe titles**: Strip leading numbering (`1. `..`40. `), leading `Dessert : `, and trailing ` (V)` from every title in `/Users/lauriane/Downloads/recettes.md`.
- **Automatic season detection**: `spring` (Mar 20 – Jun 20), `summer` (Jun 21 – Sep 21), `autumn` (Sep 22 – Dec 20), `winter` (Dec 21 – Mar 19).

## Review Focus

1. **Completeness & Cleanliness of 160 Recipes**: All 4 seasons × 4 phases must have exactly 10 recipes (`160` total), every `url` must start with `https://www.google.com/search?q=recette+`, and zero `title` strings may contain `(V)`, `Dessert :`, or leading digits (`^\d+\.`).
2. **Season Boundary Accuracy**: `getSeasonForDate` must transition accurately on March 20 (`spring`), June 21 (`summer`), September 22 (`autumn`), and December 21 (`winter`), including January/February (`winter`).
3. **Reuse of Existing `<Button variant="secondary">` Atom**: `RecommendationsView.tsx` must import `Button` from `../atoms` and render `<Button` with `variant="secondary"`.
4. **New Tab Opening with Security Attributes**: Clicking a recipe button must call `window.open(recipe.url, '_blank', 'noopener,noreferrer')`.
5. **Responsive Grid & Design Token Compliance**: `RecommendationsView.module.css` must define `.recipesGrid` (1 column mobile, 2 columns at `@media (min-width: 992px)` with `gap: var(--spacing-sm)`) using only design tokens.

---

### Task 1: Create `src/data/recipesData.ts` with 160 Cleaned Recipes & Auto Season Detection

**Files:**
- Create: `src/data/recipesData.ts`
- Test: `tests/recipes.test.js`

**Interfaces:**
- Produces:
  - `export type Season = 'spring' | 'summer' | 'autumn' | 'winter';`
  - `export type PhaseNumber = 1 | 2 | 3 | 4;`
  - `export interface RecipeItem { title: string; url: string; }`
  - `export const RECIPES_BY_SEASON_AND_PHASE: Record<Season, Record<PhaseNumber, RecipeItem[]>>`
  - `export function getSeasonForDate(date?: Date): Season`
  - `export function getRecipesForPhase(phaseId: number, date?: Date): RecipeItem[]`

- [ ] **Step 1: Write the failing test in `tests/recipes.test.js`**

```js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('recipesData.ts contains 160 cleaned recipes (4 seasons x 4 phases x 10) and accurate season detection', () => {
  const dataPath = path.resolve('src/data/recipesData.ts');
  assert.strictEqual(fs.existsSync(dataPath), true, 'src/data/recipesData.ts must exist');

  const content = fs.readFileSync(dataPath, 'utf-8');
  assert.match(content, /export function getSeasonForDate/, 'Must export getSeasonForDate');
  assert.match(content, /export function getRecipesForPhase/, 'Must export getRecipesForPhase');

  // Verify no (V), Dessert :, or numbered prefixes exist in any title literal
  const titleMatches = [...content.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  assert.strictEqual(titleMatches.length, 160, `Expected exactly 160 recipe titles, got ${titleMatches.length}`);

  for (const title of titleMatches) {
    assert.doesNotMatch(title, /\(V\)/i, `Title must not contain (V): ${title}`);
    assert.doesNotMatch(title, /^Dessert\s*:/i, `Title must not contain "Dessert :": ${title}`);
    assert.doesNotMatch(title, /^\d+\./, `Title must not start with numbering: ${title}`);
  }

  const urlMatches = [...content.matchAll(/url:\s*['"](https:\/\/www\.google\.com\/search\?q=recette\+[^'"]+)['"]/g)];
  assert.strictEqual(urlMatches.length, 160, `Expected 160 Google search recipe URLs, got ${urlMatches.length}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/recipes.test.js`
Expected: FAIL (`src/data/recipesData.ts must exist`)

- [ ] **Step 3: Implement `src/data/recipesData.ts` from `/Users/lauriane/Downloads/recettes.md`**

Parse `/Users/lauriane/Downloads/recettes.md` and generate `src/data/recipesData.ts` with:
- `RECIPES_BY_SEASON_AND_PHASE` containing all 160 recipes with stripped `^\d+\.\s*`, stripped `^Dessert\s*:\s*`, and stripped `\s*\(V\)\s*$`.
- `getSeasonForDate(date: Date = new Date()): Season` using `(month + 1) * 100 + day`:
  - `>= 320 && <= 620` → `'spring'`
  - `>= 621 && <= 921` → `'summer'`
  - `>= 922 && <= 1220` → `'autumn'`
  - otherwise → `'winter'`
- `getRecipesForPhase(phaseId: number, date: Date = new Date()): RecipeItem[]` returning `RECIPES_BY_SEASON_AND_PHASE[getSeasonForDate(date)][normalizedPhaseId]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/recipes.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/recipesData.ts tests/recipes.test.js
git commit -m "feat(recipes): add 160 seasonal phase recipes data and auto season detector"
```

---

### Task 2: Integrate "Idées de recettes" in `RecommendationsView` Using `<Button variant="secondary">`

**Files:**
- Modify: `src/components/atoms/Button.module.css`
- Modify: `src/components/Recommendations/RecommendationsView.tsx`
- Modify: `src/components/Recommendations/RecommendationsView.module.css`
- Modify: `tests/recipes.test.js`

**Interfaces:**
- Consumes:
  - `Button` from `src/components/atoms/Button.tsx`
  - `getRecipesForPhase` from `src/data/recipesData.ts`
- Produces:
  - "Idées de recettes" section in `RecommendationsView.tsx` rendering 10 `<Button variant="secondary" fullWidth>` items in a 1-col (mobile) / 2-col (desktop `>= 992px`) grid, opening `recipe.url` in a new tab on click.

- [ ] **Step 1: Add UI and CSS token assertions to `tests/recipes.test.js`**

```js
test('RecommendationsView renders Idées de recettes using the Button atom (secondary variant) and design tokens', () => {
  const viewCode = fs.readFileSync(path.resolve('src/components/Recommendations/RecommendationsView.tsx'), 'utf-8');
  const cssCode = fs.readFileSync(path.resolve('src/components/Recommendations/RecommendationsView.module.css'), 'utf-8');

  assert.match(viewCode, /import\s+\{[^}]*Button[^}]*\}\s+from\s+['"]\.\.\/atoms['"]/, 'Must import Button atom from ../atoms');
  assert.match(viewCode, /getRecipesForPhase/, 'Must call getRecipesForPhase');
  assert.match(viewCode, /Idées de recettes/, 'Must render heading "Idées de recettes"');
  assert.match(viewCode, /<Button[\s\S]*?variant="secondary"/, 'Must use <Button variant="secondary">');
  assert.match(viewCode, /window\.open\([^,]+,\s*['"]_blank['"],\s*['"]noopener,noreferrer['"]\)/, 'Must open recipe URL in a new tab');

  assert.match(cssCode, /\.recipesGrid/, 'CSS must define .recipesGrid');
  assert.match(cssCode, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/, 'Desktop recipesGrid must have 2 columns');
  const recipesCssBlock = cssCode.slice(cssCode.indexOf('.recipesTitle'));
  assert.doesNotMatch(recipesCssBlock, /#[0-9a-fA-F]{3,8}|rgba?\(/, 'New recipe CSS rules must only use design tokens (AGENTS.md)');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/recipes.test.js`
Expected: FAIL (`Must import Button atom from ../atoms`)

- [ ] **Step 3: Update `Button.module.css`, `RecommendationsView.module.css`, and `RecommendationsView.tsx`**

1. In `src/components/atoms/Button.module.css`:
   - In `.secondary`, change `height: 56px;` to `height: auto; min-height: 56px;` so 2-line recipe titles expand cleanly without overflowing.
2. In `src/components/Recommendations/RecommendationsView.module.css`:
   - Add `.recipesTitle`, `.recipesGrid`, `.recipeButton`, `.recipeButtonLabel`, and `.recipeChevron` using design tokens (`var(--font-family)`, `var(--typo-h3-size)`, `var(--typo-h3-weight)`, `var(--text-dark-primary)`, `var(--spacing-sm)`).
3. In `src/components/Recommendations/RecommendationsView.tsx`:
   - Import `{ Button } from '../atoms'` and `{ getRecipesForPhase } from '../../data/recipesData'`.
   - Compute `const recipes = getRecipesForPhase(selectedPhase.id);`.
   - Inside `<section className={styles.contentSection} aria-labelledby="nutrition-title">`, right below `<div className={styles.nutritionGrid}>...</div>`, render:
     ```tsx
     <h3 className={styles.recipesTitle}>Idées de recettes</h3>
     <div className={styles.recipesGrid}>
       {recipes.map((recipe, idx) => (
         <Button
           key={idx}
           type="button"
           variant="secondary"
           fullWidth
           className={styles.recipeButton}
           onClick={() => window.open(recipe.url, '_blank', 'noopener,noreferrer')}
         >
           <span className={styles.recipeButtonLabel}>{recipe.title}</span>
           <svg
             width="20"
             height="20"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeWidth="2.5"
             strokeLinecap="round"
             strokeLinejoin="round"
             className={styles.recipeChevron}
             aria-hidden="true"
           >
             <polyline points="9 18 15 12 9 6" />
           </svg>
         </Button>
       ))}
     </div>
     ```

- [ ] **Step 4: Run tests and production build to verify everything passes**

Run: `node --test tests/tokens.test.js tests/introMedia.test.js tests/phaseIntroOverlay.test.js tests/recipes.test.js && npm run build`
Expected: PASS (`0 fail`, `vite build` succeeds)

- [ ] **Step 5: Commit**

```bash
git add src/components/atoms/Button.module.css src/components/Recommendations/RecommendationsView.tsx src/components/Recommendations/RecommendationsView.module.css tests/recipes.test.js docs/superpowers/specs/2026-11-05-seasonal-phase-recipes-design.md docs/superpowers/plans/2026-11-05-seasonal-phase-recipes.md
git commit -m "feat(recommendations): display 10 seasonal recipes per phase using secondary Button atom"
```

