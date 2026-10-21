# Spécification Technique : Plugin Figma Optimizer

- **Date** : 2026-10-16
- **Auteur** : Antigravity (Pair Programming) & Lauriane
- **Statut** : En attente de validation

---

## 1. Contexte & Objectif

L'objectif de ce plugin Figma est de préparer et d'assainir localement les maquettes de design avant leur intégration par un LLM ou des développeurs frontend.

Le plugin automatise 3 étapes fondamentales en local, avec une option de déverrouillage préalable des composants :
0. **Pré-traitement** : Option pour libérer (détacher) récursivement toutes les instances de composants afin de lever les restrictions d'édition de l'arbre Figma.
1. **Nettoyage structurel** : Suppression des calques inutiles, masqués, ou sans valeur de rendu.
2. **Normalisation vers les Variables (Design Tokens)** : Association des couleurs, espacements, arrondis et tailles aux variables Figma existantes (avec auto-match pour les valeurs proches) ou dialogue interactif pour créer/associer les valeurs orphelines.
3. **Normalisation Typographique** : Vérification et attribution des Text Styles locaux et liaison des couleurs de texte aux variables correspondantes.

---

## 2. Architecture du Projet

Le plugin sera structuré dans un dossier autonome `figma-optimizer-plugin/` à la racine :

```
figma-optimizer-plugin/
├── manifest.json              # Déclaration du plugin Figma
├── package.json               # Scripts de build (esbuild) et dépendances typages
├── tsconfig.json              # Configuration TypeScript pour l'environnement Figma
├── build.js                   # Script de packaging rapide esbuild
├── src/
│   ├── code.ts                # Point d'entrée Sandbox Figma (figma.runtime)
│   ├── types.ts               # Types partagés (messages, configurations, métriques)
│   ├── clean.ts               # Logique de l'Étape 1 (nettoyage de l'arbre)
│   ├── variables.ts           # Logique de l'Étape 2 (scan, Delta E CIELAB, auto-match, binding)
│   ├── typography.ts          # Logique de l'Étape 3 (loadFontAsync, text styles, color binding)
│   ├── color-utils.ts         # Fonctions mathématiques RGB -> Lab et calcul Delta E
│   └── ui.html                # Interface utilisateur (Figma Plugin UI Iframe)
└── dist/
    ├── code.js                # Bundle compilé pour le sandbox Figma
    └── ui.html                # Interface bundlee prête pour figma.showUI
```

---

## 3. Spécifications Détaillées des Fonctionnalités

### 3.0 Option Préalable : Détachement des Instances
- **Paramètre UI** : Case à cocher `[x] Détacher toutes les instances` (activée par défaut).
- **Implémentation** : 
  - Si activé, avant toute suppression ou modification, le plugin parcourt les nœuds sélectionnés et appelle récursivement `instanceNode.detachInstance()` pour convertir toutes les instances en `FrameNode`.
  - Permet d'éviter les erreurs Figma `Cannot remove node inside an instance`.

### 3.1 Étape 1 : Nettoyage de la Structure
- **Critères de suppression** :
  - Nœud masqué : `node.visible === false`.
  - Calque de groupe ou cadre vide : Nœud de type `GROUP` ou `FRAME` sans enfants (`children.length === 0`), sans fond (`fills.length === 0`), sans contour (`strokes.length === 0`) et sans effet.
  - Vecteurs ou rectangles dégénérés : dimensions nulles (`width <= 0` ou `height <= 0`) et invisibles.
- **Ordre de parcours** : Post-order traversal (des enfants vers les parents) pour nettoyer les conteneurs devenus vides après la suppression de leurs enfants.
- **Indexation** : Comptage du nombre d'éléments supprimés par écran (top-level frame).

### 3.2 Étape 2 : Normalisation vers les Variables (Tokens)
- **Propriétés scannées** :
  - Remplissages et contours (`fills`, `strokes` de type `SOLID`).
  - Espacements Auto Layout (`itemSpacing`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`).
  - Arrondis de bordures (`cornerRadius`).
  - Dimensions explicites fixes (`width`, `height` si fixé).
- **Algorithme d'appariement** :
  - **Couleurs** : Conversion RGB $\rightarrow$ XYZ $\rightarrow$ CIELAB. Calcul de distance $\Delta E$.
    - *Auto-match* : Si $\Delta E \le 2.0$, la variable la plus proche est automatiquement liée (`setBoundVariableForPaint`).
  - **Valeurs numériques** : Distance absolue $|V_{\text{noeud}} - V_{\text{token}}|$.
    - *Auto-match* : Si écart $\le 1\text{px}$, la variable la plus proche est automatiquement liée.
  - **Cas des valeurs orphelines (hors seuil)** :
    - Le plugin suspend l'étape automatique et transmet via `figma.ui.postMessage` la liste des valeurs inconnues à l'UI.
    - L'utilisateur dispose pour chaque valeur d'un sélecteur :
      1. Associer manuellement à une variable existante (liste déroulante).
      2. Créer une nouvelle variable dans la collection cible (nom proposé automatiquement ex: `color-custom-1`, `space-14`).
- **Indexation** : Nombre de variables appliquées automatiquement, manuellement, et créées.

### 3.3 Étape 3 : Normalisation Typographique
- **Chargement asynchrone** :
  - Avant toute inspection/modification de texte, appel `await figma.loadFontAsync(node.fontName)`.
  - Gestion des cas `figma.mixed` (chargement de chaque police du range textuel).
- **Appariement de Text Style** :
  - Récupération des styles du fichier via `figma.getLocalTextStyles()`.
  - Si un calque a des propriétés de texte brutes : recherche du style ayant la même `fontSize`, `fontWeight` / `fontFamily` et `lineHeight`.
  - Assignation via `node.textStyleId = matchedStyle.id`.
- **Liaison de la couleur de texte** :
  - La couleur du texte (`fills`) est traitée avec le même algorithme que l'étape 2 pour être liée à une variable de couleur.
- **Indexation** : Nombre de styles de texte appliqués et couleurs de texte liées.

### 3.4 Interface Utilisateur (UI) & Retours
- Fenêtre modale Figma (dimensions : 400x520px).
- Sélecteur de collection de variables cible.
- Case à cocher "Détacher toutes les instances".
- Écran de résolution interactive pour les variables non trouvées.
- Compteurs en temps réel affichés par écran dans l'UI.
- Toast natif Figma via `figma.notify("✅ Optimisation terminée !")`.

---

## 4. Gestion des Erreurs et Robustesse
- **Polices manquantes** : Si `loadFontAsync` échoue car une police système n'est pas installée, le plugin consigne l'élément sans bloquer le reste du document.
- **Calques verrouillés** : Les calques verrouillés (`locked === true`) sont soit déverrouillés temporairement après consentement, soit ignorés avec notification.
- **Annulation (Undo)** : Toutes les opérations sont encapsulées dans la même transaction d'édition Figma pour permettre un simple `Cmd+Z` (Undo global) en cas d'erreur.

---

## 5. Critères d'Acceptation
1. Le plugin se charge sans avertissement ni erreur dans Figma Desktop (*Plugins > Development*).
2. L'option "Détacher les instances" convertit proprement les instances pour autoriser le nettoyage en profondeur.
3. Les calques masqués et vides sont supprimés.
4. Les couleurs et espacements proches sont automatiquement reliés aux variables Figma.
5. Les valeurs non trouvées demandent confirmation pour créer ou mapper manuellement.
6. Les styles de texte locaux sont appliqués et les polices sont chargées sans bloquer Figma.
7. Les métriques écran par écran sont présentées clairement dans la fenêtre du plugin.
