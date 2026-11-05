import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const EXPECTED_PHASES = [
  { file: 'phase1-anim.png', source: 'phase1.png', frames: 16 },
  { file: 'phase2-anim.png', source: 'phase2.png', frames: 19 },
  { file: 'phase3-anim.png', source: 'phase3.png', frames: 16 },
  { file: 'phase4-anim.png', source: 'phase4.png', frames: 21 }
];

test('All 4 phase intro animations exist, are compressed, have num_plays=1 (no loop), and audio is removed', () => {
  const audioPath = path.resolve('public/intro/phase4-audio.m4a');
  assert.strictEqual(fs.existsSync(audioPath), false, 'phase4-audio.m4a must be removed');

  for (const { file, source, frames } of EXPECTED_PHASES) {
    const outPath = path.resolve('public/intro', file);
    const srcPath = path.resolve('Ressources', source);
    assert.strictEqual(fs.existsSync(outPath), true, `${file} must exist`);

    const outBytes = fs.readFileSync(outPath);
    const srcSize = fs.statSync(srcPath).size;

    assert.ok(outBytes.length <= srcSize && outBytes.length < 600_000, `${file} size (${outBytes.length}) must be <= source (${srcSize}) and < 600KB`);

    const acTLIndex = outBytes.indexOf(Buffer.from('acTL'));
    assert.ok(acTLIndex !== -1, `${file} must contain acTL chunk`);
    const numFrames = outBytes.readUInt32BE(acTLIndex + 4);
    const numPlays = outBytes.readUInt32BE(acTLIndex + 8);
    assert.strictEqual(numFrames, frames, `${file} must preserve ${frames} frames`);
    assert.strictEqual(numPlays, 1, `${file} must have num_plays = 1 (no loop)`);
  }
});
