# Design Spec : Idées de recettes par phase et par saison

## 1. Contexte & Objectif
Inspirer l'utilisatrice dans la vue **Recommandations** ([`src/components/Recommendations/RecommendationsView.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/Recommendations/RecommendationsView.tsx)) en lui proposant **10 idées de recettes** adaptées à la fois :
- à la **phase du cycle sélectionnée** (Phase 1 : Folliculaire, Phase 2 : Ovulatoire, Phase 3 : Lutéale, Phase 4 : Menstruations),
- et à la **saison actuelle** (Printemps, Été, Automne, Hiver), détectée automatiquement selon la date du jour.

Le catalogue complet comporte **160 recettes** (4 saisons × 4 phases × 10 recettes) issues de `/Users/lauriane/Downloads/recettes.md`.

---

## 2. Objectifs, Non-Objectifs et Anti-Objectifs

### Objectifs (Goals)
1. **Structurer les 160 recettes** dans `src/data/recipesData.ts` par saison (`'spring' | 'summer' | 'autumn' | 'winter'`) et par phase (`1 | 2 | 3 | 4`), avec pour chaque recette :
   - `title` : intitulé nettoyé **sans** numérotation (`1. `, `2. `...), **sans** préfixe `Dessert : `, et **sans** suffixe `(V)`.
   - `url` : lien de recherche Google (`https://www.google.com/search?q=recette+...`) tel que défini dans `recettes.md`.
2. **Détecter automatiquement la saison** à partir de la date courante (`getSeasonForDate(date?: Date): Season`) selon les dates calendaires de l'hémisphère nord :
   - **Printemps (`'spring'`)** : du 20 mars au 20 juin inclus
   - **Été (`'summer'`)** : du 21 juin au 21 septembre inclus
   - **Automne (`'autumn'`)** : du 22 septembre au 20 décembre inclus
   - **Hiver (`'winter'`)** : du 21 décembre au 19 mars inclus
