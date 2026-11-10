import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Task 1: SQL schema, storage clearAllStorage, and syncService merge/magic-link logic', async () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  assert.ok(fs.existsSync(schemaPath), 'supabase/schema.sql must exist');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  assert.match(schemaSql, /user_cycle_data/i, 'schema.sql must define user_cycle_data table');
  assert.match(schemaSql, /ENABLE ROW LEVEL SECURITY/i, 'schema.sql must enable RLS');
  assert.match(schemaSql, /delete_user_account/i, 'schema.sql must define delete_user_account RPC');

  const envExamplePath = path.join(rootDir, '.env.example');
  assert.ok(fs.existsSync(envExamplePath), '.env.example must exist');
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  assert.match(envExample, /VITE_SUPABASE_URL=/, '.env.example must document VITE_SUPABASE_URL');
  assert.match(envExample, /VITE_SUPABASE_ANON_KEY=/, '.env.example must document VITE_SUPABASE_ANON_KEY');

  const storageCode = fs.readFileSync(path.join(rootDir, 'src', 'services', 'storage.ts'), 'utf8');
  assert.match(storageCode, /export function clearAllStorage\s*\(/, 'storage.ts must export clearAllStorage()');

  const { mergeCycleData, sendMagicLink } = await import('../src/services/syncService.ts');

  // Test mergeCycleData with existing cloud data and empty local cache (e.g. after clearing browser cache)
  const localEmptySettings = {
    defaultCycleLength: 28,
    defaultPeriodLength: 4,
    lutealPhaseLength: 14,
    isOnboarded: false
  };
  const cloudPayload = {
    settings: {
      defaultCycleLength: 30,
      defaultPeriodLength: 5,
      lutealPhaseLength: 14,
      isOnboarded: true
    },
    period_dates: ['2026-09-01', '2026-09-02', '2026-10-01']
  };
  const mergedFromCloud = mergeCycleData(localEmptySettings, ['2026-10-01', '2026-10-02'], cloudPayload);
  assert.equal(mergedFromCloud.settings.isOnboarded, true, 'Merged settings must keep isOnboarded: true');
  assert.equal(mergedFromCloud.settings.defaultCycleLength, 30);
  assert.deepEqual(mergedFromCloud.periodDates, [
    '2026-09-01',
    '2026-09-02',
    '2026-10-01',
    '2026-10-02'
  ]);

  // Test mergeCycleData when cloudPayload is null (first account creation from local data)
  const mergedFromLocal = mergeCycleData(
    { ...localEmptySettings, isOnboarded: true },
    ['2026-10-05', '2026-10-04'],
    null
  );
  assert.equal(mergedFromLocal.settings.isOnboarded, true);
  assert.deepEqual(mergedFromLocal.periodDates, ['2026-10-04', '2026-10-05']);

  // Test sendMagicLink rejects empty email
  const emptyRes = await sendMagicLink('   ');
  assert.ok(emptyRes.error, 'sendMagicLink must return an error on empty email');
});

