# Figma Optimizer Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un plugin Figma complet en TypeScript (compilé via esbuild) pour assainir les maquettes de design : détachement des instances, suppression des calques masqués/vides, normalisation vers les Variables (avec auto-match Delta E et résolution manuelle/création des valeurs manquantes), et normalisation des styles typographiques avec affichage des compteurs dans l'UI.

**Architecture:** Le plugin fonctionne en deux environnements complémentaires : un sandbox Figma (`src/code.ts`) manipulant l'arbre de nœuds et l'API `figma.*` (variables, typographies, calques), et une interface utilisateur iframe (`src/ui.html`) communiquant par messages pour permettre le paramétrage, l'arbitrage interactif des valeurs inconnues et la visualisation des compteurs.

**Tech Stack:** TypeScript, `@figma/plugin-typings`, `esbuild`, Node test runner / Vitest pour les fonctions mathématiques pures (Delta E).

**Spec:** `docs/superpowers/specs/2026-10-16-figma-optimizer-plugin-design.md`

## Global Constraints

- Exécution 100% locale sans API externe.
- Respect strict des types Figma et du cycle de vie asynchrone des polices (`loadFontAsync`).
- Les modifications de l'arbre doivent s'exécuter dans une transaction Undo unique (`Cmd+Z`).
- Tolérance d'auto-match : $\Delta E \le 2.0$ pour les couleurs, distance absolue $\le 1\text{px}$ pour les espacements et arrondis.

## Review Focus

1. **Instances de composants imbriquées** : s'assurer que le détachement récursif convertit correctement toutes les instances en frames avant le nettoyage.
2. **Textes avec polices manquantes ou styles mixtes (`figma.mixed`)** : éviter tout crash en entourant `loadFontAsync` d'un try/catch et en journalisant l'exception.
3. **Calques verrouillés (`locked === true`)** : gérer proprement l'accès aux nœuds sans exception Figma.
4. **Collections de variables vides** : guider l'utilisateur sans planter si aucune variable n'est définie dans le fichier.
5. **Couleurs transparentes ou gradients** : ne tenter le binding de variable que sur les `SOLID` fills/strokes compatibles.

---

### Task 1: Scaffolding du projet `figma-optimizer-plugin`

**Files:**
- Create: `figma-optimizer-plugin/package.json`
- Create: `figma-optimizer-plugin/tsconfig.json`
- Create: `figma-optimizer-plugin/manifest.json`
- Create: `figma-optimizer-plugin/build.js`
- Create: `figma-optimizer-plugin/src/types.ts`

**Interfaces:**
- Produces: Configuration du build et interfaces typées partagées (`OptimizationConfig`, `UIMessage`, `PluginMessage`, `UnresolvedValue`, `ScreenMetrics`).

- [ ] **Step 1: Créer le `package.json` et installer les dépendances nécessaires (`typescript`, `@figma/plugin-typings`, `esbuild`)**
- [ ] **Step 2: Configurer `tsconfig.json` adapté au runtime Figma (ES6/ES2020, module ESNext, types figma)**
- [ ] **Step 3: Créer `manifest.json` avec `api: "1.0.0"`, `editorType: ["figma"]`, `main: "dist/code.js"`, `ui: "dist/ui.html"`**
- [ ] **Step 4: Créer `build.js` pour bundler `src/code.ts` vers `dist/code.js` et copier `src/ui.html` vers `dist/ui.html`**
- [ ] **Step 5: Définir les interfaces dans `src/types.ts`**
- [ ] **Step 6: Tester le script de build pour valider la génération du répertoire `dist/`**

---

### Task 2: Module de calcul colorimétrique Delta E (`src/color-utils.ts`)

**Files:**
- Create: `figma-optimizer-plugin/src/color-utils.ts`
- Create: `figma-optimizer-plugin/tests/color-utils.test.ts`

**Interfaces:**
- Produces:
  - `rgbToLab(r: number, g: number, b: number): [number, number, number]` (avec $r,g,b \in [0, 1]$)
  - `deltaE(labA: [number, number, number], labB: [number, number, number]): number`
  - `findClosestColorVariable(color: RGB, variables: Variable[]): { variable: Variable; distance: number } | null`

- [ ] **Step 1: Écrire le test unitaire pour les conversions RGB -> Lab et le calcul Delta E**
- [ ] **Step 2: Vérifier l'échec initial du test**
- [ ] **Step 3: Implémenter les formules de conversion sRGB standard vers CIE XYZ puis CIELAB et la formule Delta E (CIE76)**
- [ ] **Step 4: Exécuter les tests unitaires et vérifier qu'ils passent (ex: même couleur = 0, blanc vs noir > 50, etc.)**