3. **Intégrer le bloc « Idées de recettes »** dans la section **Nutrition** de [`RecommendationsView.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/Recommendations/RecommendationsView.tsx#L201-L230), juste en dessous de la grille `.nutritionGrid` (3 cartes d'aliments), conformément aux maquettes Figma :
   - Mobile (`node-id=4330-5641`) : 1 colonne de 10 boutons secondaires pleine largeur (`gap: var(--spacing-sm)` / `8px`).
   - Desktop (`node-id=4330-5592`, `>= 992px`) : grille de 2 colonnes × 5 lignes (`grid-template-columns: repeat(2, minmax(0, 1fr))`, `gap: var(--spacing-sm)` / `8px`).
4. **Ouvrir la recette dans un nouvel onglet** au clic sur le composant existant `<Button variant="secondary" fullWidth>` (`window.open(recipe.url, '_blank', 'noopener,noreferrer')`).

### Non-Objectifs (Non-Goals)
- Ajouter un sélecteur manuel de saison dans l'interface (la détection est 100 % automatique).
- Créer des fiches recettes internes à l'application (chaque recette redirige vers sa recherche Google dans un nouvel onglet).

### Anti-Objectifs (Anti-Goals)
- **Aucune mention `(V)`, `Dessert :` ou numéro (`1.`, `2.`)** ne doit apparaître dans les titres affichés sur les boutons de recettes.
- **Ne pas recréer un composant de bouton ad-hoc** : réutiliser impérativement l'atome existant [`Button`](file:///Users/lauriane/Sites/period-tracker/src/components/atoms/Button.tsx) (`variant="secondary"`).
- **Aucune valeur CSS codée en dur** : toutes les règles CSS doivent utiliser exclusivement les design tokens de [`src/index.css`](file:///Users/lauriane/Sites/period-tracker/src/index.css) conformément à [`AGENTS.md`](file:///Users/lauriane/Sites/period-tracker/AGENTS.md).

---

## 3. Spécifications UI & Design Tokens (Figma `4330:5641` & `4330:5592`)

### 3.1 Sous-titre « Idées de recettes » (`.recipesTitle`)
- Balise : `<h3 className={styles.recipesTitle}>Idées de recettes</h3>`
- Typographie : `font-family: var(--font-family)`, `font-size: var(--typo-h3-size)` (`18px`), `font-weight: var(--typo-h3-weight)` (`700`), `color: var(--text-dark-primary)`.

### 3.2 Grille des recettes (`.recipesGrid`)
- Mobile (`< 992px`) :
  - `display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--spacing-sm); width: 100%;`
- Desktop (`>= 992px`) :
  - `grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-sm);`

### 3.3 Utilisation du composant existant `<Button variant="secondary">`
- Composant : `<Button variant="secondary" fullWidth className={styles.recipeButton} onClick={() => window.open(recipe.url, '_blank', 'noopener,noreferrer')}>` (importé depuis [`src/components/atoms`](file:///Users/lauriane/Sites/period-tracker/src/components/atoms/Button.tsx)).
- Dans [`Button.module.css`](file:///Users/lauriane/Sites/period-tracker/src/components/atoms/Button.module.css#L39-L52), la variante `.secondary` fournit déjà tous les tokens du design system (`background-color: var(--background-level-2)`, `border: 1px solid var(--border)`, `border-radius: var(--radius-sm)`, `padding: var(--spacing-lg)`, `gap: var(--spacing-sm)`, `font-size: var(--typo-body-default-bold-size)`, `font-weight: var(--typo-body-default-bold-weight)`). On ajuste `height: auto; min-height: 56px;` pour permettre aux titres sur 2 lignes de s'étirer proprement.
- Contenu enfant de `<Button variant="secondary">` :
  - `<span className={styles.recipeButtonLabel}>{recipe.title}</span>` (`flex: 1; text-align: left;`)
  - SVG chevron droite `20×20` (`stroke="currentColor"`, `flex-shrink: 0`), identique au chevron des cartes de menu de `RecommendationsView.tsx`.

---

## 4. Architecture & Fichiers Impactés

1. **`src/data/recipesData.ts` (Création)** :
   - Types : `Season = 'spring' | 'summer' | 'autumn' | 'winter'`, `PhaseId = 1 | 2 | 3 | 4`, `RecipeItem = { title: string; url: string }`.
   - Constante : `RECIPES_BY_SEASON_AND_PHASE: Record<Season, Record<PhaseId, RecipeItem[]>>` contenant les 160 recettes nettoyées.
   - Fonctions :
     - `getSeasonForDate(date: Date = new Date()): Season`
     - `getRecipesForPhase(phaseId: number, date: Date = new Date()): RecipeItem[]`
2. **`src/components/atoms/Button.module.css` (Modification légère)** :
   - Permettre à `.secondary` de grandir en hauteur (`height: auto; min-height: 56px;`) lorsque le libellé d'une recette passe sur deux lignes.
3. **`src/components/Recommendations/RecommendationsView.tsx` (Modification)** :
   - Import de `Button` depuis `../atoms` et `getRecipesForPhase` depuis `../../data/recipesData`.
   - Rendu du titre `<h3 className={styles.recipesTitle}>Idées de recettes</h3>` et de la grille `.recipesGrid` contenant les 10 `<Button variant="secondary" fullWidth>` dans la section Nutrition.
4. **`src/components/Recommendations/RecommendationsView.module.css` (Modification)** :
   - Ajout de `.recipesTitle`, `.recipesGrid`, `.recipeButton`, `.recipeButtonLabel` en utilisant uniquement les design tokens.
5. **`tests/recipes.test.js` (Création)** :
   - Vérification des 4 saisons × 4 phases × 10 recettes = 160 recettes, absence de `(V)`, `Dessert :` ou numérotation, détection des saisons aux dates limites, utilisation de `<Button` avec `variant="secondary"`, et respect des design tokens CSS.

