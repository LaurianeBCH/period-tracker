import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Tokens in src/index.css match V3 specifications', () => {
  const css = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');

  // Verify core V3 tokens are present
  assert.match(css, /--text-dark-primary:\s*#002e2c/i);
  assert.match(css, /--background-level-1:\s*#d2fccf/i);
  assert.match(css, /--background-level-2:\s*#9ce2c0/i);
  assert.match(css, /--background-level-3:\s*#4bbca4/i);
  assert.match(css, /--border:\s*#5ec3a3/i);
  assert.match(css, /--accent:\s*#fbff24/i);
  assert.match(css, /--text-dark-secondary:\s*#137051/i);
  assert.match(css, /--text-white:\s*#ffffff/i);

  // Verify multi-mode theme selectors
  assert.match(css, /\[data-theme="phase 2"\]/);
  assert.match(css, /\[data-theme="phase 3"\]/);
  assert.match(css, /\[data-theme="phase 4"\]|\[data-theme="phase4"\]/);
  assert.match(css, /\[data-theme="neutre"\]/);
});
