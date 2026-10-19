import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Atoms exist and export Button and Badge', () => {
  assert.strictEqual(fs.existsSync(path.resolve('src/components/atoms/Button.tsx')), true, 'Button.tsx must exist');
  assert.strictEqual(fs.existsSync(path.resolve('src/components/atoms/Badge.tsx')), true, 'Badge.tsx must exist');
  assert.strictEqual(fs.existsSync(path.resolve('src/components/atoms/index.ts')), true, 'index.ts must exist');

  const buttonCode = fs.readFileSync(path.resolve('src/components/atoms/Button.tsx'), 'utf-8');
  assert.match(buttonCode, /variant.*primary.*secondary/s, 'Button should support primary and secondary variants');

  const badgeCode = fs.readFileSync(path.resolve('src/components/atoms/Badge.tsx'), 'utf-8');
  assert.match(badgeCode, /phase1.*phase2.*phase3/s, 'Badge should support phase variants');
});
