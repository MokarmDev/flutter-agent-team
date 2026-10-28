import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverTestFiles } from '../test-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RUNNER = path.join(ROOT, 'tool', 'run-tests.mjs');

function tempDir() {
  return mkdtempSync(path.join(tmpdir(), 'fat-tests-'));
}

test('discoverTestFiles finds only *.test.mjs files, sorted', () => {
  const dir = tempDir();
  try {
    writeFileSync(path.join(dir, 'b.test.mjs'), '');
    writeFileSync(path.join(dir, 'a.test.mjs'), '');
    writeFileSync(path.join(dir, 'notes.md'), '');
    writeFileSync(path.join(dir, 'other.mjs'), '');
    mkdirSync(path.join(dir, 'nested.test.mjs')); // directory, not a file
    const found = discoverTestFiles(dir).map((f) => path.basename(f));
    assert.deepEqual(found, ['a.test.mjs', 'b.test.mjs']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('discoverTestFiles returns [] for missing or empty dirs', () => {
  assert.deepEqual(discoverTestFiles(path.join(tmpdir(), 'fat-no-such-dir-' + process.pid)), []);
  const dir = tempDir();
  try {
    writeFileSync(path.join(dir, 'readme.txt'), 'x');
    assert.deepEqual(discoverTestFiles(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('runner exits 1 when no *.test.mjs files exist', () => {
  const dir = tempDir();
  try {
    writeFileSync(path.join(dir, 'not-a-test.mjs'), 'export {};\n');
    const r = spawnSync(process.execPath, [RUNNER], {
      encoding: 'utf8',
      env: { ...process.env, FAT_TEST_DIR: dir },
    });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /No test files matching \*\.test\.mjs/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('runner exits non-zero when a discovered test fails', () => {
  const dir = tempDir();
  try {
    writeFileSync(
      path.join(dir, 'failing.test.mjs'),
      "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\ntest('fails', () => assert.equal(1, 2));\n",
    );
    const r = spawnSync(process.execPath, [RUNNER], {
      encoding: 'utf8',
      env: { ...process.env, FAT_TEST_DIR: dir },
    });
    assert.notEqual(r.status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('runner runs every newly added *.test.mjs without path edits', () => {
  const dir = tempDir();
  try {
    writeFileSync(
      path.join(dir, 'one.test.mjs'),
      "import { test } from 'node:test';\ntest('one', () => {});\n",
    );
    writeFileSync(
      path.join(dir, 'two.test.mjs'),
      "import { test } from 'node:test';\ntest('two', () => {});\n",
    );
    const r = spawnSync(process.execPath, [RUNNER], {
      encoding: 'utf8',
      env: { ...process.env, FAT_TEST_DIR: dir },
    });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /# tests 2/);
    assert.match(r.stdout, /# pass 2/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
