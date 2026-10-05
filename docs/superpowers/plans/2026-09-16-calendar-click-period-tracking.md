# Implementation Plan: Déclaration des règles par clic direct et calcul dynamique du cycle

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les modales et sélections manuelles de début/fin de règles par un clic direct dans le calendrier avec remplissage et calcul dynamique automatique des cycles et des phases.

**Architecture:** Les dates de règles réelles sont stockées sous forme de tableau ordonné de dates ISO (`string[]`). Le moteur `cycleEngine` extrait les blocs de règles, déduit la durée du cycle ($L$) et des règles ($R$), projette les phases et les règles potentielles, et gère le toggle/auto-remplissage au clic. L'onboarding est simplifié à une seule étape (début/fin ou "Passer"). Les composants obsolètes (`BottomSheet`, `SettingsModal`, bouton bas) sont supprimés.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, CSS Modules.

## Global Constraints

- Cycle par défaut : 28 jours.
- Règles par défaut : 4 jours.
- Phase lutéale fixe : 14 jours (ovulation à $L - 14$).
- Pas de modale de réglages, pas de bouton flottant bas « Déclarer mes règles », pas de volet coulissant `BottomSheet`.
- Clic sur jour libre : déclare les règles avec auto-remplissage de $R$ jours consécutifs.
- Clic sur case règles : désactive la case unitairement (toggle off) et recalcule immédiatement.

---

### Task 1: Mise à jour des types et du stockage avec migration automatique

**Files:**
- Modify: `src/types/cycle.ts`
- Modify: `src/services/storage.ts`

**Interfaces:**
- Consumes: types existants.
- Produces:
  - `UserSettings`: `{ defaultCycleLength: number; defaultPeriodLength: number; lutealPhaseLength: number; isOnboarded: boolean; }`
  - `PeriodBlock`: `{ startDate: string; endDate: string; duration: number; }`
  - `getPeriodDates(): string[]`
  - `savePeriodDates(dates: string[]): void`
  - `togglePeriodDate(dateStr: string, defaultLength?: number): string[]`

- [ ] **Step 1: Mettre à jour `src/types/cycle.ts`**
  - Mettre à jour `UserSettings` avec `defaultCycleLength`, `defaultPeriodLength`, `lutealPhaseLength`, `isOnboarded`.
  - Ajouter l'interface `PeriodBlock`.
  - Mettre à jour `DayStatus` pour refléter l'état calculé du jour.

- [ ] **Step 2: Mettre à jour `src/services/storage.ts`**
  - Implémenter la migration depuis `cycle_pwa_logs` vers `period_tracker_dates`.
  - Implémenter `getPeriodDates`, `savePeriodDates`.
  - Implémenter `togglePeriodDate(dateStr: string, currentDates: string[], periodLen: number)`.
  - Mettre à jour `DEFAULT_SETTINGS` avec 28 jours et 4 jours.

- [ ] **Step 3: Vérification de compilation**
  Run: `pnpm run build`

---

### Task 2: Refonte du moteur de calcul (`src/utils/cycleEngine.ts`)

**Files:**
- Modify: `src/utils/cycleEngine.ts`

**Interfaces:**
- Consumes: `UserSettings`, `PeriodBlock`, `DayStatus` depuis `src/types/cycle.ts`.
- Produces:
  - `extractPeriodBlocks(dates: string[]): PeriodBlock[]`
  - `computeCycleMetrics(blocks: PeriodBlock[], settings: UserSettings): { cycleLength: number; periodLength: number; latestBlock: PeriodBlock | null; }`
  - `getDayStatus(dateStr: string, settings: UserSettings, periodDates: string[], todayISO?: string): DayStatus`

- [ ] **Step 1: Implémenter l'extraction des blocs et calcul des métriques dans `cycleEngine.ts`**
  - Grouper les dates avec écart $\le 3$ jours.
  - Calculer $L$ = écart entre les 2 derniers blocs si $\ge 2$, sinon 28j.
  - Calculer $R$ = durée du bloc précédent (ou courant si 1 seul), sinon 4j.