test('Task 2: NavigationHeader removes Settings button and MyCycleView renders Mon cycle + 2-state Sync card with Design Tokens', () => {
  const headerCode = fs.readFileSync(
    path.join(rootDir, 'src', 'components', 'organisms', 'NavigationHeader.tsx'),
    'utf8'
  );
  assert.doesNotMatch(headerCode, /aria-label="Paramètres"/, 'NavigationHeader must not render the Paramètres button');

  const appCode = fs.readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8');
  assert.doesNotMatch(appCode, /isEditingSettings/, 'App.tsx must not use isEditingSettings to reopen OnboardingWizard');
  assert.match(appCode, /pullAndMergeCloudData/, 'App.tsx must sync with Supabase on session');
  assert.match(appCode, /pushCloudData/, 'App.tsx must push data changes to Supabase');

  const cycleViewCode = fs.readFileSync(
    path.join(rootDir, 'src', 'components', 'MyCycle', 'MyCycleView.tsx'),
    'utf8'
  );
  assert.match(cycleViewCode, /<h1[^>]*>[\s\S]*?Mon cycle[\s\S]*?<\/h1>/, 'MyCycleView must render <h1>Mon cycle</h1>');
  assert.match(cycleViewCode, /Synchroniser vos données/, 'MyCycleView must render unsynced title');
  assert.match(
    cycleViewCode,
    /Vos données sont actuellement enregistrées? dans le cache de votre navigateur\. Vous pouvez saisir une adresse email pour synchroniser vos données en ligne\./,
    'MyCycleView must render unsynced description'
  );
  assert.match(cycleViewCode, /Saisir une adresse email/, 'MyCycleView must render email label');
  assert.match(cycleViewCode, /placeholder="contact@gmail\.com"/, 'MyCycleView must render contact@gmail.com placeholder');
  assert.match(cycleViewCode, /Valider/, 'MyCycleView must render Valider button');
  assert.doesNotMatch(cycleViewCode, /Créer un compte/, 'MyCycleView must not render Créer un compte button');
  assert.match(cycleViewCode, /Données synchronisées/, 'MyCycleView must render synced title');
  assert.match(cycleViewCode, /Supprimer mon compte/, 'MyCycleView must render Supprimer mon compte button');
  assert.match(cycleViewCode, /Se déconnecter/, 'MyCycleView must render Se déconnecter button');
  assert.match(cycleViewCode, /<Button[\s\S]*?variant="primary"/, 'MyCycleView must use Button primary variant');
  assert.match(cycleViewCode, /<Button[\s\S]*?variant="secondary"/, 'MyCycleView must use Button secondary variant');

  const cycleCss = fs.readFileSync(
    path.join(rootDir, 'src', 'components', 'MyCycle', 'MyCycleView.module.css'),
    'utf8'
  );
  assert.match(cycleCss, /\.pageTitle/, 'MyCycleView.module.css must define .pageTitle');
  assert.match(cycleCss, /\.rightColumn/, 'MyCycleView.module.css must define .rightColumn');
  assert.match(cycleCss, /\.syncCard/, 'MyCycleView.module.css must define .syncCard');
  assert.match(cycleCss, /\.syncInput/, 'MyCycleView.module.css must define .syncInput');
  assert.doesNotMatch(
    cycleCss,
    /#[0-9a-fA-F]{3,8}|rgba?\(/,
    'MyCycleView.module.css must strictly use design tokens without hardcoded colors (AGENTS.md)'
  );
});

test('Neutral mode engine status, PWA manifest link scope, and getAuthRedirectUrl', async () => {
  const { getDayStatus } = await import('../src/utils/cycleEngine.ts');
  const { DEFAULT_SETTINGS } = await import('../src/services/storage.ts');
  const { getAuthRedirectUrl } = await import('../src/services/syncService.ts');

  const neutralToday = getDayStatus('2026-08-05', DEFAULT_SETTINGS, [], '2026-08-05');
  assert.equal(neutralToday.phase, 'Neutral', 'Empty periodDates must return Neutral phase');
  assert.equal(neutralToday.isToday, true, 'Today must still be marked isToday: true in Neutral mode');
  assert.equal(neutralToday.isPredictedPeriod, false, 'Neutral mode must not predict unconfirmed period');
  assert.equal(neutralToday.isActualPeriod, false);

  assert.equal(
    getAuthRedirectUrl('https://example.com', '/period-tracker/'),
    'https://example.com/period-tracker/'
  );

  const viteConfig = fs.readFileSync(path.join(rootDir, 'vite.config.ts'), 'utf8');
  assert.match(viteConfig, /start_url:\s*['"]\/period-tracker\/['"]/, 'Manifest must set start_url to /period-tracker/');
  assert.match(viteConfig, /scope:\s*['"]\/period-tracker\/['"]/, 'Manifest must set scope to /period-tracker/');
  assert.match(viteConfig, /handle_links:\s*['"]preferred['"]/, 'Manifest must set handle_links: preferred');
  assert.match(viteConfig, /launch_handler/, 'Manifest must configure launch_handler');
});


