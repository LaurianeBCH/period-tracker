# Spécification Technique : Déploiement Automatisé GitHub Pages via GitHub Actions

## Contexte et Objectifs
Mettre en place un workflow d'intégration et déploiement continus (CI/CD) sur GitHub Actions pour builder et déployer automatiquement l'application PWA Vite/React sur GitHub Pages lors d'un push sur la branche `main` ou lors d'un déclenchement manuel (`workflow_dispatch`).

## Choix Techniques
- **Gestionnaire de paquets** : `pnpm` (avec `pnpm/action-setup@v4`)
- **Version de Node.js** : `24` (avec `actions/setup-node@v4` et cache `pnpm`)
- **Système de Build** : `pnpm run build` (générant `./dist`)
- **Déploiement GitHub Pages** : Actions officielles `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`

## Fichiers à Modifier / Créer

### 1. [MODIFY] [package.json](file:///Users/lauriane/Sites/period-tracker/package.json)
Ajouter les champs suivants :
- `"engines": { "node": ">=24" }`
- `"packageManager": "pnpm@11.18.0"`

### 2. [MODIFY] [vite.config.ts](file:///Users/lauriane/Sites/period-tracker/vite.config.ts)
Ajouter la propriété `base: '/period-tracker/'` pour que les assets soient correctement résolus sur `https://LaurianeBCH.github.io/period-tracker/`.

### 3. [NEW] [.github/workflows/deploy.yml](file:///Users/lauriane/Sites/period-tracker/.github/workflows/deploy.yml)
Créer le fichier de workflow GitHub Actions configuré avec :
- Événements : `push` sur `main` et `workflow_dispatch`
- Permissions : `contents: read`, `pages: write`, `id-token: write`
- Étapes : Checkout -> Setup pnpm -> Setup Node 24 -> `pnpm install` -> `pnpm run build` -> Upload Artifact (`./dist`) -> Deploy Pages.

## Plan de Vérification
1. Valider la syntaxe JSON de `package.json`.
2. Valider la syntaxe YAML du fichier de workflow.
3. Exécuter la commande de build localement (`pnpm run build`) pour s'assurer qu'il n'y a pas d'erreur de compilation TypeScript/Vite.
