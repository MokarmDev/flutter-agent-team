import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED_REF_APPS, lintReferenceApps } from '../reference-apps.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function tempRoot() {
  return mkdtempSync(path.join(tmpdir(), 'fat-ref-'));
}

test('EXPECTED_REF_APPS matches documented reference apps', () => {
  assert.deepEqual(EXPECTED_REF_APPS, ['clean-bloc', 'mvvm-cubit']);
});

test('lintReferenceApps fails when references/ is missing', async () => {
  const root = tempRoot();
  try {
    const msgs = await lintReferenceApps(root);
    assert.ok(msgs.some((m) => m.includes('references/: missing')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('lintReferenceApps fails when an expected app is missing', async () => {
  const root = tempRoot();
  try {
    mkdirSync(path.join(root, 'references', 'clean-bloc'), { recursive: true });
    const msgs = await lintReferenceApps(root);
    assert.ok(msgs.some((m) => m === 'references/mvvm-cubit: missing'));
    assert.ok(!msgs.some((m) => m.includes('references/: missing')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('lintReferenceApps fails when required project files are missing', async () => {
  const root = tempRoot();
  try {
    for (const app of EXPECTED_REF_APPS) {
      mkdirSync(path.join(root, 'references', app, 'lib/core'), { recursive: true });
      writeFileSync(path.join(root, 'references', app, 'lib/core', 'x.dart'), '// shared\n');
    }
    const msgs = await lintReferenceApps(root);
    assert.ok(msgs.some((m) => m.includes('missing .agent-team.yaml')));
    assert.ok(msgs.some((m) => m.includes('missing docs/agent-context.md')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('lintReferenceApps fails when lib/core differs across apps', async () => {
  const root = tempRoot();
  try {
    for (const app of EXPECTED_REF_APPS) {
      const base = path.join(root, 'references', app);
      mkdirSync(path.join(base, 'lib/core'), { recursive: true });
      mkdirSync(path.join(base, 'docs'), { recursive: true });
      writeFileSync(path.join(base, '.agent-team.yaml'), 'version: 1\n');
      writeFileSync(path.join(base, 'docs/agent-context.md'), '# ctx\n');
      writeFileSync(
        path.join(base, 'lib/core/x.dart'),
        app === 'clean-bloc' ? '// a\n' : '// b\n',
      );
    }
    const msgs = await lintReferenceApps(root);
    assert.ok(msgs.some((m) => m.includes('lib/core/x.dart differs')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('lintReferenceApps accepts the repository references/ tree', async () => {
  const msgs = await lintReferenceApps(ROOT);
  assert.deepEqual(msgs, []);
});
