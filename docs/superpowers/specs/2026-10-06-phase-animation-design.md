# Design Spec : Intégration de l'animation de phase (Figma Motion JSON)

## 1. Contexte & Objectif
Intégrer l'animation vectorielle/illustrée issue de Figma (`Anim-phase4`, node `2055:4749`) juste après la section "Votre phase du moment" sur l'écran d'accueil (`home`).
L'animation représente une surfeuse en équilibre sur une planche, entourée de 3 plans de vagues en translation continue, symbolisant la phase menstruelle (Phase 4).

L'architecture doit être modulaire afin de :
- Afficher cette animation pour la Phase 4 (`Phase4-Menstrual` et non-confirmée).
- Masquer l'animation proprement ou afficher le composant dédié pour les phases 1, 2 et 3 dès que leurs animations seront prêtes.
- S'exécuter avec une accélération GPU optimale (CSS `@keyframes`) sans surcharge de dépendance tierce.

---

## 2. Structure des Fichiers & Assets

### 2.1 Assets (`public/animation/`)
- `personnage4.png` : Illustration PNG transparente de la surfeuse (350x262.5px).
- `vague1.svg` : Calque de vague avant-plan (1438.75x286.6px).
- `vague2.svg` : Calque de vague plan intermédiaire (1438.75x286.6px).
- `vague3.svg` : Calque de vague arrière-plan (1438.75x286.6px).
- `anim-phase4.json` : Spécification brute des keyframes Figma Motion pour traçabilité et documentation.

### 2.2 Composants Code (`src/components/PhaseAnimation/`)
- `PhaseAnimationView.tsx` : Orchestrateur recevant `phase: CyclePhase` et rendant la vue de phase adéquate.
- `Phase4Animation.tsx` : Composant de rendu de la scène animée de la Phase 4.
- `Phase4Animation.module.css` : Styles de composition absolue et animations `@keyframes` fluides.
- `index.ts` : Export du composant principal.

---

## 3. Spécification des Keyframes & Animations (Phase 4)

Basé sur la timeline Figma Motion de 6000 ms (6s) en boucle infinie (`loop`) :

### 3.1 Dimensions & Cadrage
- **Scene Frame** : 393px × 309px (ratio standard Figma mobile), `overflow: hidden`, coins arrondis (24px) harmonisés avec le thème de l'application, fond dégradé subtil assorti à la palette de la phase 4.
- **Responsive** : Le conteneur s'adapte à la largeur du parent (`max-width: 100%`) tout en conservant son ratio grâce à une mise à l'échelle CSS ou conteneur fluide.

### 3.2 Calques & Translations
1. **Vague 3 (Arrière-plan)** :
   - `top: -2.51px`, hauteur `298.78px`, largeur `1438.75px`
   - Déplacement X : de `-1014.75px` à `-90.71px` sur 6.0s linéaire continu.
2. **Vague 2 (Plan intermédiaire)** :
   - `top: 77.75px`, hauteur `298.78px`, largeur `1438.75px`
   - Déplacement X : translation continue synchronisée avec la vague (vitesse adaptée créant un effet de parallaxe).
3. **Personnage 4 (Surfeuse)** :
   - Centrée horizontalement, dimension `350px × 262.5px`
   - Déplacement Y (houle) :
     - 0s : `translateY(0px)`
     - 1.37s : `translateY(-17.33px)` (sommet de vague)
     - 2.94s : `translateY(0px)` (creux de vague)
     - 4.55s : `translateY(-17.33px)`
     - 6.00s : `translateY(0px)`
   - Rotation (balancement de la planche) :
     - 0s : `rotate(0deg)`
     - 1.37s : `rotate(5deg)` (~0.087 rad)
     - 2.96s : `rotate(0deg)`
     - 4.53s : `rotate(5deg)`
     - 6.00s : `rotate(0deg)`
   - Easing : `cubic-bezier(0.42, 0, 0.58, 1)` (ease-in-out).
4. **Vague 1 (Premier plan)** :
   - `top: 178.08px`, hauteur `298.78px`, largeur `1438.75px`
   - Déplacement X : translation continue de `-925.47px` à `-88.99px` sur 6.0s.

---

## 4. Extensibilité (Phases 1, 2, 3)
Le composant `PhaseAnimationView.tsx` implémente un sélecteur :
```tsx
switch (phase) {
  case 'Phase1-Follicular':
    return null; // Prêt pour <Phase1Animation />
  case 'Phase2-Ovulation':
    return null; // Prêt pour <Phase2Animation />
  case 'Phase3-Luteal':
    return null; // Prêt pour <Phase3Animation />
  case 'Phase4-Menstrual':
  case 'Phase4-Menstrual-Unconfirmed':
    return <Phase4Animation />;
  default:
    return null;
}
```

---

## 5. Intégration dans `src/App.tsx`
Dans le conteneur principal `homeContainer` :
```tsx
{/* "Votre phase du moment" Card */}
<PhaseInsightsCard insight={todayInsight} />

{/* Animation visuelle de phase */}
<PhaseAnimationView phase={todayInsight.phaseKey} />
```

---

## 6. Vérification & Tests
- Vérification du build TypeScript (`npm run build`).
- Vérification visuelle sur différentes largeurs d'écran (responsive mobile).
- Vérification du comportement selon la phase active du cycle (affiché si phase 4, masqué proprement sinon).
