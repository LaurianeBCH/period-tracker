# All Phases Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Intégrer les 4 animations dynamiques de phases (Phase 1, 2, 3, 4) sous la carte "Votre phase du moment" sur l'écran d'accueil avec animations CSS GPU et assets Figma.

**Architecture:** Un composant coordinateur `PhaseAnimationView` écoute la phase courante (`CyclePhase`) et rend le composant d'animation correspondant (`Phase1Animation`, `Phase2Animation`, `Phase3Animation`, `Phase4Animation`). Chaque composant reproduit fidèlement la timeline, les keyframes et les courbes de bézier Figma Motion via CSS Modules et des SVG/PNG superposés dans un conteneur responsive à ratio fixe.

**Tech Stack:** React 19, TypeScript 5.7, CSS Modules, Vite.

## Global Constraints
- Utiliser CSS Modules et Vanilla CSS (aucun package externe d'animation à installer).
- Utiliser `import.meta.env.BASE_URL` pour tous les chemins d'assets afin de supporter le déploiement GitHub Pages (`/period-tracker/`).
- Préserver le ratio d'aspect 393 × 309 px et le rayon de courbure (24px) des cartes.
- Accélération matérielle 60fps via `transform: translate3d(...) rotate(...)` et `will-change: transform`.

---

### Task 1: Conteneur partagé et utilitaire de chemin d'assets

**Files:**
- Create: `src/components/PhaseAnimation/PhaseAnimation.module.css`
- Create: `src/components/PhaseAnimation/utils.ts`

**Interfaces:**
- Produces: `getAnimationAssetUrl(filename: string): string`
- Produces: classes CSS `.animationContainer`, `.sceneWrapper`, `.waveLayer`, `.characterLayer`

- [ ] **Step 1: Créer l'utilitaire `utils.ts`**

```typescript
export function getAnimationAssetUrl(fileName: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}animation/${encodeURIComponent(fileName)}`;
}
```

- [ ] **Step 2: Créer le CSS partagé `PhaseAnimation.module.css`**

```css
.animationCard {
  width: 100%;
  max-width: 393px;
  margin: 0 auto 1.5rem auto;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 240, 255, 0.6) 100%);
  border: 1px solid rgba(220, 210, 240, 0.4);
}

.sceneWrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 393 / 309;
  overflow: hidden;
  user-select: none;
}

.layer {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
  pointer-events: none;
}

