# Design Spec : Animations d'introduction par phase (Phases 1 à 4, sans musique, sans boucle)

## 1. Contexte & Objectif
Afficher une **animation plein écran** correspondant à la **phase actuelle du cycle (Phases 1 à 4)** :
1. **Une seule fois au démarrage** de l'application (lorsque l'utilisatrice est onboardée).
2. **Une seule fois après toute déclaration de règles** (calendrier ou fin d'onboarding) qui **modifie la phase actuelle du jour** (`todayInsight.phaseKey`).
3. **Sans musique** (suppression complète de l'audio) et **sans boucle** (`num_plays = 1` dans le chunk `acTL` de chaque APNG + fondu de sortie dès la fin de l'unique lecture).

---

## 2. Médias Sources & Compression (`Ressources/` → `public/intro/`)

| Phase (`phaseKey`) | Fichier source (`Ressources/`) | Taille source | Frames (`fcTL`) | Durée 1 lecture (`num_plays=1`) | Cible (`public/intro/`) | Thème CSS (`data-theme`) |
|---|---|---|---|---|---|---|
| `Phase1-Follicular` | `Ressources/phase1.png` | 195 Ko | 16 | `1568 ms` (1,57 s) | `public/intro/phase1-anim.png` | `"phase 1"` |
| `Phase2-Ovulation` | `Ressources/phase2.png` | 946 Ko | 19 | `1786 ms` (1,79 s) | `public/intro/phase2-anim.png` | `"phase 2"` |
| `Phase3-Luteal` | `Ressources/phase3.png` | 1,53 Mo | 16 | `1552 ms` (1,55 s) | `public/intro/phase3-anim.png` | `"phase 3"` |
| `Phase4-Menstrual` | `Ressources/phase4.png` | 691 Ko | 21 | `1995 ms` (2,00 s) | `public/intro/phase4-anim.png` | `"phase 4"` |

### Traitement APNG (`scripts/compress-intro-media.py`)
- Pour chacune des 4 animations (`phase1.png` à `phase4.png`) :
  - Réécriture du chunk `acTL` avec **`num_plays = 1`** (au lieu de `0`), garantissant que le décodeur natif du navigateur ne joue l'animation **qu'une seule fois** et s'arrête sur la dernière frame sans jamais boucler.
  - Quantification douce des bits de bruit sur les aplats + filtre PNG Sub + compression `zlib` niveau 9 (uniquement si le fichier compressé est plus léger que l'original, sinon conservation des chunks compressés d'origine avec `acTL` modifié à `num_plays = 1`).
- Suppression de `public/intro/phase4-audio.m4a` et de tout traitement audio.

---

## 3. Comportement du Composant `PhaseIntroOverlay`

### 3.1 Configuration par phase (`PHASE_INTRO_CONFIG`)
- Normalisation de la phase : `'Phase4-Menstrual-Unconfirmed'` est traité comme `'Phase4-Menstrual'`, `'Default'` comme `'Phase1-Follicular'`.
- Chaque phase possède :
  - `animFile`: `'phase1-anim.png'` | `'phase2-anim.png'` | `'phase3-anim.png'` | `'phase4-anim.png'`
  - `durationMs`: durée exacte d'une seule lecture (`1568`, `1786`, `1552`, `1995` ms)
  - `theme`: `'phase 1'` | `'phase 2'` | `'phase 3'` | `'phase 4'`

### 3.2 Déclenchement (Démarrage + Changement de phase actuelle)
- **Au démarrage** : Lorsque `PhaseIntroOverlay` est monté avec la phase actuelle (`phase`), l'overlay s'affiche immédiatement, joue l'animation correspondante une seule fois pendant `config.durationMs`, déclenche son fondu de sortie (`opacity: 0` sur `500 ms`), puis se masque (`isVisible = false`).
- **Lors d'une déclaration changeant la phase actuelle** :
  - `PhaseIntroOverlay` mémorise la dernière phase jouée dans `lastPlayedPhaseRef`.
  - Si la prop `phase` change (suite à une déclaration ou modification de dates de règles dans le calendrier) et que la nouvelle phase normalisée est différente de `lastPlayedPhaseRef.current`, l'overlay se réaffiche immédiatement avec le thème et l'animation de la nouvelle phase, incrémente un compteur d'exécution (`runId`) passé en paramètre de requête (`?run=${runId}`) à l'attribut `src` de `<img>` (pour forcer le navigateur à rejouer l'APNG `num_plays=1` depuis la frame 0), puis s'efface en fondu à la fin de sa durée.
  - Si une déclaration de date ne change pas la phase actuelle du jour (`normalizedPhase === lastPlayedPhaseRef.current`), l'animation ne se relance pas.

### 3.3 Contraintes CSS & Design Tokens ([`AGENTS.md`](file:///Users/lauriane/Sites/period-tracker/AGENTS.md))
- Règle stricte : **utiliser uniquement les design tokens** de [`src/index.css`](file:///Users/lauriane/Sites/period-tracker/src/index.css) (`var(--background-level-1)`, `var(--spacing-xl)`, `var(--radius-md)`).
- Le conteneur `.overlay` porte l'attribut `data-theme={config.theme}` afin que `var(--background-level-1)` prenne instantanément la couleur de fond de la phase active (Phase 1 : `#d2fccf`, Phase 2 : `#f7efb6`, Phase 3 : `#daedf2`, Phase 4 : `#f8dbcc`).

