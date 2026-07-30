# Period Tracker PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal, modern, responsive Progressive Web App (PWA) in React 19 and TypeScript to track menstrual cycles and ovulation with a virtualized vertical infinite scrolling calendar starting at the current month.

**Architecture:** A pure functional cycle engine (`cycleEngine.ts`) handles calculations for predicted period dates, ovulation, and fertile windows based on user logs and settings stored in `localStorage`. The UI is built using React 19 + CSS Modules (without external UI frameworks), featuring an Onboarding Wizard, Virtualized Infinite Vertical Calendar, and a Bottom Sheet date action drawer.

**Tech Stack:** React 19, TypeScript, Vite, `vite-plugin-pwa`, CSS Modules.
**Project Location:** `/Users/lauriane/Sites/period-tracker`

## Global Constraints

- Location: `/Users/lauriane/Sites/period-tracker`
- Tech Stack: React 19, TypeScript, Vite, CSS Modules.
- Styling: Vanilla CSS with CSS Modules and CSS Variables. No CSS framework (e.g. Tailwind).
- Virtualization: Smooth vertical scroll for infinite months rendering.
- Offline support: PWA manifest + Service Worker.
- Language: UI in French.
- Testing: Direct development (no unit tests / no TDD).

---

### Task 1: Scaffold Vite + React 19 + TypeScript + PWA Environment

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `src/vite-env.d.ts`
- Create: `index.html`
- Create: `src/main.tsx`

**Interfaces:**
- Consumes: None
- Produces: Project build configuration for React 19 + TypeScript + `vite-plugin-pwa`.

- [ ] **Step 1: Write `package.json` with React 19 and PWA dependencies**

```json
{
  "name": "period-tracker-pwa",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.0",
    "vite-plugin-pwa": "^0.21.1"
  }
}
```

- [ ] **Step 2: Write `vite.config.ts` with PWA plugin configuration**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Suivi de Règles & Ovulation',
        short_name: 'CyclePWA',
        description: 'Application minimale et privée de suivi du cycle menstruel',
        theme_color: '#fff0f3',
        background_color: '#fff0f3',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

- [ ] **Step 3: Write `tsconfig.json` & `index.html`**

Create standard TypeScript configurations and HTML shell for React 19 app with viewport meta tag for mobile PWA support.

- [ ] **Step 4: Install dependencies using `npm install`**

Run: `npm install` inside `/Users/lauriane/Sites/period-tracker`
Expected: Clean package lock generation without errors.

- [ ] **Step 5: Commit**

```bash
git init
git add package.json vite.config.ts tsconfig.json index.html src/
git commit -m "chore: scaffold vite react 19 typescript pwa setup"
```

---

### Task 2: Core Domain Cycle Engine (`cycleEngine.ts`)

**Files:**
- Create: `src/types/cycle.ts`
- Create: `src/utils/cycleEngine.ts`

**Interfaces:**
- Consumes: None
- Produces: `predictCycles()`, `getDayStatus()`, `formatDateISO()`, `parseDateISO()` for calculating periods, fertile windows, and ovulation days.

- [ ] **Step 1: Write types in `src/types/cycle.ts`**

```typescript
export interface UserSettings {
  averageCycleLength: number;
  averagePeriodLength: number;
  lutealPhaseLength: number;
  isOnboarded: boolean;
}

export type LogType = 'period_start' | 'period_end';

export interface CycleLog {
  date: string; // 'YYYY-MM-DD'
  type: LogType;
}

export interface DayStatus {
  dateStr: string;
  isToday: boolean;
  isActualPeriod: boolean;
  isPredictedPeriod: boolean;
  isOvulationDay: boolean;
  isFertileWindow: boolean;
  log?: CycleLog;
}
```

- [ ] **Step 2: Implement logic in `src/utils/cycleEngine.ts`**

Implement date math helpers (`addDays`, `diffDays`, `formatDateISO`, `parseDateISO`) and `getDayStatus` projection logic calculating predicted period ranges, fertile windows, and ovulation days based on user logs and settings.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/cycle.ts src/utils/cycleEngine.ts
git commit -m "feat: implement cycle calculation engine"
```

---

### Task 3: Local Storage Persistence Service (`storage.ts`)

**Files:**
- Create: `src/services/storage.ts`

**Interfaces:**
- Consumes: `UserSettings`, `CycleLog` types
- Produces: `getSettings()`, `saveSettings()`, `getLogs()`, `saveLogs()`, `logPeriodStart()`, `logPeriodEnd()`, `removeLogForDate()`

- [ ] **Step 1: Implement `src/services/storage.ts`**

Implement local storage operations with JSON fallback safety for user cycle settings and log entries.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/storage.ts
git commit -m "feat: add local storage persistence service"
```

---

### Task 4: CSS Modules Design System & Global Styles

**Files:**
- Create: `src/index.css`
- Create: `src/styles/theme.module.css`

