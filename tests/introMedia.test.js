import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Compressed Phase 4 intro media assets exist, are smaller than sources, and preserve APNG frames', () => {
  const animPath = path.resolve('public/intro/phase4-anim.png');
  const audioPath = path.resolve('public/intro/phase4-audio.m4a');

  assert.strictEqual(fs.existsSync(animPath), true, 'public/intro/phase4-anim.png must exist');
  assert.strictEqual(fs.existsSync(audioPath), true, 'public/intro/phase4-audio.m4a must exist');

  const animStat = fs.statSync(animPath);
  const audioStat = fs.statSync(audioPath);

  assert.ok(animStat.size > 10_000 && animStat.size < 600_000, `Expected anim size < 600KB, got ${animStat.size}`);
  assert.ok(audioStat.size > 5_000 && audioStat.size < 45_000, `Expected audio size < 45KB, got ${audioStat.size}`);

  const animBytes = fs.readFileSync(animPath);
  assert.ok(animBytes.includes(Buffer.from('acTL')), 'Compressed PNG must remain an animated PNG (acTL chunk present)');
  let fcTLCount = 0;
  let idx = 0;
  while ((idx = animBytes.indexOf(Buffer.from('fcTL'), idx)) !== -1) {
    fcTLCount++;
    idx += 4;
  }
  assert.strictEqual(fcTLCount, 16, 'Compressed APNG must preserve all 16 frames');
});

