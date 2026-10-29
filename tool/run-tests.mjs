#!/usr/bin/env node
// Cross-platform test runner: finds tool/test/*.test.mjs via fs, then runs node --test.
// Avoids shell glob expansion so `npm test` works on Windows PowerShell/cmd.
// Zero dependencies (Node 18+).

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { discoverTestFiles } from './test-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultDir = path.join(ROOT, 'tool', 'test');
const testDir = process.env.FAT_TEST_DIR
  ? path.resolve(process.env.FAT_TEST_DIR)
  : defaultDir;

const files = discoverTestFiles(testDir);
if (files.length === 0) {
  console.error(
    `No test files matching *.test.mjs found in ${testDir}. ` +
      'Add a test file or fix FAT_TEST_DIR.',
  );
  process.exit(1);
}

// Isolate from a parent `node --test` process: inherited NODE_TEST_CONTEXT makes
// the child report via the parent and return status 0 even when tests fail.
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

// Pipe and forward so callers (including nested regression tests) see TAP output.
const result = spawnSync(process.execPath, ['--test', ...files], {
  encoding: 'utf8',
  env,
  maxBuffer: 16 * 1024 * 1024,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status === null ? 1 : result.status);
