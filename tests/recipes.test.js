import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('recipesData.ts contains 160 cleaned recipes (4 seasons x 4 phases x 10) and accurate season detection', () => {
  const dataPath = path.resolve('src/data/recipesData.ts');
  assert.strictEqual(fs.existsSync(dataPath), true, 'src/data/recipesData.ts must exist');

  const content = fs.readFileSync(dataPath, 'utf-8');
  assert.match(content, /export function getSeasonForDate/, 'Must export getSeasonForDate');
  assert.match(content, /export function getRecipesForPhase/, 'Must export getRecipesForPhase');

  // Verify no (V), Dessert :, or numbered prefixes exist in any title literal
  const titleMatches = [...content.matchAll(/title:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.strictEqual(titleMatches.length, 160, `Expected exactly 160 recipe titles, got ${titleMatches.length}`);

  for (const title of titleMatches) {
    assert.doesNotMatch(title, /\(V\)/i, `Title must not contain (V): ${title}`);
    assert.doesNotMatch(title, /^Dessert\s*:/i, `Title must not contain "Dessert :": ${title}`);
    assert.doesNotMatch(title, /^\d+\./, `Title must not start with numbering: ${title}`);
  }

  const urlMatches = [...content.matchAll(/url:\s*"(https:\/\/www\.google\.com\/search\?q=recette\+[^"]+)"/g)];
  assert.strictEqual(urlMatches.length, 160, `Expected 160 Google search recipe URLs, got ${urlMatches.length}`);
});

test('RecommendationsView renders Idées de recettes using the Button atom (secondary variant) and design tokens', () => {
  const viewCode = fs.readFileSync(path.resolve('src/components/Recommendations/RecommendationsView.tsx'), 'utf-8');
  const cssCode = fs.readFileSync(path.resolve('src/components/Recommendations/RecommendationsView.module.css'), 'utf-8');

  assert.match(viewCode, /import\s+\{[^}]*Button[^}]*\}\s+from\s+['"]\.\.\/atoms['"]/, 'Must import Button atom from ../atoms');
  assert.match(viewCode, /getRecipesForPhase/, 'Must call getRecipesForPhase');
  assert.match(viewCode, /Idées de recettes/, 'Must render heading "Idées de recettes"');
  assert.match(viewCode, /<Button[\s\S]*?variant="secondary"/, 'Must use <Button variant="secondary">');
  assert.match(viewCode, /window\.open\([^,]+,\s*['"]_blank['"],\s*['"]noopener,noreferrer['"]\)/, 'Must open recipe URL in a new tab');

  assert.match(cssCode, /\.recipesGrid/, 'CSS must define .recipesGrid');
  assert.match(cssCode, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/, 'Desktop recipesGrid must have 2 columns');
  const recipesCssBlock = cssCode.slice(cssCode.indexOf('.recipesTitle'));
  assert.doesNotMatch(recipesCssBlock, /#[0-9a-fA-F]{3,8}|rgba?\(/, 'New recipe CSS rules must only use design tokens (AGENTS.md)');
});