---

### Task 3: Étape 0 (Détachement) & Étape 1 (Nettoyage structurel) (`src/clean.ts`)

**Files:**
- Create: `figma-optimizer-plugin/src/clean.ts`

**Interfaces:**
- Produces:
  - `detachAllInstances(node: SceneNode): SceneNode`
  - `cleanNodeHierarchy(root: SceneNode): { removedCount: number }`

- [ ] **Step 1: Implémenter `detachAllInstances` avec parcours récursif descendant qui appelle `instance.detachInstance()`**
- [ ] **Step 2: Implémenter `cleanNodeHierarchy` avec parcours post-order (enfants d'abord) :**
  - Supprimer si `node.visible === false`.
  - Supprimer si conteneur vide sans fills, strokes, effects ni enfants.
  - Supprimer si géométrie dégénérée (largeur ou hauteur nulle sans enfants).
- [ ] **Step 3: Compter et retourner le nombre de calques supprimés**

---

### Task 4: Étape 2 (Normalisation vers les Variables) (`src/variables.ts`)

**Files:**
- Create: `figma-optimizer-plugin/src/variables.ts`

**Interfaces:**
- Consumes: `findClosestColorVariable` de `src/color-utils.ts`
- Produces:
  - `scanVariables(node: SceneNode, collectionId?: string): { autoBound: number; unresolved: UnresolvedValue[] }`
  - `applyVariableBinding(nodeId: string, property: string, variableId: string): void`
  - `createAndBindVariable(collectionId: string, name: string, type: 'COLOR' | 'FLOAT', value: any): Variable`

- [ ] **Step 1: Récupérer les variables disponibles via `figma.variables.getLocalVariables()` et filtrer par collection si spécifié**
- [ ] **Step 2: Implémenter le scan des fills/strokes (SOLID) avec calcul Delta E : liaison si $\le 2.0$, ajout aux `unresolved` sinon**
- [ ] **Step 3: Implémenter le scan des espacements (`itemSpacing`, paddings, `cornerRadius`) avec écart absolu : liaison si $\le 1\text{px}$, ajout aux `unresolved` sinon**
- [ ] **Step 4: Implémenter les fonctions d'assignation manuelle et de création dynamique de variables**

---

### Task 5: Étape 3 (Normalisation Typographique) (`src/typography.ts`)

**Files:**
- Create: `figma-optimizer-plugin/src/typography.ts`

**Interfaces:**
- Consumes: `findClosestColorVariable` de `src/color-utils.ts`
- Produces:
  - `normalizeTypography(node: SceneNode, colorVariables: Variable[]): Promise<{ stylesApplied: number; colorsBound: number; errors: string[] }>`

- [ ] **Step 1: Parcourir l'arbre pour trouver tous les nœuds `TEXT`**
- [ ] **Step 2: Charger les polices de manière asynchrone via `figma.loadFontAsync(node.fontName)` (avec bloc try/catch en cas de police manquante)**
- [ ] **Step 3: Comparer avec `figma.getLocalTextStyles()` et appliquer le style correspondant si absent (`node.textStyleId`)**
- [ ] **Step 4: Lier la couleur de remplissage du texte à la variable de couleur la plus proche**

---

### Task 6: Interface Utilisateur & Orchestration (`src/ui.html` & `src/code.ts`)

**Files:**
- Create: `figma-optimizer-plugin/src/ui.html`
- Create: `figma-optimizer-plugin/src/code.ts`

**Interfaces:**
- Communication UI <-> Sandbox Figma via `parent.postMessage` et `figma.ui.onmessage`.

- [ ] **Step 1: Rédiger l'interface `ui.html` avec design système Figma (options initiales, liste des résolutions interactives, compteurs finaux)**
- [ ] **Step 2: Câbler la réception des messages dans `src/code.ts` (`INIT`, `START_SCAN`, `RESOLVE_VALUE`, `CREATE_VARIABLE`, `CLOSE`)**
- [ ] **Step 3: Découper le traitement par écran (Top-level Frame) et remonter les métriques en temps réel à l'UI**
- [ ] **Step 4: Déclencher `figma.notify()` lors de l'achèvement**

---

### Task 7: Build, Packaging & Validation Finale

**Files:**
- Build outputs: `figma-optimizer-plugin/dist/code.js`, `figma-optimizer-plugin/dist/ui.html`

- [ ] **Step 1: Exécuter `node build.js` et vérifier l'absence d'erreurs de bundling**
- [ ] **Step 2: Vérifier la conformité du `manifest.json` et la présence de tous les assets requis**
- [ ] **Step 3: Rédiger un guide rapide d'importation dans Figma (`README.md` du plugin)**
