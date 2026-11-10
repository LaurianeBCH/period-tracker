# Mode Neutre (Sans Onboarding), Bouton « Valider » & Redirection PWA — Spécification

## 1. Objectif & Contexte
Remplacer l'écran bloquant d'onboarding (`OnboardingWizard`) par un accès direct à l'application en **mode Neutre** (`[data-theme="neutre"]`) tant qu'aucune date de règles n'est enregistrée (`periodDates.length === 0`), conformément aux maquettes Figma `4347:9297` (Mobile) et `4347:9168` (Desktop).

Parallèlement :
- Remplacer le libellé du bouton **« Créer un compte »** par **« Valider »** dans [`MyCycleView.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/MyCycle/MyCycleView.tsx) afin d'indiquer clairement que le même champ email sert à la fois à créer un compte et à se reconnecter à un compte existant.
- Configurer le manifeste PWA dans [`vite.config.ts`](file:///Users/lauriane/Sites/period-tracker/vite.config.ts) (`start_url`, `scope`, `handle_links`, `launch_handler`) et l'URL de redirection `emailRedirectTo` dans [`syncService.ts`](file:///Users/lauriane/Sites/period-tracker/src/services/syncService.ts) pour que le clic sur le lien de confirmation par email redirige dans le périmètre `/period-tracker/` de la PWA.

## 2. Maquettes Figma de Référence
- **Mobile — Première connexion neutre** : node `4347:9297`
- **Desktop — Première connexion neutre** : node `4347:9168`

## 3. Spécifications Fonctionnelles & UI

> [!IMPORTANT]
> Règle absolue (`AGENTS.md`) : Toujours utiliser les design tokens définis dans [`src/index.css`](file:///Users/lauriane/Sites/period-tracker/src/index.css) pour tout le CSS.

### 3.1. Suppression de `OnboardingWizard` & Thème Neutre ([`App.tsx`](file:///Users/lauriane/Sites/period-tracker/src/App.tsx))
- Supprimer le rendu conditionnel de `OnboardingWizard` dans [`App.tsx`](file:///Users/lauriane/Sites/period-tracker/src/App.tsx) : l'utilisatrice accède directement à l'interface principale (`Calendrier`, `Recommandations`, `Mon cycle`).
- Lorsque `periodDates.length === 0` :
  - Sur les onglets `calendar` et `cycle`, appliquer `document.documentElement.setAttribute('data-theme', 'neutre')`.
  - Ne pas afficher `PhaseIntroOverlay` tant que `periodDates.length === 0`. Dès que `periodDates.length > 0` (suite à un clic sur le calendrier ou à une synchronisation Supabase), appliquer le thème de la phase active (`phase 1`..`phase 4`) et jouer l'animation `PhaseIntroOverlay` correspondante.

### 3.2. Statut Neutre des Jours Sans Règles ([`cycleEngine.ts`](file:///Users/lauriane/Sites/period-tracker/src/utils/cycleEngine.ts) & [`DayCell.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/Calendar/DayCell.tsx))
- Dans [`src/utils/cycleEngine.ts`](file:///Users/lauriane/Sites/period-tracker/src/utils/cycleEngine.ts), lorsque `blocks.length === 0` (aucune date de règles déclarée), `getDayStatus` retourne `phase: 'Neutral'` (`isActualPeriod: false`, `isPredictedPeriod: false`, `isOvulationDay: false`, `isFertileWindow: false`).
- Dans [`DayCell.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/Calendar/DayCell.tsx), une cellule avec `phase: 'Neutral'` utilise `.phaseDefault` (`background-color: var(--background-level-3)`, `color: var(--text-dark-primary)`) et n'affiche aucun badge de phase (`1`, `2`, `3`, goutte). Seul le point du jour actuel (`.todayDot` en `var(--accent)`) est affiché sur la date d'aujourd'hui.

### 3.3. Message d'Invitation sur le Calendrier ([`HomeMonthlyCalendar.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/Calendar/HomeMonthlyCalendar.tsx))
- Lorsque `effectiveDates.length === 0`, afficher en haut de `.calendarCard` un bloc centré `.emptyCalendarPrompt` :
  - Ligne 1 (`.emptyPromptQuestion`) : `Quand avez-vous eu vos dernières règles ?` (`font-size: var(--typo-body-default-size)`, `line-height: var(--typo-body-default-line-height)`, `color: var(--text-dark-primary)`).
  - Ligne 2 (`.emptyPromptHint`) : `Pointer les dates dans le calendrier.` (`font-size: var(--typo-body-default-size)`, `line-height: var(--typo-body-default-line-height)`, `color: var(--text-dark-secondary)`).

### 3.4. Carte « Phase du moment » en Mode Neutre ([`PhaseInsightsCard.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/Calendar/PhaseInsightsCard.tsx))
- Lorsque `todayStatus?.phase === 'Neutral'` (ou `isEmpty` lorsque aucune date de règles n'est renseignée) :
  - Sous le titre `Phase du moment`, remplacer le badge de phase par le texte centré `.insightsEmptySubtitle` :
    `Aucune information pour le moment. Renseignez vos dernières règles` (`font-size: var(--typo-body-default-size)`, `line-height: var(--typo-body-default-line-height)`, `color: var(--text-dark-secondary)`, `text-align: center`).
  - Sur le graphique SVG de la courbe, masquer le marqueur `Jour J` (`dayMarkerGroup`).

### 3.5. Bouton « Valider » dans « Mon cycle » ([`MyCycleView.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/MyCycle/MyCycleView.tsx))
- Dans [`MyCycleView.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/MyCycle/MyCycleView.tsx), remplacer le texte du bouton de soumission du formulaire email (`Créer un compte`) par `Valider`.

### 3.6. Configuration PWA & Redirection Magic Link ([`vite.config.ts`](file:///Users/lauriane/Sites/period-tracker/vite.config.ts) & [`syncService.ts`](file:///Users/lauriane/Sites/period-tracker/src/services/syncService.ts))
- Dans [`vite.config.ts`](file:///Users/lauriane/Sites/period-tracker/vite.config.ts), compléter `manifest` avec :
  - `start_url: '/period-tracker/'`
  - `scope: '/period-tracker/'`
  - `handle_links: 'preferred'`
  - `launch_handler: { client_mode: ['navigate-existing', 'auto'] }`
- Dans [`syncService.ts`](file:///Users/lauriane/Sites/period-tracker/src/services/syncService.ts), exporter un helper `getAuthRedirectUrl(origin: string, baseUrl?: string): string` qui construit `new URL(baseUrl || '/period-tracker/', origin).href` afin que `emailRedirectTo` cible toujours l'URL complète dans le `scope` de la PWA.

