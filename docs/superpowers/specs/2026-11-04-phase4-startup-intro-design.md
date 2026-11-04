# Design Spec : Animation et musique d'introduction au démarrage (Phase 4)

## 1. Contexte & Objectif
Lors de l'ouverture de l'application (`period-tracker`), nous souhaitons accueillir l'utilisatrice avec une expérience sensorielle douce adaptée à sa phase actuelle : une **animation plein écran** accompagnée d'une **musique d'ouverture**, qui s'efface en fondu à la fin de l'animation pour révéler l'écran d'accueil.

Pour tester et valider cette fonctionnalité, ce périmètre se concentre exclusivement sur la **Phase 4 (Phase menstruelle — « Repos avant la prochaine vague »)**.

---

## 2. Objectifs, Non-Objectifs et Anti-Objectifs

### Objectifs (Goals)
1. **Compresser le PNG animé** ([`Ressources/anim-phase4.png`](file:///Users/lauriane/Sites/period-tracker/Ressources/anim-phase4.png), 1,5 Mo, 16 frames, 339×480 px, ~1,55 s/boucle) vers un fichier APNG optimisé dans `public/intro/phase4-anim.png` (réduction drastique du poids tout en préservant l'aspect aquarelle/crayonné et la transparence/fond).
2. **Compresser et normaliser l'audio** ([`Ressources/Ouverture — fin en douceur - usesuno.com.m4a`](file:///Users/lauriane/Sites/period-tracker/Ressources/Ouverture%20%E2%80%94%20fin%20en%20douceur%20-%20usesuno.com.m4a), 63 Ko, 3,00 s) vers `public/intro/phase4-audio.m4a` (AAC `.m4a` universellement compatible Safari/iOS/Chrome/Firefox, ≤ 60 Ko).
3. **Jouer l'intro plein écran immédiatement au démarrage** lorsque l'utilisatrice est onboardée (`settings.isOnboarded === true`) et se trouve en Phase 4 (`todayInsight.phaseKey === 'Phase4-Menstrual'`, couvrant `'Phase4-Menstrual'` et `'Phase4-Menstrual-Unconfirmed'`).
4. **Effacer l'écran d'intro en fondu** à la fin des 3 secondes (correspondant à la durée de l'audio et à 2 boucles de l'animation APNG de 1,55 s), puis démonter le composant du DOM.

### Non-Objectifs (Non-Goals)
- Implémenter les animations et musiques d'introduction pour les Phases 1, 2 et 3 (hors périmètre de ce test).
- Bloquer l'accès à l'application si le navigateur refuse l'autoplay audio : l'animation visuelle doit toujours se dérouler et se terminer normalement au bout de 3 secondes.

### Anti-Objectifs (Anti-Goals)
- **Aucun bouton son ou sas « Toucher pour entrer »** ne doit être affiché sur l'écran d'introduction (décision explicite : lancement immédiat sans bouton son).
- **Aucune valeur CSS codée en dur** pour les couleurs, espacements, rayons ou typographies : tout le CSS du composant d'introduction doit utiliser exclusivement les design tokens définis dans [`src/index.css`](file:///Users/lauriane/Sites/period-tracker/src/index.css) (conformément à [`AGENTS.md`](file:///Users/lauriane/Sites/period-tracker/AGENTS.md)).

---

## 3. Contraintes Techniques & Design Tokens
- **Règle absolue ([`AGENTS.md`](file:///Users/lauriane/Sites/period-tracker/AGENTS.md))** : *« Quand tu fais du CSS utilise toujours les design tokens. »*
  - Fond de l'overlay plein écran : `var(--background-level-1)` (qui vaut `#f8dbcc` sous `[data-theme="phase 4"]`) ou `var(--text-white)` pour le conteneur si nécessaire, espacements via `var(--spacing-*)`, rayons via `var(--radius-*)`.
- **Base URL Vite** : L'application est configurée avec `base: '/period-tracker/'` dans [`vite.config.ts`](file:///Users/lauriane/Sites/period-tracker/vite.config.ts). Les chemins vers `public/intro/` doivent utiliser `import.meta.env.BASE_URL` pour fonctionner aussi bien en local (`npm run dev`) qu'en production GitHub Pages (`npm run build`).
- **Politique Autoplay des navigateurs** :
  - Appel immédiat à `audio.play()` au montage du composant.
  - Si `audio.play()` rejette la promesse (`NotAllowedError`), l'erreur est interceptée silencieusement et un écouteur passif unique (`pointerdown` / `keydown` sur `window`) relance `audio.play()` si l'utilisatrice touche l'écran pendant les 3 secondes d'intro, sans afficher de bouton.

---

## 4. Architecture & Décisions d'Implémentation

### 4.1 Pipeline de compression des médias (`scripts/compress-intro-media.mjs` ou `.py` & `public/intro/`)
- **Image animée (`public/intro/phase4-anim.png`)** :
  - Source : `Ressources/anim-phase4.png` (1,5 Mo, 16 frames 339×480 RGBA).
  - Optimisation APNG sans perte visuelle notable : quantification douce des bits de bruit sur les aplats + filtre PNG Sub et recompression `zlib` niveau 9, réduisant le poids d'environ 65 % (< 600 Ko) tout en restant un fichier APNG standard lisible dans une simple balise `<img>`.
- **Audio (`public/intro/phase4-audio.m4a`)** :
  - Source : `Ressources/Ouverture — fin en douceur - usesuno.com.m4a` (63 Ko, Opus dans conteneur MP4, 3,00 s).
  - Conversion et compression en deux étapes natives macOS (`avconvert --preset PresetAppleM4A` puis `afconvert -f m4af -d aach -b 48000`) vers `public/intro/phase4-audio.m4a` (~22 Ko, réduction de ~65 %) pour assurer le décodage matériel natif sur tous les moteurs (WebKit/Safari iOS, Blink, Gecko).

### 4.2 Composant `PhaseIntroOverlay` (`src/components/PhaseIntroOverlay/`)
- **`PhaseIntroOverlay.tsx`** :
  - Props :
    - `phase: CyclePhase` (ou `phaseKey: CyclePhase`)
    - `onComplete?: () => void`
    - `durationMs?: number` (par défaut `3000` ms pour l'affichage actif + `500` ms de fondu de sortie)
  - États internes :
    - `isFadingOut: boolean` (passe à `true` à `durationMs`, déclenchant la transition CSS `opacity: 0`)
    - `isVisible: boolean` (passe à `false` à `durationMs + 500` ms, démontant complètement l'overlay et arrêtant l'audio)
  - Rendu uniquement si la phase correspond à la Phase 4 (`phase === 'Phase4-Menstrual' || phase === 'Phase4-Menstrual-Unconfirmed'`).
- **`PhaseIntroOverlay.module.css`** :
  - `.overlay` : `position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background-color: var(--background-level-1); padding: var(--spacing-xl); transition: opacity 0.5s ease; pointer-events: all;`
  - `.fadeOut` : `opacity: 0; pointer-events: none;`
  - `.mediaCard` : centrage de l'illustration animée (`max-width: 100%; height: auto; border-radius: var(--radius-md);`).

### 4.3 Intégration dans [`src/App.tsx`](file:///Users/lauriane/Sites/period-tracker/src/App.tsx)
- S'assurer que l'attribut `data-theme="phase 4"` est appliqué sur `document.documentElement` dès le premier rendu lorsque `settings.isOnboarded` est vrai, afin que `var(--background-level-1)` ait immédiatement la teinte Phase 4 (`#f8dbcc`).
- Monter `<PhaseIntroOverlay phase={todayInsight.phaseKey} />` au sein du layout principal dans `App.tsx` (uniquement quand `settings.isOnboarded && !isEditingSettings`).

### 4.4 Ce qui est laissé à l'implémenteur
- Le choix exact du seuil de quantification APNG dans le script de compression tant que le fichier généré dans `public/intro/phase4-anim.png` conserve ses 16 frames `fcTL` et pèse moins de 500 Ko.
- Le nettoyage propre des `setTimeout` et de l'instance `HTMLAudioElement` au démontage du composant React.
