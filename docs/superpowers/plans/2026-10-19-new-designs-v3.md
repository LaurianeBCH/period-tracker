# Periode-Tracker-V3 Design System & UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the new Figma V3 designs and update the design tokens, component library (atoms, molecules, organisms), and views (mobile home, continuous year view, and responsive desktop view) according to the specifications in `docs/specs`.

**Architecture:** 
- Centralize design tokens and multi-mode theme CSS variables in `src/index.css` and `src/styles/theme.module.css`, matching `docs/specs/tokens/` and `docs/specs/foundations/`.
- Build reusable UI atoms and molecules (`Button`, `Badge`, `DayCell`, `NavigationHeader`, `TabBar`, `PhaseInsightsCard`) with CSS modules and TypeScript.
- Update `HomeMonthlyCalendar`, `YearCalendarView`, and `App.tsx` to support the mobile layouts (Figma nodes `4230:12232` & `4230:12337`) and the responsive desktop layout (Figma node `4230:13126`).

**Tech Stack:** React 19, TypeScript, Vite, CSS Modules, Vanilla CSS Custom Properties.

**Spec:** `docs/specs` (including `tokens/`, `foundations/`, `atoms/`, `molecules/`, and `organisms/`)

## Global Constraints

- Use Lato as the primary font family with defined typography scale (H1 22px Bold, H2 20px Bold, H3 18px Bold, Body Large 18px SemiBold, Body Default Bold 16px, Body Default 16px SemiBold, Body Small 14px SemiBold, Caption 14px Bold).
- Base colors: `--text-dark-primary: #002e2c`, `--background-level-1: #d2fccf`, `--background-level-2: #9ce2c0`, `--background-level-3: #4bbca4`, `--border: #5ec3a3`, `--accent: #fbff24`, `--text-dark-secondary: #137051`, `--text-white: #ffffff`.
- Multi-mode themes support: `Phase 1`, `Phase 2`, `Phase 3`, `Phase4`, `Neutre` via `[data-theme="..."]`.
- Spacing scale: xs=4px, sm=8px, md=12px, lg=16px, xl=24px, 2xl=32px, 3xl=64px.
- Radius scale: sm=8px, md=16px, full=20px, pill/circle=100px.
- Maintain existing local storage and cycle engine interfaces (`UserSettings`, `DayStatus`, `togglePeriodDate`).

## Review Focus

1. **Cycle phase color accuracy across modes**: Multi-mode token definitions must update all UI elements when theme/phase changes without broken contrast.
2. **DayCell variant rendering**: Estimated period days must display 1.5px dashed border (`var(--text-dark-primary)`), confirmed period days must have dark solid background, and today indicator must show yellow accent dot.
3. **Empty day cells layout**: Grid alignment must align precisely with Monday-Sunday headers without jumping or misalignments.
4. **Desktop responsive transition**: On screens >= 1024px, layout must transition cleanly to side-by-side view (calendar feed left, cycle curve card right) while maintaining centered tab-bar.
5. **No build regressions**: Project must compile cleanly with `npm run build` (`tsc -b && vite build`).

---

### Task 1: Update Design Tokens & Theme Foundations

**Files:**
- Modify: `src/index.css`
- Modify: `src/styles/theme.module.css`

**Interfaces:**
- Produces: CSS custom properties (`--text-dark-primary`, `--background-level-1`, `--background-level-2`, `--background-level-3`, `--border`, `--accent`, `--text-dark-secondary`, `--text-white`, `--spacing-*`, `--radius-*`, `--type-*`) and multi-mode theme rules (`[data-theme="phase 1"]`, etc.).

- [ ] **Step 1: Update `src/index.css` with V3 Master Design Tokens and Multi-Mode CSS**
  - Define root tokens and multi-mode rules corresponding to `docs/specs/tokens/token-reference.md` and `docs/specs/tokens/color-tokens.md`.
  - Maintain backward compatibility aliases for legacy token references.
  - Set background and text defaults.

- [ ] **Step 2: Update `src/styles/theme.module.css`**
  - Add typography utility classes matching `docs/specs/foundations/typography.md` (`headingH1`, `headingH2`, `bodyDefaultBold`, `bodySmall`, `caption`).
  - Update card and button styles with V3 tokens.

- [ ] **Step 3: Verify build**
  - Run `npm run build` to confirm CSS and TypeScript pass.

- [ ] **Step 4: Commit**
  ```bash
  git add src/index.css src/styles/theme.module.css
  git commit -m "feat(tokens): update design tokens and typography to V3 specs"
  ```

---

### Task 2: Build Atom Components (Button & Badge)

