#!/usr/bin/env node
// Validate reference Flutter apps under references/.
// Zero dependencies (Node 18+).

import { promises as fs } from 'node:fs';
import path from 'node:path';

/** Apps required by README, AGENTS.md, CI, and evals. */
export const EXPECTED_REF_APPS = ['clean-bloc', 'mvvm-cubit'];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out.sort();
}

/**
 * Collect lint messages for reference apps under `root/references`.
 * Always requires EXPECTED_REF_APPS; when present, checks shared lib/core,
 * required project files, and forbidden secrets.
 */
export async function lintReferenceApps(root) {
  const messages = [];
  const ref = path.join(root, 'references');

  if (!await exists(ref)) {
    messages.push(
      `references/: missing (expected ${EXPECTED_REF_APPS.join(', ')})`,
    );
    return messages;
  }

  for (const app of EXPECTED_REF_APPS) {
    if (!await exists(path.join(ref, app))) {
      messages.push(`references/${app}: missing`);
    }
  }
  if (messages.length) return messages;

  const apps = (await fs.readdir(ref, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const coreOf = async (app) => {
    const dir = path.join(ref, app, 'lib/core');
    const map = new Map();
    if (!await exists(dir)) return map;
    for (const f of await walk(dir)) {
      const rel = path.relative(dir, f).split(path.sep).join('/');
      if (rel.startsWith('di/')) continue;
      map.set(rel, await fs.readFile(f, 'utf8'));
    }
    return map;
  };

  if (apps.length > 1) {
    const base = await coreOf(apps[0]);
    for (const app of apps.slice(1)) {
      const other = await coreOf(app);
      for (const rel of new Set([...base.keys(), ...other.keys()])) {
        if (base.get(rel) !== other.get(rel)) {
          messages.push(
            `references: lib/core/${rel} differs between ${apps[0]} and ${app}`,
          );
        }
      }
    }
  }

  for (const app of apps) {
    for (const required of ['.agent-team.yaml', 'docs/agent-context.md']) {
      if (!await exists(path.join(ref, app, required))) {
        messages.push(`references/${app}: missing ${required}`);
      }
    }
    for (const forbidden of ['lib/config/env/.env', 'lib/config/env/env.g.dart']) {
      if (await exists(path.join(ref, app, forbidden))) {
        messages.push(`references/${app}: ${forbidden} must not be committed`);
      }
    }
  }

  return messages;
}
