# Period Tracker PWA - Design Specification

**Date**: 2026-07-30  
**Status**: Approved  
**Target Stack**: Vite + React 19 + TypeScript + CSS Modules + PWA (`vite-plugin-pwa`)  
**Project Path**: `/Users/lauriane/Sites/period-tracker`

---

## 1. Overview & Objectives

The goal is to build a minimal, elegant, offline-first Progressive Web Application (PWA) to track menstrual cycles and ovulation predictions.

### Key Features
1. **Infinite Vertical Scroll Calendar**: Starts at the current month and continuously renders future months as the user scrolls downwards, using virtualized list rendering for 60fps performance.
2. **Cycle Prediction Engine**: Automatic calculation of future period start/end dates, fertile window, and ovulation day based on standard parameters or user history.
3. **Actual Date Overrides**: Ability to click any date in the calendar and log actual period start/end dates, automatically updating all future predictions.
4. **First-Time Onboarding Wizard**: A 3-step onboarding flow for initial configuration, including an "I don't know" option that sets standard defaults (28-day cycle, 5-day period).
5. **PWA & Offline Capability**: Installable app with full offline support via service worker and local storage.

---

## 2. Architecture & Tech Stack

- **Framework**: React 19 + TypeScript.
- **Build Tool**: Vite (VoidZero ecosystem standard).
- **Styling**: Pure CSS Modules (`*.module.css`) with standard CSS variables for styling (clean pastel color system, subtle gradients, responsive design). No CSS frameworks (e.g. no Tailwind).
- **Virtualization**: Lightweight windowing for month grids to keep memory and DOM usage minimal during deep vertical scrolling.
- **PWA Integration**: `vite-plugin-pwa` with web app manifest and offline cache strategy.
- **Persistence**: `localStorage` (with JSON serialization and versioning).

---

## 3. Data Architecture & Domain Engine (`cycleEngine.ts`)

### Data Structures

```typescript
export interface UserSettings {
  averageCycleLength: number; // default: 28
  averagePeriodLength: number; // default: 5
  lutealPhaseLength: number; // default: 14
  isOnboarded: boolean;
}

export type LogType = 'period_start' | 'period_end';

export interface CycleLog {
  date: string; // ISO format 'YYYY-MM-DD'
  type: LogType;
}

export interface DayStatus {
  dateStr: string; // 'YYYY-MM-DD'
  isToday: boolean;
  isActualPeriod: boolean;
  isPredictedPeriod: boolean;
  isOvulationDay: boolean;
  isFertileWindow: boolean;
  log?: CycleLog;
}
```

### Calculation Rules
- **Base Anchor**: The most recent `period_start` log registered by the user. If no logs exist, defaults to the date provided during onboarding.
- **Cycle Iteration**: From the base anchor date $D_0$, future cycles are projected at intervals of $C = \text{averageCycleLength}$ days.
- **Predicted Period Range**: For each cycle $k$, predicted period spans $[D_0 + k \cdot C, D_0 + k \cdot C + P - 1]$ where $P = \text{averagePeriodLength}$.
- **Ovulation Day**: Estimated at $D_0 + (k+1) \cdot C - L$ where $L = \text{lutealPhaseLength}$ (default 14 days).
- **Fertile Window**: Spans $[\text{OvulationDay} - 5, \text{OvulationDay} + 1]$.

---

## 4. UI / UX Design & Components

### 4.1 Onboarding Wizard (`/components/OnboardingWizard`)
- Displayed automatically if `UserSettings.isOnboarded` is `false`.
- **Step 1**: Cycle Length selection (Slider 20–45 days, plus "Je ne sais pas" button setting 28 days).
- **Step 2**: Period Duration selection (Slider 2–10 days, plus "Je ne sais pas" button setting 5 days).
- **Step 3**: Last Period Start Date (Calendar picker + "Je ne m'en rappelle pas / Aujourd'hui" button).

### 4.2 Calendar View (`/components/Calendar`)
- **Header**: Fixed top bar showing current month/year and a Settings button.
- **Virtualized Vertical Month List**: Renders month grids dynamically.
- **Month Grid**:
  - Month Header (e.g., "Août 2026").
  - Day of week header (Lun, Mar, Mer, Jeu, Ven, Sam, Dim).
  - 7-column grid of days with visually distinct styling:
    - **Today**: High-contrast outline or badge.
    - **Actual Period**: Deep warm rose/red badge.
    - **Predicted Period**: Soft pastel pink badge with striped pattern or soft border.
    - **Ovulation Day**: Soft lavender/violet indicator.
    - **Fertile Window**: Soft lavender tint background.

### 4.3 Date Action Bottom Sheet (`/components/BottomSheet`)
- Triggers upon tapping any day cell in the calendar.
- Displays selected date formatted in French (e.g. "Jeudi 30 Juillet 2026").
- Quick action toggles:
  - "Marquer comme début des règles"
  - "Marquer comme fin des règles"
  - "Supprimer la saisie pour cette date"
- Instantly updates local storage and triggers calendar re-calculation.

---

## 5. Verification Plan

### Manual & Build Verification
- Verification via `npx tsc --noEmit`.
- Production build validation (`npx vite build`).
- Testing infinite scroll behavior, offline capability, onboarding wizard flow, and bottom sheet date edits.