**Files:**
- Create: `src/components/atoms/Button.tsx`
- Create: `src/components/atoms/Button.module.css`
- Create: `src/components/atoms/Badge.tsx`
- Create: `src/components/atoms/Badge.module.css`
- Create: `src/components/atoms/index.ts`

**Interfaces:**
- Produces:
  - `<Button variant="primary" | "secondary" | "icon" onClick={...}>{children}</Button>`
  - `<Badge variant="badge" | "phase1" | "phase2" | "phase3" | "period">{label}</Badge>`

- [ ] **Step 1: Implement `Button` component in `src/components/atoms/Button.tsx`**
  - Implement variants per `docs/specs/atoms/button.md`:
    - `primary`: background `var(--text-dark-primary)`, text `var(--text-white)`, padding `16px`, radius `8px`, height `54px`.
    - `secondary`: background `var(--background-level-2)`, border `1px solid var(--border)`, text `var(--text-dark-primary)`, padding `16px`, radius `8px`, height `56px`.
    - `icon`: transparent background, size 44x44 or 24x24.

- [ ] **Step 2: Implement `Badge` component in `src/components/atoms/Badge.tsx`**
  - Implement variants per `docs/specs/atoms/badge.md`:
    - `badge`: background `var(--accent)`, text `var(--text-dark-primary)`, padding `4px 8px`, radius `8px`.
    - `phase1`: circle 18px, background `var(--background-level-1)`, text `1`.
    - `phase2`: circle 18px, background `var(--text-white)`, text `2`.
    - `phase3`: circle 18px, background `var(--background-level-2)`, text `3`.
    - `period`: 18px with water droplet SVG icon.

- [ ] **Step 3: Export from `src/components/atoms/index.ts` and verify build**
  - Run `npm run build`.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/atoms/
  git commit -m "feat(components): implement Button and Badge atoms"
  ```

---

### Task 3: Update DayCell Molecule & Month Grid

**Files:**
- Modify: `src/components/Calendar/DayCell.tsx`
- Modify: `src/components/Calendar/Calendar.module.css`

**Interfaces:**
- Consumes: `DayStatus` from `src/types/cycle.ts`, `Badge` from `src/components/atoms/Badge.tsx`
- Produces: `<DayCell dayNumber={...} status={...} onClick={...} />`

- [ ] **Step 1: Update `DayCell.tsx` according to `docs/specs/molecules/calendar-day-cell.md`**
  - Height 60px, rounded corners 8px (`var(--radius-sm)`).
  - Display day number (font Lato Bold 16px).
  - Bottom indicator:
    - Phase 4 confirmed: dark background `var(--text-dark-primary)`, text white, white droplet SVG.
    - Phase 4 estimated: background `var(--background-level-3)`, border 1.5px dashed `var(--text-dark-primary)`, droplet SVG.
    - Phase 1, 2, 3: circle phase badge (1, 2, 3).
  - Top-right today indicator: yellow dot `var(--accent)` (8px size, top 4px, right 4px).
  - Empty day cell: background `var(--background-level-3)`, rounded corners 8px, height 60px.

- [ ] **Step 2: Update `Calendar.module.css` with day cell and weekday strip styles**
  - Weekday strip: `Lun Mar Mer Jeu Ven Sam Dim`, border-bottom `1px solid var(--border)`.
  - Grid gap: 4px horizontal & vertical (`var(--spacing-xs)`).

- [ ] **Step 3: Verify build**
  - Run `npm run build`.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/Calendar/DayCell.tsx src/components/Calendar/Calendar.module.css
  git commit -m "feat(calendar): update DayCell molecule to V3 specs"
  ```

---

### Task 4: Implement NavigationHeader and TabBar Organisms

**Files:**
- Create: `src/components/organisms/NavigationHeader.tsx`
- Create: `src/components/organisms/NavigationHeader.module.css`
- Create: `src/components/organisms/TabBar.tsx`
- Create: `src/components/organisms/TabBar.module.css`
- Create: `src/components/organisms/index.ts`

**Interfaces:**
- Produces:
  - `<NavigationHeader title="Period Tracker" onSettingsClick={...} />`
  - `<TabBar activeTab="calendar" onTabChange={...} />`

- [ ] **Step 1: Implement `NavigationHeader` per `docs/specs/organisms/navigation.md`**
  - Background `var(--background-level-1)`, padding 16px.
  - Title: Lato Bold 22px, `var(--text-dark-primary)`.
  - Settings gear icon button (size 24px) on the right.

- [ ] **Step 2: Implement `TabBar` per `docs/specs/molecules/tabs.md` & `navigation.md`**
  - 3 tabs: `Calendrier`, `Recommandations`, `Mon cycle`.
  - Active tab pill background `var(--background-level-2)`, text `var(--text-dark-primary)`, rounded pill.
  - Inactive tabs text `var(--text-dark-secondary)`.

