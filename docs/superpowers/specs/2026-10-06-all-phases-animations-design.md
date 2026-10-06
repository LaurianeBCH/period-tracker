# Design Spec : Animations illustrées pour chaque phase du cycle (Figma Motion)

## 1. Contexte & Objectif
Intégrer des animations vectorielles/illustrées pour **chacune des 4 phases du cycle**, directement sous la carte "Votre phase du moment" sur l'écran d'accueil (`home`).
Chaque animation met en scène une surfeuse adaptée à la phase (personnage1, 2, 3, 4) avec 3 calques de vagues en mouvement fluide et en boucle continue :
- **Phase 1 (Folliculaire / "Prise d’élan")** : Surfeuse allongée pagayant sur la planche, vagues en progression (durée boucle : 5s).
- **Phase 2 (Ovulatoire / "Debout sur la planche")** : Surfeuse debout surfant sur la vague, vagues amples, balancement et houle (durée boucle : 6s).
- **Phase 3 (Lutéale / "Dans le tube de la vague")** : Surfeuse surfant dans le creux, houle dynamique (durée boucle : 6s).
- **Phase 4 (Menstruelle / "Repos avant la prochaine vague")** : Surfeuse assise/agenouillée au repos sur la planche, vagues lentes en reflux apaisant (durée boucle : 8s).

---

## 2. Structure des Fichiers & Assets

### 2.1 Assets (`public/animation/`)
Les assets sont déjà présents dans `public/animation/` :
- **Phase 1** :
  - `personnage1.png`
  - `phase1-vague 1.svg`, `phase1-vague 2.svg`, `phase1-vague 3.svg`
- **Phase 2** :
  - `personnage2.png`
  - `phase2-vague 1.svg`, `phase2-vague 2.svg`, `phase2-vague 3.svg`
- **Phase 3** :
  - `personnage3.png`
  - `phase3-vague 1.svg`, `phase3-vague 2.svg`, `phase3-vague 3.svg`
- **Phase 4** :
  - `personnage4.png`
  - `phase4-vague 1.svg`, `phase4-vague 2.svg`, `phase4-vague 3.svg`

### 2.2 Composants Code (`src/components/PhaseAnimation/`)
- `PhaseAnimationView.tsx` : Composant coordinateur principal recevant `phase: CyclePhase` et affichant l'animation correspondante.
- `Phase1Animation.tsx` + `Phase1Animation.module.css` : Animation de la phase 1 (5s loop).
- `Phase2Animation.tsx` + `Phase2Animation.module.css` : Animation de la phase 2 (6s loop).
- `Phase3Animation.tsx` + `Phase3Animation.module.css` : Animation de la phase 3 (6s loop).
- `Phase4Animation.tsx` + `Phase4Animation.module.css` : Animation de la phase 4 (8s loop).
- `PhaseAnimation.module.css` : Styles partagés du conteneur responsive (ratio 393×309, centrage, coins arrondis, masque de débordement).
- `index.ts` : Export public.

---

## 3. Spécifications Détaillées des Keyframes par Phase

### 3.1 Dimensions & Conteneur Commun
- Rendu au ratio 393 × 309 px (`aspect-ratio: 393 / 309`), largeur 100%, max-width 393px (ou adaptable), `overflow: hidden`, `border-radius: 24px`, positionnement relatif.
- Tous les calques animés utilisent l'accélération matérielle GPU (`transform: translate3d(...) rotate(...)` et `will-change: transform`).

### 3.2 Phase 1 (5000ms loop)
- **Vague 3** : top `27.80px`, translation X de `-1238.55px` à `-314.51px` sur 4.4s, hold jusqu'à 5.0s (`cubic-bezier(0.42, 0, 0.58, 1)`).
- **Vague 2** : top `98.58px`, translation X de `-1088.55px` à `-164.51px` sur 4.04s, hold jusqu'à 5.0s.
- **Personnage 1** : left `1.5px`, top `12.25px`, rotation légère de 0° à 10° à 1.54s puis retour à 0° à 2.81s (`cubic-bezier(0.5, 0, 0.5, 1)`).
- **Vague 1** : top `157.04px`, translation X de `-1148.55px` à `-224.51px` sur 5.0s.

### 3.3 Phase 2 (6000ms loop)
- **Vague 3** : top `54.17px`, translation X de `-1238.55px` à `-314.51px` sur 6.0s linéaire.
- **Vague 2** : top `116.11px`, hold 50ms puis translation X de `-1088.55px` à `-172.21px` sur 6.0s.
- **Personnage 2** : left `21.5px`, top `2.19px`, balancement vertical `translateY` (0px ➔ -15.14px ➔ 0px ➔ -15.14px ➔ 0px) et rotation (0° ➔ 5° ➔ 0° ➔ 5° ➔ 0°) synchronisés sur la houle.
- **Vague 1** : top `193.54px`, translation X de `-1148.55px` à `-224.51px` sur 6.0s.

### 3.4 Phase 3 (6000ms loop)
- **Vague 3** : top `-2.51px`, translation X de `-1014.75px` à `-90.71px` sur 6.0s linéaire.
- **Vague 2** : top `77.75px`, translation X de `-882.53px` vers `-203.47px` (8.02s slope synchronisée).
- **Personnage 3** : left `21.5px`, top `2.19px`, balancement vertical `translateY` (0px ➔ -15.14px ➔ 0px) et rotation (0° ➔ 5° ➔ 0°) en boucle de 6.0s.
- **Vague 1** : top `178.08px`, translation X de `-925.47px` vers `-88.99px`.

### 3.5 Phase 4 (8000ms loop)
- **Vague 3** : top `103.77px`, translation X inversée douce de `-314.51px` à `-1238.55px` sur 8.0s (apaisement).
- **Vague 2** : top `134.17px`, translation X de `-164.51px` à `-1088.55px` sur 8.0s.
- **Personnage 4** : left `21.5px`, top `20.77px`, pose agenouillée au repos avec très léger flottement apaisé (±2px sur 8s).
- **Vague 1** : top `172.16px`, translation X de `-224.51px` à `-1148.55px` sur 8.0s.

---

## 4. Intégration dans l'Application (`src/App.tsx`)
Dans `src/App.tsx`, sous la carte `PhaseInsightsCard` :
```tsx
{/* "Votre phase du moment" Card */}
<PhaseInsightsCard insight={todayInsight} />

{/* Animation illustrée dynamique selon la phase */}
<PhaseAnimationView phase={todayInsight.phaseKey} />
```

---

## 5. Vérification
- Validation du build TypeScript : `npm run build`.
- Vérification que l'animation bascule correctement lorsque l'utilisateur sélectionne différentes dates dans le calendrier ou change de phase.