- [ ] **Step 2: Adapter `getDayStatus` pour le calcul dynamique des 4 phases et règles potentielles**
  - Phase 4 réelle si date présente dans `periodDates`.
  - Phase 1 (Prise d'élan) dès le lendemain de la fin des règles jusqu'à la fenêtre fertile.
  - Phase 2 (Ovulation) sur la fenêtre fertile.
  - Phase 3 (Lutéale) jusqu'à la fin du cycle.
  - Règles potentielles projetées sur $R$ jours à partir de $D_0 + L$.
  - Prise en compte du cas "Passer" (ancrage aujourd'hui avec règles potentielles).

- [ ] **Step 3: Script de vérification unitaire**
  - Tester les calculs d'écart, blocs et phases.

---

### Task 3: Simplification de l'Onboarding (`src/components/OnboardingWizard`)

**Files:**
- Modify: `src/components/OnboardingWizard/OnboardingWizard.tsx`
- Modify: `src/components/OnboardingWizard/OnboardingWizard.module.css`

**Interfaces:**
- Consumes: `UserSettings`, `getTodayISO`, `addDays`.
- Produces: `onComplete(settings: UserSettings, initialDates?: string[]): void`.

- [ ] **Step 1: Remplacer le wizard multi-étapes par une étape unique**
  - Champs début et fin des dernières règles.
  - Bouton « Valider » : génère les dates entre début et fin et valide.
  - Bouton « Passer » : valide sans dates initiales (active le mode par défaut avec règles potentielles à aujourd'hui).

- [ ] **Step 2: Ajuster les styles CSS associés**
  - Supprimer les styles des étapes et sliders devenus inutiles.

- [ ] **Step 3: Vérification de build**
  Run: `pnpm run build`

---

### Task 4: Intégration du clic direct dans le calendrier et nettoyage UI

**Files:**
- Modify: `src/components/Calendar/DayCell.tsx`
- Modify: `src/components/Calendar/MonthGrid.tsx`
- Modify: `src/components/Calendar/InfiniteMonthList.tsx`
- Modify: `src/components/Calendar/CalendarHeader.tsx`
- Modify: `src/components/Calendar/Calendar.module.css`
- Modify: `src/App.tsx`
- Delete: `src/components/BottomSheet/` (ou ne plus l'importer)
- Delete: `src/components/SettingsModal/` (ou ne plus l'importer)
- Delete: `src/components/LogPeriodModal/` (ou ne plus l'importer)

- [ ] **Step 1: Supprimer le bouton de réglages du header (`CalendarHeader.tsx`)**
  - Retirer le bouton roue crantée / `onOpenSettings`.

- [ ] **Step 2: Câbler le clic direct dans `DayCell` $\rightarrow$ `MonthGrid` $\rightarrow$ `InfiniteMonthList` $\rightarrow$ `App`**
  - Un clic sur un jour déclenche le toggle/auto-remplissage via `handleDayClick(dateStr)`.

- [ ] **Step 3: Nettoyer `App.tsx`**
  - Remplacer `logs` par `periodDates`.
  - Retirer `BottomSheet`, `SettingsModal`, `LogPeriodModal`.
  - Retirer la barre d'action du bas (`bottomActionBar`) et son bouton « Déclarer mes règles ».
  - Mettre à jour l'effet de couleur de fond et le calcul du jour courant.

- [ ] **Step 4: Supprimer les styles inutilisés dans `Calendar.module.css`**
  - Nettoyer `.bottomActionBar` et `.btnDeclarePeriod`.

---

### Task 5: Validation finale de bout en bout

- [ ] **Step 1: Vérification du build TypeScript et Vite**
  Run: `pnpm run build`
- [ ] **Step 2: Test du flux complet dans le navigateur via le browser subagent**
  - Onboarding : tester la saisie et le bouton "Passer".
  - Calendrier : cliquer sur une date libre -> vérifier le remplissage de 4 jours et le recalcul des phases.
  - Calendrier : cliquer sur une date déjà cochée -> vérifier la désactivation unitaire et le recalcul.
  - Enregistrer la démonstration vidéo pour les artefacts.