- [ ] **Step 3: Export from `src/components/organisms/index.ts` and verify build**
  - Run `npm run build`.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/organisms/
  git commit -m "feat(navigation): implement NavigationHeader and TabBar organisms"
  ```

---

### Task 5: Build Cycle Wave Curve & Phase Insights Card

**Files:**
- Modify: `src/components/Calendar/PhaseInsightsCard.tsx`
- Modify: `src/components/Calendar/Calendar.module.css`

**Interfaces:**
- Consumes: `PhaseInsight` from `src/types/cycle.ts`, `todayStatus` (current day of cycle & phase).
- Produces: `<PhaseInsightsCard insight={...} dayOfCycle={...} cycleLength={...} />`

- [ ] **Step 1: Create the SVG Cycle Wave Curve component inside `PhaseInsightsCard.tsx`**
  - Wave curve with 4 distinct segments (Phase 1 rise, Phase 2 ovulation peak, Phase 3 luteal wave, Phase 4 period baseline).
  - Glowing indicator dot (`var(--accent)` yellow with pulse/glow) positioned along the curve at the user's current cycle progress.
  - Phase labels (1, 2, 3, droplet icon) under vertical division markers.

- [ ] **Step 2: Add Legend and Action button**
  - Legend items:
    - 1 Prise d'élan (folliculaire)
    - 2 Debout sur la planche (ovulation)
    - 3 Dans le tube de la vague (lutéale)
    - Repos avant la prochaine vague (règle)
  - Secondary button: Sparkles icon + "En savoir plus sur les phases".

- [ ] **Step 3: Verify build**
  - Run `npm run build`.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/Calendar/PhaseInsightsCard.tsx src/components/Calendar/Calendar.module.css
  git commit -m "feat(insights): implement V3 wave curve and PhaseInsightsCard"
  ```

---

### Task 6: Update Home and Year Views with V3 Layouts

**Files:**
- Modify: `src/components/Calendar/HomeMonthlyCalendar.tsx`
- Modify: `src/components/Calendar/YearCalendarView.tsx`
- Modify: `src/components/Calendar/Calendar.module.css`

**Interfaces:**
- Produces:
  - `<HomeMonthlyCalendar ... />` with month selector `< Août 2026 >`, DayCells, and "Voir le calendrier sur l'année" button.
  - `<YearCalendarView ... />` with continuous multi-month scroll and bottom fixed "Retour" button.

- [ ] **Step 1: Update `HomeMonthlyCalendar.tsx`**
  - Header with chevron navigation `< Month Year >`.
  - Weekday labels strip with bottom border.
  - DayCells grid.
  - Primary button "Voir le calendrier sur l'année" (solid dark).

- [ ] **Step 2: Update `YearCalendarView.tsx` matching Figma node `4230:12337`**
  - Continuous vertical feed of months (Juillet 2026, Août 2026, etc.).
  - Fixed bottom bar with primary button "Retour".

- [ ] **Step 3: Verify build**
  - Run `npm run build`.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/Calendar/HomeMonthlyCalendar.tsx src/components/Calendar/YearCalendarView.tsx src/components/Calendar/Calendar.module.css
  git commit -m "feat(views): update Home and Year calendar views to V3 design"
  ```

---

### Task 7: Implement Desktop Responsive Layout (Macbook view) & App Integration

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Calendar/Calendar.module.css`

**Interfaces:**
- Produces: Responsive App supporting Mobile (nodes 4230:12232, 4230:12337) and Desktop (node 4230:13126).

- [ ] **Step 1: Integrate `NavigationHeader` and `TabBar` in `App.tsx`**
  - Replace legacy header with `NavigationHeader`.
  - Add fixed bottom `TabBar`.

- [ ] **Step 2: Implement Desktop Two-Column Responsive Layout in `Calendar.module.css`**
  - When viewport width >= 1024px:
    - Side-by-side layout: Calendar feed on the left, `PhaseInsightsCard` sticky on the right.
    - Centered `TabBar` at bottom.
    - Max container width matching Macbook frame.

- [ ] **Step 3: Dynamic multi-mode theme data attribute**
  - Set `data-theme` attribute on `document.documentElement` according to today's active phase (`phase 1`, `phase 2`, `phase 3`, `phase4`).

- [ ] **Step 4: Full verification**
  - Run `npm run build`.
  - Test responsiveness in browser across mobile (390-420px) and desktop (>=1024px).

- [ ] **Step 5: Commit**
  ```bash
  git add src/App.tsx src/components/Calendar/Calendar.module.css
  git commit -m "feat(app): integrate responsive desktop layout and V3 navigation"
  ```
