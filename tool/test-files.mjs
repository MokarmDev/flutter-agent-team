#!/usr/bin/env node
// Discover Node test files without shell glob expansion (Windows-safe).
// Zero dependencies (Node 18+).

import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const TEST_FILE = /\.test\.mjs$/;

/**
 * Return absolute paths of `*.test.mjs` files directly under `dir`, sorted.
 * Non-directories and missing paths yield []. Nested directories are ignored.
 */
export function discoverTestFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const out = [];
  for (const name of entries) {
    if (!TEST_FILE.test(name)) continue;
    const full = path.resolve(dir, name);
    try {
      if (!statSync(full).isFile()) continue;
    } catch {
      continue;
    }
    out.push(full);
  }
  return out.sort();
}
