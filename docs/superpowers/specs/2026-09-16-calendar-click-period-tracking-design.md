# Design Document: Déclaration des règles par clic direct et calcul dynamique du cycle

**Date** : 2026-09-16  
**Auteur** : Antigravity  
**Statut** : Validé par l'utilisatrice  

---

## 1. Contexte et Objectifs

L'objectif de cette refonte est de simplifier drastiquement l'expérience utilisateur pour renseigner ses cycles et ses règles :
1. **Élimination de la friction d'interface** : suppression de la modale des paramètres, du bouton flottant « Déclarer mes règles » et du volet coulissant (`BottomSheet`) demandant de choisir entre début et fin de règles.
2. **Interaction directe dans le calendrier** : un simple clic sur un jour libre déclare le début des règles, avec remplissage automatique de la période par défaut ou basée sur le cycle précédent. Un clic sur un jour déjà coché le désactive (toggle unitaire).
3. **Calcul dynamique automatique** :
   * Durée par défaut de 28 jours pour le cycle et de 4 jours pour les règles.
   * Mise à jour automatique de la durée du cycle à partir de l'écart réel entre les deux derniers débuts de cycles.
   * Mise à jour automatique de la durée des règles à partir de la durée effective du dernier cycle déclaré.
   * Recalcul en temps réel de toutes les phases (Phase 4 - Règles, Phase 1 - Prise d'élan, Phase 2 - Debout sur la planche / Ovulation, Phase 3 - Dans le tube de la vague / Lutéale, Règles potentielles).
4. **Onboarding épuré** :
   * Une seule étape demandant la période des dernières règles (début et fin).
   * Option « Passer » : configure la date du jour comme début prévisionnel des règles potentielles, avec cycle de 28j et règles de 4j.

---

## 2. Modèle de Données et Persistance

### 2.1 Nouveau Stockage (`services/storage.ts`)

* **Clé de stockage des dates de règles** : `period_tracker_dates`
  * Format : `string[]` (tableau de chaînes ISO 'YYYY-MM-DD' triées et sans doublons).
* **Clé de stockage des paramètres** : `period_tracker_settings`
  * Format `UserSettings` :
    ```typescript
    export interface UserSettings {
      defaultCycleLength: number; // 28 par défaut
      defaultPeriodLength: number; // 4 par défaut
      lutealPhaseLength: number;   // 14 par défaut
      isOnboarded: boolean;
    }
    ```

### 2.2 Migration Automatique
Au démarrage :
* Si `cycle_pwa_logs` existe dans `localStorage` mais pas `period_tracker_dates`, le système reconstruit les dates de règles à partir des paires `period_start` / `period_end` pour préserver l'historique utilisateur sans perte de données.

---

## 3. Moteur de Calcul (`utils/cycleEngine.ts`)

### 3.1 Détection des Blocs de Règles (Cycles)
* Les dates déclarées sont ordonnées chronologiquement.
* Deux dates séparées par $\le 3$ jours appartiennent au même bloc de règles (pour tolérer un jour sauté ou spotting).
* Deux blocs distants de plus de 10 jours représentent deux cycles distincts.
* Chaque bloc fournit :
  * `startDate` : date ISO du premier jour.
  * `endDate` : date ISO du dernier jour.
  * `duration` : nombre de jours réels inclus.

### 3.2 Déduction de la Durée du Cycle et des Règles
* **Durée du cycle $L$** :
  * Si $\ge 2$ blocs de règles existent : $L = \text{diffDays}(bloc_{N-1}.startDate, bloc_{N}.startDate)$.
  * Sinon : $L = settings.defaultCycleLength$ (28 jours).
* **Durée des règles $R$** :
  * Si un bloc précédent existe : $R = bloc_{précédent}.duration$.
  * Si seul le bloc courant existe : $R = bloc_{courant}.duration$ (si $\ge 1$) ou 4 jours par défaut.
  * Sinon : $settings.defaultPeriodLength$ (4 jours).

### 3.3 Recalcul Dynamique des Phases
Soit $D_0$ la date de début du cycle de référence (dernier `startDate` ou date du jour si onboarding passé) :
1. **Règles réelles (Phase 4 - Menstrual)** :
   * Tout jour présent dans `periodDates`.
2. **Phase 1 - Prise d'élan (Folliculaire)** :
   * Du jour suivant la fin du bloc de règles réel jusqu'au début de la fenêtre fertile ($D_0 + L - 17$).
3. **Phase 2 - Debout sur la planche (Ovulation / Fertile)** :
   * Fenêtre fertile : de $D_0 + L - 17$ à $D_0 + L - 13$.
   * Ovulation : $D_0 + L - 14$.
4. **Phase 3 - Dans le tube de la vague (Lutéale)** :
   * De $D_0 + L - 12$ à $D_0 + L - 1$.
5. **Règles potentielles (Phase 4 - Menstrual Unconfirmed)** :
   * Projetées sur $R$ jours à partir de $D_0 + L$ (et cycles futurs multiples de $L$).
   * Si l'onboarding a été passé, la date du jour sert d'ancrage $D_0$ pour les règles potentielles.

---

## 4. Expérience Utilisateur et Interactions

### 4.1 Clic sur le Calendrier (`CalendarDay` / `DayCell`)
* **Si la cellule est déjà en règles réelles** :
  * Le jour est supprimé de la liste (toggle off).
  * Les métriques et toutes les phases du calendrier sont instantanément recalculées.
* **Si la cellule n'est pas en règles** :
  * Si la date est éloignée de plus de 10 jours de la fin du bloc précédent : elle est considérée comme un **nouveau premier jour de règles**.
    * Remplissage automatique de la date cliquée + des $(R - 1)$ jours consécutifs suivants.
  * Si la date est contiguë ou proche d'un bloc existant : ajout direct de cette seule date pour prolonger/ajuster la période.
  * Les phases se recalculent immédiatement.

### 4.2 Onboarding Épuré (`OnboardingWizard.tsx`)
* Carte unique et épurée :
  * Champ "Date de début des dernières règles".
  * Champ "Date de fin des dernières règles" (initialisée par défaut à début + 3 jours).
  * Bouton d'action principal : « Valider ».
  * Bouton secondaire : « Passer » (initialise le tracker avec 28j de cycle, 4j de règles potentielles démarrant aujourd'hui).

### 4.3 Nettoyage de l'Interface (`App.tsx`, `CalendarHeader.tsx`)
* Retrait de l'icône / action d'ouverture des réglages dans `CalendarHeader`.
* Retrait complet du composant `SettingsModal`.
* Retrait complet du composant `BottomSheet`.
* Retrait du conteneur fixe `bottomActionBar` et du bouton « Déclarer mes règles ».

---

## 5. Plan de Vérification

1. **Tests unitaires de calcul du cycle (`cycleEngine.test.ts`)** :
   * Vérifier le calcul du cycle avec 2 blocs de dates (ex: 28 jours d'écart).
   * Vérifier le toggle de désactivation d'un jour.
   * Vérifier l'auto-remplissage de $R$ jours lors d'un nouveau premier jour de règles.
   * Vérifier le calcul des 4 phases et des règles potentielles.
2. **Validation dans l'application web** :
   * Vérifier le build TypeScript et Vite (`pnpm build`).
   * Vérifier visuellement le flux d'onboarding (avec saisie et avec option "Passer").
   * Tester les clics calendrier : activation 4 jours, désactivation d'un jour, mise à jour instantanée du thème de couleur et de l'aperçu de phase.
