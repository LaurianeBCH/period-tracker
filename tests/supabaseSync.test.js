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