**Interfaces:**
- Consumes: Standard CSS Variables
- Produces: Color palette, responsive grid system, pastel theme variables, card utilities.

- [ ] **Step 1: Create `src/index.css`**

Define CSS reset, CSS root variables (`--color-bg`, `--color-primary`, `--color-period-actual`, `--color-period-predicted`, `--color-ovulation`, `--color-fertile`), typography, smooth scroll.

- [ ] **Step 2: Create `src/styles/theme.module.css`**

Export modular utility classes for containers, cards, buttons, sliders, and badges.

- [ ] **Step 3: Commit**

```bash
git add src/index.css src/styles/theme.module.css
git commit -m "style: define global CSS custom properties and design system"
```

---

### Task 5: Onboarding Wizard Component

**Files:**
- Create: `src/components/OnboardingWizard/OnboardingWizard.tsx`
- Create: `src/components/OnboardingWizard/OnboardingWizard.module.css`

**Interfaces:**
- Consumes: `UserSettings`, `saveSettings()`
- Produces: `<OnboardingWizard onComplete={(settings) => void} />`

- [ ] **Step 1: Implement `<OnboardingWizard />` component and CSS module**

3-step wizard with smooth step transitions:
- Step 1: Cycle duration slider (20–45j) + "Je ne sais pas (28 jours)".
- Step 2: Period duration slider (2–10j) + "Je ne sais pas (5 jours)".
- Step 3: Last period date picker + "Aujourd'hui / Je ne m'en rappelle pas".

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/OnboardingWizard/
git commit -m "feat: add onboarding wizard component with fallback default options"
```

---

### Task 6: Virtualized Vertical Infinite Scroll Calendar Component

**Files:**
- Create: `src/components/Calendar/CalendarHeader.tsx`
- Create: `src/components/Calendar/MonthGrid.tsx`
- Create: `src/components/Calendar/DayCell.tsx`
- Create: `src/components/Calendar/InfiniteMonthList.tsx`
- Create: `src/components/Calendar/Calendar.module.css`

**Interfaces:**
- Consumes: `UserSettings`, `CycleLog[]`, `onSelectDate: (dateStr: string) => void`
- Produces: `<InfiniteMonthList />` rendering infinite scroll starting from current month downwards into future months.

- [ ] **Step 1: Write `MonthGrid.tsx` and `DayCell.tsx`**

Renders 7-column weekday headers (Lun, Mar, Mer, Jeu, Ven, Sam, Dim) and month days.
Visual indicators:
- `isToday`: bold ring/border.
- `isActualPeriod`: deep rose pill/badge.
- `isPredictedPeriod`: soft pastel pink pill with subtle hatch pattern.
- `isOvulationDay`: lavender dot/circle indicator.
- `isFertileWindow`: soft lavender background tint.

- [ ] **Step 2: Implement `<InfiniteMonthList />` with scroll listener**

Computes list of months starting from current month $M_0$ down to $M_{0+N}$. Automatically appends more months as user scrolls near bottom (`IntersectionObserver` or scroll threshold).

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar/
git commit -m "feat: implement virtualized infinite vertical scroll calendar component"
```

---

### Task 7: Bottom Sheet Quick Action Drawer (`BottomSheet.tsx`)

**Files:**
- Create: `src/components/BottomSheet/BottomSheet.tsx`
- Create: `src/components/BottomSheet/BottomSheet.module.css`

**Interfaces:**
- Consumes: `selectedDateStr: string | null`, `currentStatus: DayStatus | null`, `onLogPeriodStart: (dateStr: string) => void`, `onLogPeriodEnd: (dateStr: string) => void`, `onRemoveLog: (dateStr: string) => void`, `onClose: () => void`
- Produces: Modal drawer animating from bottom of screen to log actual dates.

- [ ] **Step 1: Implement `<BottomSheet />` component**

Includes clean slide-up animation, date formatting in French ("Jeudi 30 Juillet 2026"), and buttons:
- "Marquer comme début des règles"
- "Marquer comme fin des règles"
- "Effacer la saisie pour cette date"
- "Fermer"

- [ ] **Step 2: Commit**

```bash
git add src/components/BottomSheet/
git commit -m "feat: add bottom sheet quick action drawer for period date edits"
```

---

### Task 8: App Integration, PWA Assets, & Production Verification

**Files:**
- Modify: `src/App.tsx`
- Create: `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/favicon.ico`

**Interfaces:**
- Consumes: All components, storage service, cycle engine.
- Produces: Fully functional PWA web app.

- [ ] **Step 1: Integrate state & layout in `src/App.tsx`**

Handles onboarding state check, calendar rendering, bottom sheet triggers, and settings header toggle.

- [ ] **Step 2: Run TypeScript compiler check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 3: Run Vite production build**

Run: `npx vite build`
Expected: Build output generated successfully in `dist/` with PWA manifest and service worker.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: integrate full PWA period tracker app and pass all build checks"
```
