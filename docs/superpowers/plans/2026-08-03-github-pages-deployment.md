# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure `package.json`, `vite.config.ts`, and create a GitHub Actions workflow `.github/workflows/deploy.yml` to automatically build and deploy the Vite React PWA to GitHub Pages on push to `main` or manual trigger.

**Architecture:** Node 24 and pnpm 11.18.0 configured in `package.json`. Vite base path updated in `vite.config.ts`. GitHub Actions workflow configured using official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.

**Tech Stack:** GitHub Actions, pnpm, Node 24, Vite, React, TypeScript.

## Global Constraints

- Node version: `>=24`
- Package manager: `pnpm@11.18.0`
- Base URL: `/period-tracker/`
- Target directory: `./dist`

---

### Task 1: Update package.json and vite.config.ts

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: Existing `package.json` and `vite.config.ts`
- Produces: Updated `package.json` with `engines` & `packageManager`, `vite.config.ts` with `base: '/period-tracker/'`

- [ ] **Step 1: Add engines and packageManager to package.json**

Add `"engines": { "node": ">=24" }` and `"packageManager": "pnpm@11.18.0"` to [package.json](file:///Users/lauriane/Sites/period-tracker/package.json).

- [ ] **Step 2: Add base path to vite.config.ts**

Add `base: '/period-tracker/'` to the `defineConfig` object in [vite.config.ts](file:///Users/lauriane/Sites/period-tracker/vite.config.ts).

- [ ] **Step 3: Test local build with pnpm**

Run: `pnpm run build`
Expected: Build succeeds and generates output in `./dist`.

- [ ] **Step 4: Commit changes**

```bash
git add package.json vite.config.ts
git commit -m "build: configure engines, packageManager, and vite base path"
```

---

### Task 2: Create GitHub Actions Workflow file

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: Build output from `pnpm run build`
- Produces: `.github/workflows/deploy.yml` CI/CD configuration file

- [ ] **Step 1: Create .github/workflows/deploy.yml**

Write the following content to [deploy.yml](file:///Users/lauriane/Sites/period-tracker/.github/workflows/deploy.yml):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.18.0

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build project
        run: pnpm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit workflow file**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for GitHub Pages deployment"
```