.character {
  position: absolute;
  will-change: transform;
  pointer-events: none;
}
```

- [ ] **Step 3: Vérification TypeScript**

Run: `npm run build`
Expected: Build sans erreur de typage.

- [ ] **Step 4: Commit**

```bash
git add src/components/PhaseAnimation/PhaseAnimation.module.css src/components/PhaseAnimation/utils.ts
git commit -m "feat(animation): add shared container styles and asset utility"
```

---

### Task 2: Implémentation des animations Phase 1 & Phase 2

**Files:**
- Create: `src/components/PhaseAnimation/Phase1Animation.tsx`
- Create: `src/components/PhaseAnimation/Phase1Animation.module.css`
- Create: `src/components/PhaseAnimation/Phase2Animation.tsx`
- Create: `src/components/PhaseAnimation/Phase2Animation.module.css`

**Interfaces:**
- Consumes: `getAnimationAssetUrl` depuis `./utils`
- Produces: `Phase1Animation: React.FC`, `Phase2Animation: React.FC`

- [ ] **Step 1: Créer `Phase1Animation.module.css`**

Implémenter les keyframes pour la timeline 5000ms :
- `wave3Move` : translate3d(-1238.55px, 27.8px, 0) ➔ translate3d(-314.51px, 27.8px, 0) à 88%, hold à 100%.
- `wave2Move` : translate3d(-1088.55px, 98.58px, 0) ➔ translate3d(-164.51px, 98.58px, 0) à 80.8%, hold à 100%.
- `wave1Move` : translate3d(-1148.55px, 157.04px, 0) ➔ translate3d(-224.51px, 157.04px, 0) à 100%.
- `character1Move` : rotation 0° ➔ 10° à 30.9% ➔ 0° à 56.3%, hold à 100%.

- [ ] **Step 2: Créer `Phase1Animation.tsx`**

Monter les 4 calques : `phase1-vague 3.svg`, `phase1-vague 2.svg`, `personnage1.png`, `phase1-vague 1.svg`.

- [ ] **Step 3: Créer `Phase2Animation.module.css`**

Implémenter les keyframes pour la timeline 6000ms :
- `wave3Move` : translate3d(-1238.55px, 54.17px, 0) ➔ translate3d(-314.51px, 54.17px, 0).
- `wave2Move` : translate3d(-1088.55px, 116.11px, 0) ➔ translate3d(-172.21px, 116.11px, 0).
- `wave1Move` : translate3d(-1148.55px, 193.54px, 0) ➔ translate3d(-224.51px, 193.54px, 0).
- `character2Move` : translate3d(21.5px, 2.19px, 0) rotate(0deg) ➔ translate3d(21.5px, -15.14px, 0) rotate(5deg) à 22.8% ➔ translate3d(21.5px, 2.19px, 0) rotate(0deg) à 49% ➔ translate3d(21.5px, -15.14px, 0) rotate(5deg) à 75.5% ➔ 100%.

- [ ] **Step 4: Créer `Phase2Animation.tsx`**

Monter les 4 calques avec `phase2-vague 3.svg`, `phase2-vague 2.svg`, `personnage2.png`, `phase2-vague 1.svg`.

- [ ] **Step 5: Vérification TypeScript & build**

Run: `npm run build`
Expected: Build OK.

- [ ] **Step 6: Commit**

```bash
git add src/components/PhaseAnimation/Phase1Animation* src/components/PhaseAnimation/Phase2Animation*
git commit -m "feat(animation): implement Phase 1 and Phase 2 animated components"
```

---

### Task 3: Implémentation des animations Phase 3 & Phase 4

**Files:**
- Create: `src/components/PhaseAnimation/Phase3Animation.tsx`
- Create: `src/components/PhaseAnimation/Phase3Animation.module.css`
- Create: `src/components/PhaseAnimation/Phase4Animation.tsx`
- Create: `src/components/PhaseAnimation/Phase4Animation.module.css`

**Interfaces:**
- Consumes: `getAnimationAssetUrl` depuis `./utils`
- Produces: `Phase3Animation: React.FC`, `Phase4Animation: React.FC`

- [ ] **Step 1: Créer `Phase3Animation.module.css`**

Implémenter les keyframes pour la timeline 6000ms :
- `wave3Move` : translate3d(-1014.75px, -2.51px, 0) ➔ translate3d(-90.71px, -2.51px, 0).
- `wave2Move` : translate3d(-882.53px, 77.75px, 0) ➔ translate3d(-375.3px, 77.75px, 0).
- `wave1Move` : translate3d(-925.47px, 178.08px, 0) ➔ translate3d(-152.0px, 178.08px, 0).
- `character3Move` : oscillation de houle et rotation synchronisée de 0° à 5°.

- [ ] **Step 2: Créer `Phase3Animation.tsx`**

Monter les 4 calques avec `phase3-vague 3.svg`, `phase3-vague 2.svg`, `personnage3.png`, `phase3-vague 1.svg`.

- [ ] **Step 3: Créer `Phase4Animation.module.css`**

Implémenter les keyframes pour la timeline 8000ms (calme / reflux) :
- `wave3Move` : translate3d(-314.51px, 103.77px, 0) ➔ translate3d(-1238.55px, 103.77px, 0).
- `wave2Move` : translate3d(-164.51px, 134.17px, 0) ➔ translate3d(-1088.55px, 134.17px, 0).
- `wave1Move` : translate3d(-224.51px, 172.16px, 0) ➔ translate3d(-1148.55px, 172.16px, 0).
- `character4Rest` : position `21.5px, 20.77px` avec léger flottement apaisé (translateY ±2px).

- [ ] **Step 4: Créer `Phase4Animation.tsx`**

Monter les 4 calques avec `phase4-vague 3.svg`, `phase4-vague 2.svg`, `personnage4.png`, `phase4-vague 1.svg`.

- [ ] **Step 5: Vérification TypeScript & build**

Run: `npm run build`
Expected: Build OK.

- [ ] **Step 6: Commit**

```bash
git add src/components/PhaseAnimation/Phase3Animation* src/components/PhaseAnimation/Phase4Animation*
git commit -m "feat(animation): implement Phase 3 and Phase 4 animated components"
```

---

### Task 4: Coordinateur `PhaseAnimationView` et intégration dans `App.tsx`

**Files:**
- Create: `src/components/PhaseAnimation/PhaseAnimationView.tsx`
- Create: `src/components/PhaseAnimation/index.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `CyclePhase` depuis `../../types/cycle`
- Produces: `PhaseAnimationView: React.FC<{ phase: CyclePhase }>`

- [ ] **Step 1: Créer `PhaseAnimationView.tsx`**

```tsx
import { FC } from 'react';
import { CyclePhase } from '../../types/cycle';
import { Phase1Animation } from './Phase1Animation';
import { Phase2Animation } from './Phase2Animation';
import { Phase3Animation } from './Phase3Animation';
import { Phase4Animation } from './Phase4Animation';

interface PhaseAnimationViewProps {
  phase: CyclePhase;
}

export const PhaseAnimationView: FC<PhaseAnimationViewProps> = ({ phase }) => {
  switch (phase) {
    case 'Phase1-Follicular':
      return <Phase1Animation />;
    case 'Phase2-Ovulation':
      return <Phase2Animation />;
    case 'Phase3-Luteal':
      return <Phase3Animation />;
    case 'Phase4-Menstrual':
    case 'Phase4-Menstrual-Unconfirmed':
      return <Phase4Animation />;
    default:
      return null;
  }
};
```

- [ ] **Step 2: Créer `index.ts`**

```typescript
export { PhaseAnimationView } from './PhaseAnimationView';
```

- [ ] **Step 3: Mettre à jour `src/App.tsx`**

Importer `PhaseAnimationView` et l'insérer juste après `<PhaseInsightsCard insight={todayInsight} />`.

- [ ] **Step 4: Tester le build complet**

Run: `npm run build`
Expected: Validation complète TypeScript et bundle Vite sans erreur.

- [ ] **Step 5: Commit**

```bash
git add src/components/PhaseAnimation/ src/App.tsx
git commit -m "feat(animation): integrate PhaseAnimationView in App under insights card"
```
